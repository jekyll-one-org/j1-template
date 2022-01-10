# frozen_string_literal: true
# require "futils"

module J1
  module Commands
    class Setup < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:setup) do |c|
            c.description 'Initialize a J1 project for first use'
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
              J1.logger.info "SETUP: Install build-in patches skipped ..."
            else
              patch_install(options)
            end
            J1.logger.info "SETUP: Initialize the project ..."
            J1.logger.info "SETUP: Be patient, this will take a while ..."
            # process, output = J1::Utils::Exec.run('npm', 'run', 'setup')
            # output.to_s.each_line do |line|
            #   J1.logger.info('SETUP:', line.strip) unless line.to_s.empty?
            # end
            process = J1::Utils::Exec2.run('SETUP','npm', 'run', 'setup')
            if process.success?
              J1.logger.info "SETUP: Initializing the project finished successfully."
              J1.logger.info "SETUP: To open your site, run: j1 site"
            else
              raise SystemExit
              end
          else
            raise SystemExit
          end
        end

        private

        def bundle_install(path, options)
          J1::External.require_with_graceful_fail 'bundler'
          J1.logger.info "SETUP: Running bundle install in #{path} ..."
          Dir.chdir(path) do
            if options['system']
              J1.logger.info "SETUP: Install bundle in Ruby gem SYSTEM folder ..."
            else
              J1.logger.info "SETUP: Install bundle in USER gem folder ~/.gem ..."
              process = J1::Utils::Exec2.run('SETUP','bundle', 'config', 'set', '--local', 'path', '~/.gem')
              raise SystemExit unless process.success?
            end
            process = J1::Utils::Exec2.run('SETUP','bundle', 'install')
            raise SystemExit unless process.success?
          end
        end

        def patch_install(options)
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
              J1.logger.info "SETUP: Install patches in SYSTEM folder ..."
              J1.logger.info "SETUP: Install patches on path #{system_path} ..."
              dest = system_path + '/gems/' + patch_gem_eventmachine + '/lib'
            else
              J1.logger.info "SETUP: Install patches in USER gem folder ~/.gem ..."
              J1.logger.info "SETUP: Install patches on path #{user_path} ..."
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
                J1.logger.info "SETUP: Skipped install patches for execjs-2.7.0 ..."
              end
            end

          end
        end
      end
    end
  end
end
