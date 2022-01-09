# frozen_string_literal: true

module J1
  module Commands
    class Site < Command
      #noinspection MissingYardParamTag
      class << self

        def init_with_program(prog)
          prog.command(:site) do |c|
            c.description 'Run the website of a J1 project'
            c.syntax 'site'
            c.action do |args, options|
              J1::Commands::Site.process(args, options)
            end
          end
        end

        def process(args, options = {})
          J1.logger.info "SITE: Starting up your site ..."
          J1::Utils::ExecUntilTrap.run('SITE','npm', 'run', 'j1-site')
        end

      end
    end
  end
end
