# frozen_string_literal: true
# require "futils"

module J1
  module Commands
    class Setup < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:setup) do |c|
            c.description 'Initialize a J1 Project for first use'
            c.syntax 'setup'
            c.option 'force', '--force',                ' Force to install patches even already exists'
            c.option 'system', '--system',              ' Install patches on the Ruby SYSTEM gem folder'
            c.option 'skip-patches', '--skip-patches',  'Skip install any PATCHES build-in with J1'
            c.action do |args, options|
              J1::Commands::Setup.process(args, options)
            end
          end
        end

        def process(args, options = {})
          @args = args
          path = File.expand_path(Dir.getwd)

          if J1::Utils::is_project?
            bundle_install(path, options)
            if options['skip-patches']
              J1.logger.info "#{timestamp} - SETUP: installing build-in patches skipped."
            else
              patch_install(options)
            end

            timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
            J1.logger.info "#{timestamp} - SETUP: initializing the project .."
            J1.logger.info "#{timestamp} - SETUP: be patient, this will take a while .."
            # process, output = J1::Utils::Exec.run('npm', 'run', 'setup')
            # output.to_s.each_line do |line|
            #   J1.logger.info('SETUP:', line.strip) unless line.to_s.empty?
            # end
            process = J1::Utils::Exec2.run('SETUP','npm', 'run', 'setup')
            if process.success?
              timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
              J1.logger.info "#{timestamp} - SETUP: initializing the project finished successfully."
              J1.logger.info "#{timestamp} - SETUP: to open your site, run: j1 site"
            else
              raise SystemExit
              end
          else
            raise SystemExit
          end
        end

        private

        def bundle_install(path, options)
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          J1::External.require_with_graceful_fail 'bundler'
          J1.logger.info "#{timestamp} - SETUP: running bundle install on path: #{path}."
          Dir.chdir(path) do
            if options['system']
              J1.logger.info "#{timestamp} - SETUP: installing bundle in ruby gem SYSTEM folder."
            else
              J1.logger.info "#{timestamp} - SETUP: installing bundle in ruby gem USER folder."
              process = J1::Utils::Exec2.run('SETUP','bundle', 'config', 'set', '--local', 'path', '~/.gem')
              raise SystemExit unless process.success?
            end
            process = J1::Utils::Exec2.run('SETUP','bundle', 'install')
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
            raise SystemExit unless process.success?

            result = output.split(';')
            user_path = result[0]
            system_path = result[1]

            if options['system']
              J1.logger.info "#{timestamp} - SETUP: installing patches on SYSTEM gem folder."
              J1.logger.info "#{timestamp} - SETUP: Install patches on path: #{system_path} .."
              dest = system_path + '/gems/' + patch_gem_eventmachine + '/lib'
            else
              J1.logger.info "#{timestamp} - SETUP: installing patches on USER gem folder."
              J1.logger.info "#{timestamp} - SETUP: installing patches on path: #{user_path} .."
              dest = user_path + '/gems/' + patch_gem_eventmachine + '/lib'
            end
            src = patch_eventmachine_source_path
            FileUtils.cp_r(src, dest)

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
                J1.logger.info "#{timestamp} - SETUP: installing patches skipped for execjs v2.7.0."
              end
            end

          end
        end
      end
    end
  end
end
