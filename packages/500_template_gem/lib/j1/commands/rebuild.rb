# frozen_string_literal: true

module J1
  module Commands
    class Rebuild < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:rebuild) do |c|
            c.description 'Rebuild the J1 projects website'
            c.syntax 'rebuild'
            c.action do |args, options|
              J1::Commands::Rebuild.process(args, options)
            end
          end
        end

        def process(args, options = {})
          if J1::Utils::is_project?
            if J1::Utils::is_project_setup?
              J1.logger.info "REBUILD: Rebuild the projects website ..."
              J1.logger.info "REBUILD: Be patient, this will take a while ..."
              process = J1::Utils::Exec2.run('REBUILD','npm', 'run', 'rebuild')
              if process.success?
                J1.logger.info "REBUILD: The projects website has been rebuild successfully."
                J1.logger.info "REBUILD: To open the site, run: j1 site"
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
