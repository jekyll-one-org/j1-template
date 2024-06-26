# frozen_string_literal: true

module J1
  module Commands
    class Help < Command
      class << self

        def init_with_program(prog)
          prog.command(:help) do |c|
            c.syntax "help [subcommand]"
            c.description "Show the help message, optionally for a given subcommand"

            c.action do |args, _|
              cmd = (args.first || "").to_sym
              if args.empty?
                J1.logger.info prog.to_s
              elsif prog.has_command? cmd
                J1.logger.info prog.commands[cmd].to_s
              else
                invalid_command(prog, cmd)
                abort
              end
            end
          end
        end

        def invalid_command(prog, cmd)
          J1.logger.error "Error:",
                              "Hmm... we don't know what the '#{cmd}' command is."
          J1.logger.info  "Valid commands:", prog.commands.keys.join(", ")
        end
      end
    end
  end
end
