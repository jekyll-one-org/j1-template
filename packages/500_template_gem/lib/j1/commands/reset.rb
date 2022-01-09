# frozen_string_literal: true

module J1
  module Commands
    class Reset < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:reset) do |c|
            c.description 'Reset a J1 project to factory state'
            c.syntax 'reset'
            c.action do |args, options|
              J1::Commands::Reset.process(args, options)
            end
          end
        end

        def process(args, options = {})
          J1.logger.info "RESET: Reset the project to factory state ..."
          J1.logger.info "RESET: Be patient, this will take a while ..."
          process, output = J1::Utils::Exec.run('npm', 'run', 'reset')
          output.to_s.each_line do |line|
            J1.logger.info('RESET:', line.strip) unless line.to_s.empty?
          end
          if process.success?
            J1.logger.info "RESET: The project reset finished successfully."
          else
            raise SystemExit
          end
        end

      end
    end
  end
end
