require "erb"

module J1
  module Commands
    class Module < Command
      class << self
        def init_with_program(prog)

          prog.command(:new) do |c|
            c.syntax "module MOD_NAME [option]"
            c.description "Manages a module MOD_NAME"

            c.option "register", "--register", "Registers a module MOD_NAME"
            c.option "list", "--list", "List all registered modules"
            c.option "detail", "--detail", "List details of a registered module MOD_NAME"

            c.action do |args, options|
              J1::Commands::Modules.process(args, options)
            end
          end

        end

        def process(args, options = {})
          raise ArgumentError, "You must specify a path." if args.empty?

          new_blog_path = File.expand_path(args.join(" "), Dir.pwd)
          FileUtils.mkdir_p new_blog_path
          if preserve_source_location?(new_blog_path, options)
            J1.logger.abort_with "Conflict:",
                                     "#{new_blog_path} exists and is not empty."
          end

          if options["blank"]
            create_blank_site new_blog_path
          else
            create_site new_blog_path
          end

          after_install(new_blog_path, options)
        end

        def create_blank_site(path)
          Dir.chdir(path) do
            FileUtils.mkdir(%w(_layouts _posts _drafts))
            FileUtils.touch("index.html")
          end
        end

        def scaffold_post_content
          ERB.new(File.read(File.expand_path(scaffold_path, starter_web))).result
        end

        # Internal: Gets the filename of the sample post to be created
        #
        # Returns the filename of the sample post, as a String
        def initialized_post_name
          "_posts/#{Time.now.strftime("%Y-%m-%d")}-welcome-to-jekyll.markdown"
        end

        private

        def register_module(new_blog_path)
        end

      end
    end
  end
end
