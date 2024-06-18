# frozen_string_literal: true

module J1
  module Commands
    class Reset < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:reset) do |c|
            c.description 'Reset a J1 Project to factory state'
            c.syntax 'reset'
            c.action do |args, options|
              J1::Commands::Reset.process(args, options)
            end
          end
        end

        def process(args, options = {})
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          if J1::Utils::is_project?
            if J1::Utils::is_project_setup?
              J1.logger.info "#{timestamp} - RESET: reset the project to factory state .."
              J1.logger.info "#{timestamp} - RESET: be patient, this will take a while .."
              process = J1::Utils::Exec2.run('RESET','npm', 'run', 'reset')
              if process.success?
                timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
                J1.logger.info "#{timestamp} - RESET: resetting the project finished successfully."
                J1.logger.info "#{timestamp} - RESET: to setup the project, run: j1 setup"
              else
                raise SystemExit
              end
            else
              raise SystemExit
            end
          else
            raise SystemExit
          end
        end

      end
    end
  end
end
