require "open3"

module J1
  module Utils
    module ExecUntilTrap
      extend self

      # Runs a program in a sub-shell and exits on Ctrl+C.
      #
      # title - Trailing line title for the output on stdout
      # *args - a list of strings containing the program name and (followed by) arguments
      #
      def run(title, *args)
        Open3.popen3(*args) do |stdin, stdout, stderr|
          trap('INT') {
            puts "#{title}: Received Ctrl-C to stop"
            raise SystemExit
          }
          stdout.each_line do |line|
            puts "#{title}: #{line}"
          end
        end
        [stdin, stdout, stderr].each(&:close)
      end

    end
  end
end