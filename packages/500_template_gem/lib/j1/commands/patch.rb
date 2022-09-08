# frozen_string_literal: true

module J1
  module Commands
    class Patch < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:patch) do |c|
            c.description 'Install patches available for a J1 Project'
            c.syntax 'patch'
            c.option 'force', '--force',                'Force to install patches even already exists'
            c.option 'system', '--system',              'Install patches on the Ruby SYSTEM gem folder'
            c.action do |args, options|
              J1::Commands::Patch.process(args, options)
            end
          end
        end

        def process(args, options = {})
          @args = args
          patch_install(options)
        end

        private

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
              J1.logger.info "PATCH: Install patches in SYSTEM folder ..."
              J1.logger.info "PATCH: Install patches on path #{system_path} ..."
              dest = system_path + '/gems/' + patch_gem_eventmachine + '/lib'
            else
              J1.logger.info "PATCH: Install patches in USER gem folder ~/.gem ..."
              J1.logger.info "PATCH: Install patches on path #{user_path} ..."
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
                J1.logger.info "PATCH: Skipped install patches for execjs-2.7.0 ..."
              end
            end

          end
        end
      end
    end
  end
end
