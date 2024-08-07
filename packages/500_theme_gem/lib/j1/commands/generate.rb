# frozen_string_literal: true

require 'erb'

module J1
  module Commands
    class Generate < Command
      class << self

        def init_with_program(prog)
          prog.command(:generate) do |c|
            c.description 'Generates a J1 Project scaffold in PATH'
            c.syntax 'generate PATH'
            c.option 'force', '--force',                'Force a site to be created even the PATH already exists'
            c.option 'skip-bundle', '--skip-bundle',    'Skip bundle install'
            c.option 'skip-patches', '--skip-patches',  'Skip install any PATCHES build-in with J1'
            c.option 'system', '--system',              'Run "bundle install" for the Ruby SYSTEM gem folder'
            c.action do |args, options|
              J1::Commands::Generate.process(args, options)
            end
          end
        end

        def process(args, options = {})
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          raise ArgumentError, "#{timestamp} - GENERATE: you need to specify a path." if args.empty?

          new_blog_path = File.expand_path(args.join(' '), Dir.pwd)
          FileUtils.mkdir_p new_blog_path
          if preserve_source_location?(new_blog_path, options)
            J1.logger.abort_with "#{timestamp} - GENERATE: conflict detected:", "#{new_blog_path} exists and is not empty."
          end

          if options['blank']
            create_blank_site new_blog_path
          else
            create_site new_blog_path
          end

          after_install(new_blog_path, options)
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          J1.logger.info "#{timestamp} - GENERATE: creating site finished."
          J1.logger.info "#{timestamp} - GENERATE: for setup, change to project folder: #{new_blog_path}"
          J1.logger.info "#{timestamp} - GENERATE: and run: j1 setup."
          puts " "
        end

        def create_blank_site(path)
          Dir.chdir(path) do
            FileUtils.mkdir(%w(_layouts posts/public/featured/_posts _drafts))
            FileUtils.touch('index.html')
          end
        end

        def scaffold_post_content
          ERB.new(File.read(File.expand_path(scaffold_path, starter_web))).result
        end

        # Internal: Gets the filename of the sample post to be created
        # Returns the filename of the sample post, as a String
        def initialized_post_name
          "collections/posts/public/featured/_posts/#{Time.now.strftime("%Y-%m-%d")}-welcome-to-j1.adoc"
        end

        private

        def create_site(new_blog_path)
          create_sample_files new_blog_path

          File.open(File.expand_path(initialized_post_name, new_blog_path), 'w') do |f|
            f.write(scaffold_post_content)
          end
        end

        def preserve_source_location?(path, options)
          !options['force'] && !Dir["#{path}/**/*"].empty?
        end

        def create_sample_files(path)
          FileUtils.cp_r starter_web + '/.', path
          FileUtils.rm File.expand_path(scaffold_path, path)
        end

        def starter_web
          File.expand_path('../../starter_web', File.dirname(__FILE__))
        end

        def scaffold_path
          'collections/posts/public/featured/_posts/0000-00-00-welcome-to-j1.adoc.erb'
        end

        # After a generate blog has been created, print a success notification and
        # then automatically execute bundle install from within the generate blog dir
        # unless the user opts to generate a blank blog or skip 'bundle install'.
        # --------------------------------------------------------------------------
        def after_install(path, options = {})
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          unless options['skip-bundle']
            bundle_install(path, options)
            if options['skip-patches']
              J1.logger.info "#{timestamp} - GENERATE: installalling build-in patches skipped."
            else
              patch_install(options)
            end
          end
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          if options['force']
            J1.logger.info "#{timestamp} - GENERATE: generated site installed forced in folder: #{path}"
          else
            J1.logger.info "#{timestamp} - GENERATE: generated site installed in folder: #{path}"
          end
          J1.logger.info "#{timestamp} - GENERATE: installation of ruby gems (bundle) skipped." if options['skip-bundle']
        end

        def bundle_install(path, options)
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          J1::External.require_with_graceful_fail 'bundler'
          J1.logger.info "#{timestamp} - GENERATE: running bundle install in path: #{path} .."
          Dir.chdir(path) do
            if options['system']
              J1.logger.info "#{timestamp} - GENERATE: install bundle in ruby gem SYSTEM folder .."
            else
              J1.logger.info "#{timestamp} - GENERATE: install bundle in gem USER folder ~/.gem .."
              process = J1::Utils::Exec2.run('GENERATE','bundle', 'config', 'set', '--local', 'path', '~/.gem')
              raise SystemExit unless process.success?
            end
            process = J1::Utils::Exec2.run( 'GENERATE', 'bundle', 'install')
            raise SystemExit unless process.success?
          end
        end

        def patch_install(options)
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          if J1::Utils::is_windows?
            major, minor = RUBY_VERSION.split('.')
            lib_version = major + '.' + minor
            curr_path = File.expand_path(File.dirname(File.dirname(__FILE__)))
            patch_gem_eventmachine = 'eventmachine-1.2.7-x64-mingw32'
            patch_gem_execjs = 'execjs-2.7.0'
            patch_eventmachine_source_path = curr_path + '/patches/rubygems' + '/' + patch_gem_eventmachine + '/lib/' + lib_version
            patch_execjs_source_path = curr_path + '/patches/rubygems' + '/' + patch_gem_execjs + '/lib/execjs/external_runtime.rb'

            process, output = J1::Utils::Exec1.run('gem', 'env', 'gempath')
            output.to_s.each_line do |line|
              J1.logger.info("#{timestamp} - GENERATE: ", line.strip) unless line.to_s.empty?
            end
            raise SystemExit unless process.success?

            result = output.split(';')
            user_path = result[0]
            system_path = result[1]
            timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")

            if options['system']
              J1.logger.info "#{timestamp} - GENERATE: installing patches in SYSTEM folder."
              J1.logger.info "#{timestamp} - GENERATE: installing patches on path: #{system_path} .."
              dest = system_path + '/gems/' + patch_gem_eventmachine + '/lib'
            else
              J1.logger.info "#{timestamp} - GENERATE: installing patches in USER gem folder."
              J1.logger.info "#{timestamp} - GENERATE: installalling patches on path: #{user_path} .."
              dest = user_path + '/gems/' + patch_gem_eventmachine + '/lib'
            end

            src = patch_eventmachine_source_path

            # Added to support Ruby V3.x.
            if Dir.exist?(dest)
              #             FileUtils.cp(src, dest)
              J1.logger.info "#{timestamp} - GENERATE: installing patches: already installed: installation skipped."
            else
              # Create path (eventmachine-1.2.7-x64-mingw32) for Ruby V3
              FileUtils.mkdir_p dest
              FileUtils.cp_r(src, dest)
              J1.logger.info "#{timestamp} - GENERATE: installing patches: successful."
            end

            if lib_version === '2.7'
              if options['system']
                dest = system_path + '/gems/' + patch_gem_execjs + '/lib/execjs'
              else
                dest = user_path + '/gems/' + patch_gem_execjs + '/lib/execjs'
              end
              src = patch_execjs_source_path
              if Dir.exist?(dest)
                FileUtils.cp(src, dest)
              else
                J1.logger.info "#{timestamp} - GENERATE: installing patches: skipped patches for execjs v2.7.0."
              end
            end

          end
        end
      end
    end
  end
end
