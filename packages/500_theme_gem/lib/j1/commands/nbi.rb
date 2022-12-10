# frozen_string_literal: true

module J1
  module Commands
    class Nbi < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:nbi) do |c|
            c.description 'Run an export of all textbooks for all Juyper Notebooks available'
            c.syntax 'nbi'
            c.action do |args, options|
              J1::Commands::Nbi.process(args, options)
            end
          end
        end

        def process(args, options = {})
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          if J1::Utils::is_project?
            if J1::Utils::is_project_setup?
              J1.logger.info "#{timestamp} - NBI: Exporting nbinteract textbooks ..."
              process = J1::Utils::Exec2.run('NBI','npm', 'run', 'nbi-export--all')
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
