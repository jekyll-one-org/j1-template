# frozen_string_literal: true

module J1
  module Commands
    class Rebuild < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:rebuild) do |c|
            c.description 'Rebuild a J1 Project'
            c.syntax 'rebuild'
            c.action do |args, options|
              J1::Commands::Rebuild.process(args, options)
            end
          end
        end

        def process(args, options = {})
          if J1::Utils::is_project?
            if J1::Utils::is_project_setup?
              timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
              J1.logger.info "#{timestamp} - REBUILD: rebuild the projects website .."
              J1.logger.info "#{timestamp} - REBUILD: be patient, this will take a while .."
              process = J1::Utils::Exec2.run('REBUILD','npm', 'run', 'rebuild')
              if process.success?
                J1.logger.info "#{timestamp} - REBUILD: the project has been rebuild successfully."
                J1.logger.info "#{timestamp} - REBUILD: to open the site, run: j1 site"
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
