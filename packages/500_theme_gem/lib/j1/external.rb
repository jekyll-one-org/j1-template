module J1
  module External
    class << self
      #
      # Gems that, if installed, should be loaded.
      # Usually contain subcommands.
      # ------------------------------------------------------------------------
      def blessed_gems
        %w(
          jekyll-docs
          jekyll-import
        )
      end

      #
      # Require a gem or file if it's present, otherwise silently fail.
      #
      # names - a string gem name or array of gem names
      #
      def require_if_present(names)
        Array(names).each do |name|
          begin
            require name
          rescue LoadError
            J1.logger.debug "could not load #{name}, skipped."
            yield(name) if block_given?
            false
          end
        end
      end

      #
      # Require a gem or gems. If it's not present, show a very nice error
      # message that explains everything and is much more helpful than the
      # normal LoadError.
      #
      # names - a string gem name or array of gem names
      # ------------------------------------------------------------------------
      def require_with_graceful_fail(names)
        Array(names).each do |name|
          begin
            J1.logger.debug "Requiring:", name.to_s
            require name
          rescue LoadError => e
            J1.logger.error "Dependency Error:", <<-MSG
Yikes! It looks like you don't have #{name} or one of its dependencies installed.
In order to use Jekyll as currently configured, you'll need to install this gem.

The full error message from Ruby is: '#{e.message}'

If you run into trouble, you can find helpful resources at https://jekyllrb.com/help/!
            MSG
            raise J1::Errors::MissingDependencyException, name
          end
        end
      end
    end
  end
end
