# frozen_string_literal: true

module J1
  module Commands
    class App < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:app) do |c|
            c.description 'Run the site as an WebApp'
            c.syntax 'app'
            c.action do |args, options|
              J1::Commands::App.process(args, options)
            end
          end
        end

        def process(args, options = {})
          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          if J1::Utils::is_project?
            if J1::Utils::is_project_setup?
              J1.logger.info "#{timestamp} - APP: Starting up your site ..."
              process = J1::Utils::Exec2.run('APP','npm', 'run', 'j1-app')
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
