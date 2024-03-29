require "open3"

module J1
  module Utils
    module Exec1
      extend self

      # Runs a program in a sub-shell.
      #
      # *args - a list of strings containing the program name and arguments
      #
      # Returns a Process::Status and a String of output in an array in
      # that order.
      def run(*args)
        stdin, stdout, stderr, process = Open3.popen3(*args)
        out = stdout.read.strip
        err = stderr.read.strip

        [stdin, stdout, stderr].each(&:close)
        [process.value, out + ';' + err]
      end

    end
  end
end
