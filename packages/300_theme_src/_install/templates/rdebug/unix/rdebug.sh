bundle exec /home/jadams/j1_quickstart/ruby/bin/ruby \
  /home/jadams/j1_quickstart/ruby/lib/ruby/gems/2.3.0/gems/ruby-debug-ide-0.7.0.beta7/bin/rdebug-ide \
   --port 1234 \
   --host 0.0.0.0 \
   -- /home/jadams/j1_quickstart/ruby/lib/ruby/gems/2.3.0/bin/rackup \
   -s webrick \
   -o 0.0.0.0 \
   -p 5000 \
   /home/jadams/j1webs/starter/config.ru  2>&1 |\
   grep -i info