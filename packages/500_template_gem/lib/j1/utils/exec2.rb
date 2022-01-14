require "open3"

module J1
  module Utils
    module Exec2
      extend self

      # Runs a program in a sub-shell and return a Process::Status on exit
      #
      # title - prepend a title on all messages
      # *args - a list of strings containing the program name and arguments
      #
      def run(title, *args)
        Open3.popen3(*args) do |stdin, stdout, stderr, status|

          # manage software interrupt on Ctrl-C
          trap('INT') {
            puts "#{title}: Received Ctrl-C to stop"
            [stdin, stdout, stderr].each(&:close)
            raise SystemExit
          }

          # manage messages on stdout
          stdout_thr = Thread.new do
            # exit the tread silently
            Thread.current.report_on_exception = false
            stdout.each_line do |line|
              timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
              puts "#{timestamp} - #{title}: #{line}"
            end
          end

          # manage messages on stdout
          stderr_thr = Thread.new do
            # exit the tread silently
            Thread.current.report_on_exception = false
            stderr.each_line do |line|
              puts "\e[31m" + "#{title}: #{line}" + "\e[0m"
            end
          end

          # combine channels stdout, stderr for output
          [stdout_thr, stderr_thr].each(&:join)

          # close channels explicitly to exit gracefully
          [stdin, stdout, stderr].each(&:close)

          # exit and return Process::Status
          status.value
        end
      end

    end
  end
end
