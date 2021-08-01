module J1App
  class SiteManager < Sinatra::Base

    # ==========================================================================
    # Sinatra Framework settings
    # ==========================================================================

    # Additional (response) header properties managed by Sinatra::Base
    # NOTE: for the static content 'Access-Control-Allow-Origin'
    # is NOT needed ???
    # --------------------------------------------------------------------------
    # NOTE: Response header properties are currently set
    # by HAProxy for production !!!
    # --------------------------------------------------------------------------
    # before do
    #   response.headers['Access-Control-Allow-Origin']   = '*'
    #   response.headers['X-Powered-By']                  = 'J1 Template'
    # end

    # NOTE: https://stackoverflow.com/questions/7847536/sinatra-in-facebook-iframe
    #
    #set :protection, :except => :frame_options

    # Check: http://sinatrarb.com/intro.html
    #
    #set :static_cache_control, [:public, :max_age => 10]

    # Sinatra extension 'sinatra-cross_origin' to enable CORS
    # See: https://github.com/britg/sinatra-cross_origin
    # Resource Sharing (CORS).
    # See more on cross domain resource sharing with:
    #   https://developer.mozilla.org/En/HTTP_access_control
    # --------------------------------------------------------------------------
    # register Sinatra::CrossOrigin
    # configure do
    #   enable :cross_origin
    # end

    # OPTION BLOCK for Sinatra extension 'sinatra-cross_origin'
    # Send a HTTP 200 response on the CORS preflight request (browser)
    # --------------------------------------------------------------------------
    # options "*" do
    #   response.headers["Allow"]                         = "GET, POST, OPTIONS"
    #   response.headers["Access-Control-Allow-Headers"]  = "Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token, X-Page-ID, X-Powered-By"
    #   200
    # end

    # Register static content
    # --------------------------------------------------------------------------
    register Sinatra::Index
    root = File.expand_path(J1App.destination, J1App.project_path)
    set :public_folder, root
    use_static_index "index.html"

    error 400 do
      four_oh_oh = File.expand_path(settings.public_folder + "/400.html", Dir.pwd)
      File.read(four_oh_oh) if File.exist?(four_oh_oh)
    end

    error 401 do
      four_oh_one = File.expand_path(settings.public_folder + "/401.html", Dir.pwd)
      File.read(four_oh_one) if File.exist?(four_oh_one)
    end

    error 403 do
      four_oh_three = File.expand_path(settings.public_folder + "/403.html", Dir.pwd)
      File.read(four_oh_three) if File.exist?(four_oh_three)
    end

    error 404 do
      four_oh_four = File.expand_path(settings.public_folder + "/404.html", Dir.pwd)
      File.read(four_oh_four) if File.exist?(four_oh_four)
    end

    error 500 do
      five_oh_oh = File.expand_path(settings.public_folder + "/500.html", Dir.pwd)
      File.read(five_oh_oh) if File.exist?(five_oh_oh)
    end

    error 501 do
      five_oh_one = File.expand_path(settings.public_folder + "/501.html", Dir.pwd)
      File.read(five_oh_one) if File.exist?(five_oh_one)
    end

    error 502 do
      five_oh_two = File.expand_path(settings.public_folder + "/502.html", Dir.pwd)
      File.read(five_oh_two) if File.exist?(five_oh_two)
    end

    error 533 do
      five_three_three = File.expand_path(settings.public_folder + "/533.html", Dir.pwd)
      File.read(five_three_three) if File.exist?(five_three_three)
    end

  end
end
