require 'erb'
require 'rbconfig'
require 'fileutils'

module J1
  module Commands
    class Generate < Command
      class << self
        def init_with_program(prog)

          prog.command(:generate) do |c|
            c.syntax 'generate PATH'
            c.description 'Generates a starter site scaffold in PATH'
            c.option 'force', '--force', 'Force a site to be created even the PATH already exists'
            c.option 'skip-bundle', '--skip-bundle', "Skip 'bundle install'"
            c.option "skip-patches", "--skip-patches", "Skip to install any PATCHES buildin with J1"
            c.option "system", "--system", "Run 'bundle install' for the Ruby SYSTEM gem folder"
            c.action do |args, options|
              J1::Commands::Generate.process(args, options)
            end
          end

        end

        def is_windows?
          RbConfig::CONFIG["host_os"] =~ %r!mswin|mingw|cygwin!i
        end

        def process(args, options = {})
          raise ArgumentError, 'You must specify a path.' if args.empty?
          new_blog_path = File.expand_path(args.join(' '), Dir.pwd)
          FileUtils.mkdir_p new_blog_path
          if preserve_source_location?(new_blog_path, options)
            J1.logger.abort_with 'Conflict:', "#{new_blog_path} exists and is not empty."
          end

          if options['blank']
            create_blank_site new_blog_path
          else
            create_site new_blog_path
          end

          after_install(new_blog_path, options)
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
        def after_install(path, options = {})
          unless options['skip-bundle']
            bundle_install(path, options)
            unless options['skip-patches']
              patch_install(options)
            else
              J1.logger.info "Install patches skipped ..."
            end
          end
          unless options['force']
            J1.logger.info "Generated Jekyll site installed in folder #{path}"
          else
            J1.logger.info "Generated Jekyll site force installed in folder #{path}"
          end
          J1.logger.info 'Installation (bundle) of RubyGems skipped' if options['skip-bundle']
        end

        def bundle_install(path, options)
          J1::External.require_with_graceful_fail 'bundler'
          J1.logger.info "Running bundle install in #{path} ..."
          Dir.chdir(path) do
            if options['system']
              J1.logger.info "Install bundle in Ruby gem SYSTEM folder ..."
            else
              J1.logger.info "Install bundle in USER gem folder ~/.gem ..."
              process, output = J1::Utils::Exec.run('bundle', 'config', 'set', '--local', 'path', '~/.gem')
            end
            process, output = J1::Utils::Exec.run('bundle', 'install')
            output.to_s.each_line do |line|
              J1.logger.info('Bundler:', line.strip) unless line.to_s.empty?
            end
            raise SystemExit unless process.success?
          end
        end

        def patch_install(options)
          if is_windows?
            curr_path = File.expand_path(File.dirname(File.dirname(__FILE__)))
            patch_gem = 'eventmachine-1.2.7-x64-mingw32'
            patch_source_path = curr_path + '/../patches/rubygems' + '/' + patch_gem + '/lib/2.6'

            J1.logger.info "Install patches in USER gem folder ~/.gem ..."
            process, output = J1::Utils::Exec.run('gem', 'env', 'gempath')
            raise SystemExit unless process.success?

            result = output.split(';')
            user_path = result[0]
            system_path = result[1]
            if options['system']
              J1.logger.info "Install patches on path #{system_path} ..."
              dest = system_path + '/gems/' + patch_gem + '/lib'
            else
              J1.logger.info "Install patches on path #{user_path} ..."
              dest = user_path + '/gems/' + patch_gem + '/lib'
            end
            src = patch_source_path
            FileUtils.cp_r(src, dest)
          end
        end

      end
    end
  end
end
