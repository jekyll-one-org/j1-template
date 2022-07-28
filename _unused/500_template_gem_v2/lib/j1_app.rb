# frozen_string_literal: true

# NOTES
# ------------------------------------------------------------------------------
# frozen_string_literal
#
# frozen_string_literal implies that all string literals in the file
# are implicitly frozen, as if #freeze had been called on each of them.
# That is, if a string literal is defined in a file with this comment, and
# you call a method on that string which modifies it, such as <<, you'll
# get RuntimeError: can't modify frozen String.

# Require RubyGems
# ------------------------------------------------------------------------------
# require 'uuid'
require 'date'

require 'json'
require 'safe_yaml'
require 'rest-client'

require 'rack'
require 'rack/protection'
require 'omniauth'
require 'omniauth-oauth2'
require 'sinatra'
# require 'sinatra/cross_origin'
require 'warden'

require 'log4r'
# require 'log4r/yamlconfigurator'
require_relative 'j1_app/log4r/yamlconfigurator'
require 'log4r/outputter/datefileoutputter'
require 'log4r/outputter/emailoutputter'
include Log4r

# Require local Rubies
# ------------------------------------------------------------------------------
require_relative 'j1_app/sinatra/extras/cookies'
require_relative 'j1_app/sinatra/extras/index'

require_relative 'j1_app/omniauth/strategies/patreon'
require_relative 'j1_app/omniauth/strategies/disqus'
require_relative 'j1_app/omniauth/strategies/facebook'
require_relative 'j1_app/omniauth/strategies/github'
require_relative 'j1_app/omniauth/strategies/twitter'

require_relative 'j1_app/j1_auth_manager/commands'
require_relative 'j1_app/j1_auth_manager/config'
require_relative 'j1_app/j1_auth_manager/helpers'
require_relative 'j1_app/j1_auth_manager/helpers_disqus'
require_relative 'j1_app/j1_auth_manager/helpers_facebook'
require_relative 'j1_app/j1_auth_manager/helpers_github'
require_relative 'j1_app/j1_auth_manager/helpers_patreon'
require_relative 'j1_app/j1_auth_manager/helpers_twitter'
require_relative 'j1_app/j1_auth_manager/warden_omniauth'

require_relative 'j1_app/j1_auth_manager/auth_manager'
require_relative 'j1_app/j1_site_manager/static_site'

# Main
# ------------------------------------------------------------------------------

# App in production mode
#
module J1App
  def self.site
    Rack::Builder.new do
      use Rack::ShowExceptions                                                  # Middleware. Generate web-based error pages (for Rack)
      use Rack::Deflater                                                        # Middleware. Enable gzip compression for ALL web servers out of Rack
      use J1App::AuthManager                                                    # Middleware. Support authentication methods using OmniAuth
      run J1App::SiteManager                                                    # Run J1App Manager to manage the (static) site as an (Rack-based) Web Application:
    end
  end
end

# App in production mode
#
module J1AppCompress
  def self.site
    Rack::Builder.new do
      use Rack::ShowExceptions                                                  # Middleware. Generate web-based error pages (for Rack)
      use Rack::Deflater                                                        # Middleware. Enable gzip compression for ALL web servers out of Rack
      use J1App::AuthManager                                                    # Middleware. Support authentication methods using OmniAuth
      run J1App::SiteManager                                                    # Run J1App Manager to manage the (static) site as an (Rack-based) Web Application:
    end
  end
end

# App in development mode
#
module J1AppTest
  def self.site
    Rack::Builder.new do
      use Rack::LiveReload                                                      # Middleware. Support Livereload
      use Rack::ShowExceptions                                                  # Middleware. Generate web-based error pages (for Rack)
      use J1App::AuthManager                                                    # Middleware. Support authentication methods using OmniAuth
      run J1App::SiteManager                                                    # Run J1App Manager to manage the (static) site as an (Rack-based) Web Application:
    end
  end
end
