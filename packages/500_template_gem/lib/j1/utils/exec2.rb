require "open3"

module J1
  module Utils
    module Exec2
      extend self

      # Runs a program in a sub-shell.
      #
      # *args - a list of strings containing the program name and arguments
      #
      # Returns a Process::Status and a String of output in an array in
      # that order.
      def run(title, *args)
        # title = 'TITLE'
        Open3.popen3(*args) do |stdin, stdout, stderr, status|
          trap('INT') {
            puts "#{title}: Received Ctrl-C to stop"
            raise SystemExit
          }
          stdout.each_line do |line|
            puts "#{title}: #{line}"
          end
          [stdin, stdout, stderr].each(&:close)
          status.value
        end
      end

    end
  end
end
