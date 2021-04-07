# RuboCops - Documentation
# ------------------------------------------------------------------------------
# See: https://rubocop.readthedocs.io/en/latest/

# RuboCops - Disabled Cops
# ------------------------------------------------------------------------------
# rubocop:disable Metrics/BlockLength
# rubocop:disable Metrics/ClassLength
# rubocop:disable Metrics/LineLength
# rubocop:disable Style/StringLiterals
# rubocop:disable Style/Documentation
# rubocop:disable Metrics/BlockNesting
# rubocop:disable Layout/ClosingParenthesisIndentation
# rubocop:disable Layout/LeadingCommentSpace
# rubocop:disable Layout/EmptyLines
# rubocop:disable Layout/EmptyLinesAroundBlockBody
# rubocop:disable Layout/FirstParameterIndentation
# rubocop:disable Layout/CommentIndentation
# rubocop:disable Layout/AlignParameters
# rubocop:disable Layout/AlignHash
# rubocop:disable Layout/TrailingWhitespace
# rubocop:disable Layout/IndentHash
# rubocop:disable Layout/SpaceAroundOperators
# rubocop:disable Layout/ExtraSpacing
# rubocop:disable Style/UnlessElse
# rubocop:disable Style/HashSyntax
#
# rubocop:disable RubyLocalVariableNamingConvention

# ------------------------------------------------------------------------------
#  ~/lib/j1_auth_manager/auth_manager/.rb
#
#  Provides authentication services based on Warden|OmniAuth
#
#  Product/Info:
#  https://jekyll.one
#
#  Copyright (C) 2021 Juergen Adams
#
#  J1 Template is licensed under the MIT License.
#  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
#
# ------------------------------------------------------------------------------
# NOTES
#
# ------------------------------------------------------------------------------
# frozen_string_literal: true

module J1App
  class AuthManager < Sinatra::Base

    include J1App::Helpers
    include J1App::GithubHelpers

    # ==========================================================================
    # SET j1 project home folder
    # ==========================================================================
    # set project path (preferred set by ENV var J1_PROJECT_HOME )
    #
    project_path = J1App.project_path

    # ==========================================================================
    # CHECK|CREATE project log folder
    # ==========================================================================
    #
  	unless Dir.exist?(File.join(project_path, 'log'))
      FileUtils.mkdir_p(File.join(project_path, 'log/archived'))
    end

    # ==========================================================================
    # Initialize middleware resources
    # test data
    #   disqus_client_id = J1App.oauth_data['disqus']['client_id']
    # ==========================================================================
    oauth_data = J1App.oauth_data

    # ==========================================================================
    # SETUP (log4r) logger
    # ==========================================================================
    log4r_cfg = YamlConfigurator
    log4r_cfg.load_yaml_file(project_path + '/_data/modules/log4r.yml')

    # ==========================================================================
    # ??????????????????
    # ==========================================================================
    oauth_requester = ''

    # ==========================================================================
    # Initialize J1 logger settings
    # ==========================================================================
#   uuid = UUID.new.generate
#   page_id = uuid[25, 37]

    chars = [('a'..'z'), ('A'..'Z'), ('0'..'9')].map(&:to_a).flatten
    page_id = (0...11).map { chars[rand(chars.length)] }.join

    MDC.put('pageID', page_id)
    MDC.put('path', '/')

    j1_mw                             = Log4r::Logger['j1.mw']
    j1_mw_auth_mgr                    = Log4r::Logger['j1.mw.auth_mgr']
    j1_mw_auth_mgr_auth               = Log4r::Logger['j1.mw.auth_mgr.auth']
    j1_mw_auth_mgr_preflight          = Log4r::Logger['j1.mw.auth_mgr.preflight']
    j1_mw_auth_mgr_api_auth           = Log4r::Logger['j1.mw.auth_mgr.api.auth']
    j1_mw_auth_mgr_api_post_auth      = Log4r::Logger['j1.mw.auth_mgr.api.post_auth']
    j1_mw_auth_mgr_api_state          = Log4r::Logger['j1.mw.auth_mgr.api.state']
    j1_mw_auth_mgr_api_log2disk       = Log4r::Logger['j1.mw.auth_mgr.api.log2disk']
    j1_mw_auth_mgr_api_validate       = Log4r::Logger['j1.mw.auth_mgr.api.validate']

    j1_mw_auth_mgr.info 'middleware is being initialized'
    j1_mw_auth_mgr.info 'state: stated'
    j1_mw_auth_mgr.info "project path set to: #{project_path}"

    # ==========================================================================
    # Base App and Warden Framework settings
    # ==========================================================================
    j1_mw_auth_mgr.info 'setup base data'

    provider_site_url_default     = J1App.user_settings['provider_site_url']
    provider_home_url_default     = J1App.user_settings['provider_home_url']
    provider_blog_url_default     = J1App.user_settings['provider_blog_url']
    provider_member_url_default   = J1App.user_settings['provider_member_url']
    provider_privacy_url_default  = J1App.user_settings['provider_privacy_url']

    app_session_data  = {}
    user_session_data = {
        :authenticated        => 'false',
        :requested_page       => '/',
        :user_name            => 'visitor',
        :users_allowed        => 'all',
        :user_id              => 'unknown',
        :provider             => 'j1',
        :provider_membership  => 'guest',
        :provider_site_url    => "#{provider_site_url_default}",
        :provider_home_url    => "#{provider_home_url_default}",
        :provider_blog_url    => "#{provider_blog_url_default}",
        :provider_member_url  => "#{provider_member_url_default}",
        :provider_privacy_url => "#{provider_privacy_url_default}",
        :payment_info         => 'unknown',
        :provider_permissions => ['public'],
        :creator              => 'middleware',
        :writer               => 'middleware',
        :mode                 => 'app'
    }

    # Enable SSL for the rack session if configured
    # --------------------------------------------------------------------------
    require 'rack-ssl-enforcer' if J1App.ssl?
    j1_mw_auth_mgr.info 'enforce ssl encryption' if J1App.ssl?
    use Rack::SslEnforcer if J1App.ssl?

    # Set the session cookie used by Rack to track all relevant data
    # for the authentication service
    # --------------------------------------------------------------------------
    j1_mw_auth_mgr.info 'initialize web session cookie'
    use Rack::Session::Cookie,
        http_only: true,   # if set to 'true', make session cookie visible to the browser (document) for HTTP
        key: 'j1.app.session',
#       same_site: 'None',
        same_site: 'Lax',
        secret: ENV['J1_SESSION_SECRET'] || SecureRandom.hex

    # use Rack::Cache do |config|
    #   #
    #   # ----------------------------------------------------------------------
    #   config.middleware.delete(Rack::Cache)
    # end

    # ==========================================================================
    # Warden Framework initialisation
    # ==========================================================================
    j1_mw_auth_mgr.info 'initialize web session (warden)'

    # Define what (user) data should be put (serialized) into the session
    # on requests and responses from Rack environment into the warden
    # environment (env['warden']).
    # --------------------------------------------------------------------------
    Warden::Manager.serialize_into_session do |user|
      user
    end
    Warden::Manager.serialize_from_session do |user|
      user
    end

    # ==========================================================================
    # Middleware that protects against typical web attacks like CSRF and others.
    # Use of all protections provided. For details, see:
    # https://github.com/sinatra/sinatra/tree/master/rack-protection
    # ==========================================================================
    j1_mw_auth_mgr.info 'initialize web attack protection strategies'
    use Rack::Protection

    # ==========================================================================
    # OmniAuth|Warden Framework initialisation
    # ==========================================================================

    # Set the 'default' authentication strategy and exception handler
    # (for warden) if the user was not explicitly signed in (signin dialog).
    # If 'signin' fails, the default exception 'signin_failure' is thrown
    # (used for all OmniAuth strategies registered).
    # --------------------------------------------------------------------------
    j1_mw_auth_mgr.info "initialize default authentication strategy as:  omni_#{J1App.default_provider}"
    signin_failure = ->(_e) { Rack::Response.new("Can't login", 401).finish }
    use Warden::Manager do |config|
      # OmniAuth strategies are name-spaced by 'omni' (see: warden_omniauth.rb)
      # ------------------------------------------------------------------------
      config.default_strategies :"omni_#{J1App.default_provider}"
      config.failure_app = signin_failure
    end

    j1_mw_auth_mgr.info 'detect and initialize configured authentication strategies (omniauth)'
    j1_mw_auth_mgr.info 'initialize oauth authentication strategy:  patreon' if J1App.active_providers.include? 'patreon'
    j1_mw_auth_mgr.info 'initialize oauth authentication strategy:  disqus' if J1App.active_providers.include? 'disqus'
    j1_mw_auth_mgr.info 'initialize oauth authentication strategy:  facebook' if J1App.active_providers.include? 'facebook'
    j1_mw_auth_mgr.info 'initialize oauth authentication strategy:  github' if J1App.active_providers.include? 'github'
    j1_mw_auth_mgr.info 'initialize oauth authentication strategy:  twitter' if J1App.active_providers.include? 'twitter'

    use OmniAuth::Builder do |config|
      # Rescue OmniAuth::Strategies::OAuth2::CallbackError
      # ------------------------------------------------------------------------
      config.on_failure do
        new_path = '/redirect_on_failure'
        Rack::Response.new(['302 Moved'], 302, 'Location' => new_path).finish
      end

      # Detect and set supported authentication strategies for OmniAuth
      # ------------------------------------------------------------------------

      # Additional (strategy) option skip_extra, default: true
      #
      # If true, skips the collection of raw data (extra) to NOT blow
      # up the session cookie (as it is limited to 4K)
      skip_extra = true

      if J1App.active_providers.include? 'disqus'
        scope             = J1App.auth_config['providers']['disqus']['scope'].join(',')
        data_collection   = J1App.auth_config['providers']['disqus']['data_fields'].join(',')
        skip_extra        = false if data_collection =~ /raw/i
        provider :disqus,
                 J1App.oauth_data['disqus']['client_id'],
                 J1App.oauth_data['disqus']['client_secret'],
                 scope: "#{scope}",
                 skip_extra: skip_extra
      end

      if J1App.active_providers.include? 'github'
        scope             = J1App.auth_config['providers']['github']['scope'].join(',')
        data_collection   = J1App.auth_config['providers']['github']['data_fields'].join(',')
        skip_extra        = false if data_collection =~ /raw/i
        provider :github,
                 J1App.oauth_data['github']['client_id'],
                 J1App.oauth_data['github']['client_secret'],
                 scope: "#{scope}",
                 skip_extra: skip_extra
      end

      if J1App.active_providers.include? 'patreon'
        scope             = J1App.auth_config['providers']['patreon']['scope'].join(',')
        data_collection   = J1App.auth_config['providers']['patreon']['data_fields'].join(',')
        skip_extra        = false if data_collection =~ /raw/i
        provider :patreon,
                 J1App.oauth_data['patreon']['client_id'],
                 J1App.oauth_data['patreon']['client_secret'],
                 scope: "#{scope}",
                 skip_extra: skip_extra
      end

      # if J1App.active_providers.include? 'facebook'
      #   scope             = J1App.auth_config['providers']['facebook']['scope'].join(',')
      #   data_collection   = J1App.auth_config['providers']['facebook']['data_fields'].join(',')
      #   skip_extra        = false if data_collection =~ /raw/i
      #   provider :facebook,
      #         J1App.oauth_data['facebook']['client_id'],
      #         J1App.oauth_data['facebook']['client_secret'],
      #            scope: "#{scope}",
      #            skip_extra: skip_extra
      # end

      # if J1App.active_providers.include? 'twitter'
      #   scope             = J1App.auth_config['providers']['twitter']['scope'].join(',')
      #   data_collection   = J1App.auth_config['providers']['twitter']['data_fields'].join(',')
      #   skip_extra        = false if data_collection =~ /raw/i
      #   provider :twitter,
      #         J1App.oauth_data['twitter']['client_id'],
      #         J1App.oauth_data['twitter']['client_secret'],
      #            scope: "#{scope}",
      #            skip_extra: skip_extra
      # end

    end

    j1_mw_auth_mgr.info 'register oauth authentication callback on: /post_authentication'
    # Set the (internal) endpoint if a user is successfully authenticated
    # --------------------------------------------------------------------------
    use J1WardenOmniAuth do |config|
      config.redirect_after_callback = '/post_authentication?verify=oauth_callback'
    end

    # Add the internal logger from Rack to the middleware's of the stack
    # --------------------------------------------------------------------------
    j1_mw_auth_mgr.info 'register rack internal logger to the middleware|s'
    use Rack::Logger

    # Load user profiles, permissions, conditions and strategies
    # --------------------------------------------------------------------------
    j1_mw_auth_mgr.info 'load user profiles, permissions, conditions and strategies'
    providers   = J1App.auth_config['providers']
    permissions = J1App.permissions

    j1_mw_auth_mgr.info 'middleware initialized successfully'
    j1_mw_auth_mgr.info 'state: finished'

    # ==========================================================================
    # Sinatra (before) FILTER to preprocess all page requests
    # ==========================================================================

    # before do
    #   response.headers['Access-Control-Allow-Origin'] = '*'
    # end

    # Prepare root (index) page for app detection
    # --------------------------------------------------------------------------
    before '/' do

      MDC.put('path', env['REQUEST_URI'])
      j1_mw_auth_mgr.info 'prepare page access'

      # read existing/current cookie 'j1.user.ession' to update all data
      # of user_session_data (hash) otherwise set initial data
      # ------------------------------------------------------------------------
      unless env['HTTP_COOKIE'] == nil
        j1_mw_auth_mgr.info 'read current user state data from cookie'
        user_session_data = readCookie('j1.user.session')
        j1_mw_auth_mgr.info 'update user session data for mode: app'
        user_session_data['mode']       ='app'
        timestamp                       = Time.now.strftime("%Y-%m-%d %H:%M:%S")
        user_session_data['timestamp']  = timestamp
        user_session_data['writer']     = 'middleware'
        session_json                    = user_session_data.to_json
        j1_mw_auth_mgr.info 'write user session data to cookie: ' + "#{session_json}"
        writeCookie('j1.user.session', session_json)
      else
        j1_mw_auth_mgr.info 'create user session data for mode: app'
        timestamp                       = Time.now.strftime("%Y-%m-%d %H:%M:%S")
        user_session_data['timestamp']  = timestamp
        user_session_data['writer']     = 'middleware'
        session_json                    = user_session_data.to_json
        j1_mw_auth_mgr.info 'write user session data to cookie: ' + "#{session_json}"
        writeCookie('j1.user.session', session_json)
        requested_page = env['REQUEST_URI']
        app_session_data['requested_page'] = "#{env['REQUEST_URI']}"
      end

      # Create|Initialize the J1 web session cookie
      # ------------------------------------------------------------------------
      if warden.authenticated?
        user = warden.user

        j1_mw_auth_mgr_auth.info 'user detected: ' + "#{user[:provider]}"
        j1_mw_auth_mgr_auth.info 'user detected as signed in'

        app_session_data['authenticated']         = 'true'
        app_session_data['user_name']             = user[:info]['nickname']
        app_session_data['users_allowed']         = providers["#{user[:provider]}"]['users']
        app_session_data['user_id']               = user[:uid]
        app_session_data['provider']              = user[:provider]
        app_session_data['provider_membership']   = 'member'
        app_session_data['provider_site_url']     = providers["#{user[:provider]}"]['provider_url']
        app_session_data['provider_permissions']  = providers["#{user[:provider]}"]['permissions']
        app_session_data['payment_status']        = user[:info][:payment_status]
      else
        j1_mw_auth_mgr_auth.info 'user detected as signed out'

        app_session_data['authenticated']         = 'false'
        app_session_data['users_allowed']         = 'all'
        app_session_data['user_name']             = 'visitor'
        app_session_data['user_id']               = 'unknown'
        app_session_data['payment_status']        = 'unknown'
        app_session_data['provider']              = 'j1'
        app_session_data['provider_membership']   = 'guest'
        app_session_data['provider_site_url']     = "#{provider_site_url_default}"
        app_session_data['provider_permissions']  = ['public']
      end
    end

    user_session_cookie = 'j1.user.session'
    user_state_cookie   = 'j1.user.state'


    # General content (type) detection (auth pre-flight)
    # --------------------------------------------------------------------------
    before '/(apps|pages|posts)/*' do

      MDC.put('path', env['REQUEST_URI'])
      j1_mw_auth_mgr_preflight.info 'initial checks initiated'

      # Read current J1 user SESSION cookie ???
      # ------------------------------------------------------------------------
      if existsCookie? user_session_cookie
        user_session_data = readCookie(user_session_cookie)
        j1_mw_auth_mgr_preflight.info 'read user session cookie'                #, "#{session_decoded}"
      else
        requested_page                      = env['REQUEST_URI']
        app_session_data['requested_page']  = "#{requested_page}"
      end

      # Create|Initialize the J1 web session cookie
      # ------------------------------------------------------------------------
      j1_mw_auth_mgr_preflight.info 'check authentication state'
      if warden.authenticated?
        user = warden.user
        app_session_data['authenticated']         = 'true'
        app_session_data['user_name']             = user[:info]['nickname']
        app_session_data['user_id']               = user[:uid]
        app_session_data['provider']              = user[:provider]
        app_session_data['provider_site_url']     = providers["#{user[:provider]}"]['provider_url']
        app_session_data['users_allowed']         = providers["#{user[:provider]}"]['users']#
        app_session_data['provider_permissions']  = providers["#{user[:provider]}"]['permissions']
        app_session_data['provider_membership']   = 'member'
        app_session_data['payment_status']        = user[:info][:payment_status]
        app_session_data['writer']                = 'middleware'

        user_session_data = merge( user_session_data, app_session_data )
        j1_mw_auth_mgr_preflight.info 'user authenticated: ' + "#{user[:info]['nickname']}"
      else
        j1_mw_auth_mgr_preflight.info 'user authenticated: false'
      end

      # User state|content detection for implicit authentication
      # ------------------------------------------------------------------------
      j1_mw_auth_mgr_preflight.info 'check config, found authentication: disabled' if authentication_enabled? == false
      j1_mw_auth_mgr_preflight.info 'pass for all pages' if authentication_enabled? == false

      pass if authentication_enabled? == false
      j1_mw_auth_mgr_preflight.info 'check config, authentication: enabled'
      j1_mw_auth_mgr_preflight.info 'check content, content detected of category: public' if public_content?
      j1_mw_auth_mgr_preflight.info 'check content, pass all content of category: public' if public_content?

      pass if public_content?

      # user_state_data = readCookie(user_state_cookie)

      # Read current J1 user STATE cookie
      # --------------------------------------------------------------------
      if existsCookie? user_state_cookie
        user_state_data = readCookie(user_state_cookie)
        j1_mw_auth_mgr_preflight.info 'read user state cookie'             #, "#{session_decoded}"
        j1_mw_auth_mgr_preflight.info 'cookie consent: ' + "#{user_state_data['cookies_accepted']}"
      else
        j1_mw_auth_mgr_preflight.error 'user session cookie missing: ' + "#{user_state_cookie}"
      end
      j1_mw_auth_mgr_preflight.info 'check content type'

      requested_page = env['REQUEST_URI']
      requested_page.scan(/(protected|private)/) do |match|

        category = match[0]
        j1_mw_auth_mgr_preflight.info 'content type detected: ' + "#{category}"
        j1_mw_auth_mgr_preflight.info 'check authorisation status'
        if warden.authenticated?
          j1_mw_auth_mgr_preflight.info 'user detected as: authenticated'
          user_name = user[:info]['nickname']
          j1_mw_auth_mgr_preflight.info 'user detected: ' +  "#{user_name}"

          current_provider  = warden.user[:provider]
          strategy          = providers["#{current_provider}"]['strategy']
          provider_strategy = :"#{strategy}"

          user_session_data['user_name']             = user_name
          user_session_data['provider_url']          = providers["#{current_provider}"]['provider_url']
          user_session_data['users_allowed']         = providers["#{current_provider}"]['users']
          user_session_data['provider_permissions']  = providers["#{user[:provider]}"]['permissions']
          user_session_data['requested_page']        = requested_page

          j1_mw_auth_mgr_preflight.info 'check permissions'

          if permissions[:"#{category}"].include? current_provider
            j1_mw_auth_mgr_preflight.info 'provider detected: ' + "#{current_provider}"
            j1_mw_auth_mgr_preflight.info 'category detected: ' + "#{category}"
            j1_mw_auth_mgr_preflight.info 'category support: enabled'

            # Check permissions
            #
            #log_info! 'Authorisation', 'ConditionCheck', 'Check permissions for provider', "#{current_provider}"
            #conditions = J1App.conditions current_provider
            # if conditions["#{category}"]
            #   log_info! 'Authorisation', 'ConditionCheck', 'Conditions detected', "#{category}"
            #   conditions["#{category}"].each do |k, v|
            #     case k
            #     when 'enabled'
            #       log_info! 'Authorisation', 'ConditionCheck', "#{k}", "#{v}"
            #     when 'users'
            #       log_info! 'Authorisation', 'ConditionCheck', 'users'
            #       v.each do |k, v|
            #         log_info! 'Authorisation', 'ConditionCheck', "users - #{k}", "#{v}"
            #       end
            #     when 'payment'
            #       log_info! 'Authorisation', 'ConditionCheck', 'payment'
            #       v.each do |k, v|
            #         case k
            #         when 'tiers'
            #           log_info! 'Authorisation', 'ConditionCheck', "payment - #{k}", "#{v}"
            #         when 'tier'
            #           v.each do |k, v|
            #             log_info! 'Authorisation', 'ConditionCheck', 'payment - tiers - tier : ' "#{k}", "#{v}"
            #           end
            #         end
            #       end
            #     end
            #   end
            # end
          else
            provider  = permissions[:"#{category}"][0]

            j1_mw_auth_mgr_preflight.info 'provider detected: ' + "#{current_provider}"
            j1_mw_auth_mgr_preflight.info 'category detected: ' + "#{category}"
            j1_mw_auth_mgr_preflight.info 'category support: disabled'
            j1_mw_auth_mgr_preflight.info 'authorisation failed for user: ' + "#{user_name}"

            # Update user session cookie for 'requested_page'
            # ------------------------------------------------------------------
            session_json = user_session_data.to_json

            # jadams, 2019-08-08: writeCookie of 'j1.user.session' is needed to
            # track the requested_page. This cause the potential risk to
            # corrupt the cookie (now, for unknown reason)
            # ------------------------------------------------------------------
            writeCookie(user_session_cookie, session_json)
            j1_mw_auth_mgr_preflight.info 'write user session data: ' + "#{session_json}"
            j1_mw_auth_mgr_preflight.info 'pass to error page: access_denied'

            description_title = "Access Denied"
            redirect "/access_denied?provider=#{current_provider}&user=#{user_name}&category=#{category}&title=#{description_title}"
          end

          timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")
          j1_mw_auth_mgr_preflight.info 'pass to requested page: ' + "#{requested_page}"
          pass
        else
          j1_mw_auth_mgr_preflight.info 'user state detected: signed out'
          default_provider = permissions[:"#{category}"][0]
          j1_mw_auth_mgr_preflight.info 'set default provider: ' + "#{default_provider}"

          strategy          = providers["#{default_provider}"]['strategy']
          provider_strategy = :"#{strategy}"

          j1_mw_auth_mgr_preflight.info 'start processing provider: ' + "#{default_provider}"
          j1_mw_auth_mgr_preflight.info 'provider authentication strategy found: ' +  "#{strategy}"

          case provider_strategy

          when :org
            warden.authenticate!
            github_organization_authenticate! ENV['GITHUB_ORG_NAME']
            j1_mw_auth_mgr_preflight.info "Hi There, #{user_session_data[:user_name]}! You have access to the #{params['id']} organization"

          when :team
            warden.authenticate!
            github_team_authenticate! ENV['GITHUB_TEAM_ID']
            j1_mw_auth_mgr_preflight.info "Hi There, #{user_session_data[:user_name]}! You have access to the #{params['id']} team"

          when :teams
            warden.authenticate!
            github_teams_authenticate! ENV['GITHUB_TEAM_IDS'].split(',')
            j1_mw_auth_mgr_preflight.info "Hi There, #{user_session_data[:user_name]}! You have access to the #{params['id']} team"

          when :member
            j1_mw_auth_mgr_preflight.info 'process authentication strategy'

            if env['HTTP_COOKIE'].include? 'j1.user.session'
              session_encoded   = request.cookies['j1.user.session']
              session_decoded   = Base64.decode64(session_encoded)
              user_session_data = JSON.parse(session_decoded)
              j1_mw_auth_mgr_preflight.info 'read user session data from cookie' # "#{session_decoded}"
            end

            # Update user session cookie for 'requested_page'
            # ------------------------------------------------------------------
            user_session_data['requested_page'] = env['REQUEST_URI']
            user_session_data['writer']         = 'middleware'
            session_json                        = user_session_data.to_json

            # jadams, 2019-08-08: writeCookie of 'j1.user.session' is needed to
            # track the requested_page. This cause the potential risk to
            # corrupt the cookie (now, for unknown reason)
            # ------------------------------------------------------------------
            j1_mw_auth_mgr_preflight.info 'write user session data to cookie: ' + "#{session_decoded}"
            writeCookie(user_session_cookie, session_json)

            j1_mw_auth_mgr_preflight.info 'call api request for: ' + "/page_validation?page=#{user_session_data['requested_page']}"
            redirect "/page_validation?page=#{user_session_data['requested_page']}"
          else
            raise J1App::ConfigError
          end
        end
      end
    end


    # ==========================================================================
    # API ENDPOINTS (Sinatra HANDLERS)
    # ==========================================================================

    # ENDPOINT auth (called from Netlify CMS as an external oauth client)
    # --------------------------------------------------------------------------
    get '/auth' do
      provider        = 'github'
      oauth_requester = 'cc'

      MDC.put('path', env['REQUEST_URI'])

      j1_mw_auth_mgr_api_auth.info "authentication request received from: #{oauth_requester}"
      j1_mw_auth_mgr_api_auth.info 'check authentication status'

      if warden.authenticated?
        # process users only if authenticated at 'github'
        if warden.user[:provider] == provider
          nickname = warden.user[:info]['nickname']
          token    = warden.user[:credentials]['token']

          j1_mw_auth_mgr_api_auth.info "user detected as signed in: github, #{nickname}"
          j1_mw_auth_mgr_api_auth.info "pass authentication message to Netlify CMS for provider: #{provider}"

          signin_client = <<IIF
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <!-- Simple HttpErrorPages | MIT License | https://github.com/AndiDittrich/HttpErrorPages -->
              <meta charset="utf-8" />
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>J1 Control Center | SignIn to Github</title>
              <style type="text/css">/*! normalize.css v5.0.0 | MIT License | github.com/necolas/normalize.css */html{font-family:sans-serif;line-height:1.15;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,footer,header,nav,section{display:block}h1{font-size:2em;margin:.67em 0}figcaption,figure,main{display:block}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent;-webkit-text-decoration-skip:objects}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}dfn{font-style:italic}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}img{border-style:none}svg:not(:root){overflow:hidden}button,input,optgroup,select,textarea{font-family:sans-serif;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=reset],[type=submit],button,html [type=button]{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{display:inline-block;vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details,menu{display:block}summary{display:list-item}canvas{display:inline-block}template{display:none}[hidden]{display:none}/*! Simple HttpErrorPages | MIT X11 License | https://github.com/AndiDittrich/HttpErrorPages */body,html{width:100%;height:100%;background-color:#21232a}body{color:#fff;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,.5);padding:0;min-height:100%;-webkit-box-shadow:inset 0 0 100px rgba(0,0,0,.8);box-shadow:inset 0 0 100px rgba(0,0,0,.8);display:table;font-family:"Open Sans",Arial,sans-serif}h1{font-family:inherit;font-weight:500;line-height:1.1;color:inherit;font-size:36px}h1 small{font-size:68%;font-weight:400;line-height:1;color:#777}a{text-decoration:none;color:#fff;font-size:inherit;border-bottom:dotted 1px #707070}.lead{color:silver;font-size:21px;line-height:1.4}.cover{display:table-cell;vertical-align:middle;padding:0 20px}footer{position:fixed;width:100%;height:40px;left:0;bottom:0;color:#a0a0a0;font-size:14px}</style>
            </head>
            <body>
              <div class="cover">
                <h1>Control Center <small>sign in</small></h1>
                <p class="lead">
                  The Control Center is accessing #{provider} for user #{nickname}.<br>
                  Providing authentication data ..</p>
              </div>

              <script>
              (function() {
                // Register an event handler to listen for messages of the child window
                window.addEventListener("message", receiveMessage, false);

                // Post a authorizing message to the parent window (Netlify CMS App)
                // as a handshake with the parent window
                window.opener.postMessage("authorizing:#{provider}", "*");

                function receiveMessage() {
                  // send message to main (parent) window (Netlify CMS App)
                  window.opener.postMessage(
                    'authorization:#{provider}:success:{"token":"#{token}","provider":"#{provider}"}'
                  )
                } // end receiveMessage
              })()
              </script>

            </body>
          </html>
IIF
        else
          provider =        'github'
          nickname          = warden.user[:info]['nickname']
          current_provider  = warden.user[:provider]

          j1_mw_auth_mgr_api_auth.info "user detected as signed in: #{nickname}"
          j1_mw_auth_mgr_api_auth.info "invalid provider detected: #{current_provider}"

          # Destroy current session to initiate a clean oauth authentication
          # ----------------------------------------------------------------
          j1_mw_auth_mgr_api_auth.info "sign out user from provider: #{current_provider}"
          j1_mw_auth_mgr_api_auth.info "initiate oauth authentication at provider: #{provider}"
          warden.logout
          session.clear
          warden.authenticate! :"omni_#{provider}"
        end
      else
        j1_mw_auth_mgr_api_auth.info 'user detected as signed out'
        j1_mw_auth_mgr_api_auth.info "initiate oauth authentication at provider: #{provider}"

        # Destroy current session to initiate a clean oauth authentication
        # ----------------------------------------------------------------
        warden.logout
        session.clear
        warden.authenticate! :"omni_#{provider}"
      end
    end


    # ENDPOINT authentication (called from WEB by auth client)
    # --------------------------------------------------------------------------
    get '/authentication' do
      request         = params.fetch('request')
      provider        = params.fetch('provider')
      oauth_requester = 'app'

      MDC.put('path', env['REQUEST_URI'])
      j1_mw_auth_mgr_api_auth.info "authentication request received from: #{oauth_requester}"

      # SignIn
      # ------------------------------------------------------------------------
      if request === 'signin'
        j1_mw_auth_mgr_api_auth.info 'sign in called for provider: ' + "#{provider}"

        # collect (additional) GET parameter|s
        # ----------------------------------------------------------------------
        allowed_users = params.fetch('allowed_users')

        if warden.authenticated?
          j1_mw_auth_mgr_api_auth.info 'sign in called but user already signed: ' + "#{warden.user[:info]['nickname']}"
          requested_page = user_session_data['requested_page']
          j1_mw_auth_mgr_api_auth.info 'pass user to requested page: ' + "#{requested_page}"
          redirect "#{requested_page}"
        else
          j1_mw_auth_mgr_api_auth.info 'initiate oauth authentication to sign in'

          # Make (really) sure that old session is cleared before login
          # --------------------------------------------------------------------
          warden.logout
          session.clear
          warden.authenticate! :"omni_#{provider}"
        end
        # SignOut
        # ------------------------------------------------------------------------
      elsif request === 'signout'
        # collect (additional) GET parameter|s
        provider_signout = params.fetch('provider_signout')
        j1_mw_auth_mgr_api_auth.info 'sign out called for provider: ' + "#{provider}"

        if warden.authenticated?
          user         = warden.user[:info]['nickname']
          provider     = warden.user[:provider]
          provider_url = user_session_data['provider_url']
          j1_mw_auth_mgr_api_auth.info 'sign out user: ' + "#{user}"
          warden.logout
          session.clear

          # Read current J1 user SESSION cookie
          # --------------------------------------------------------------------
          if existsCookie? user_session_cookie
            user_session_data = readCookie(user_session_cookie)
            j1_mw_auth_mgr_api_auth.info 'read user session cookie'             #, "#{session_decoded}"
          else
            j1_mw_auth_mgr_api_auth.error 'user session cookie missing: ' + "#{user_session_cookie}"
          end

          if provider_signout === 'true'
            j1_mw_auth_mgr_api_auth.info 'sign out user: ' + "#{user}"
            j1_mw_auth_mgr_api_auth.info 'sign out from: ' + "#{provider}"
            j1_mw_auth_mgr_api_auth.info 'pass to provider for sign out: ' + "#{provider_url}"
            redirect "#{provider_url}"
          else
            j1_mw_auth_mgr_api_auth.info 'sign out user: ' + "#{user}"
            j1_mw_auth_mgr_api_auth.info 'sign out from: session'

            # If signed out, redirect ONLY for PUBLIC pages
            # ------------------------------------------------------------------
            if redirect_whitelisted?user_session_data['requested_page']
              j1_mw_auth_mgr_api_auth.info 'check page permissions: access allowed'
              j1_mw_auth_mgr_api_auth.info 'pass to page: ' + "#{user_session_data['requested_page']}"
              redirect user_session_data['requested_page']
            else
              j1_mw_auth_mgr_api_auth.info 'check page permissions: access denied'
              j1_mw_auth_mgr_api_auth.info 'pass to page: /'
              redirect '/'
            end
          end
        else
          # THIS condition should NEVER REACHED because NO logout dialog
          # (modal) is provided by the auth client if a user isn't signed in.
          # Kept this alternative for cases something went wrong.
          # --------------------------------------------------------------------
          j1_mw_auth_mgr_api_auth.warn 'DEAD PATH - called for sign out but user state is: signed out'

          # Read current J1 SESSION cookie
          # --------------------------------------------------------------------
          if existsCookie? user_session_cookie
            user_session_data = readCookie(user_session_cookie)
            j1_mw_auth_mgr_api_auth.warn 'DEAD PATH - read user session cookie'  #, "#{session_decoded}"
          else
            j1_mw_auth_mgr_api_auth.error 'DEAD PATH - user session cookie missing: ' + "#{user_session_cookie}"
          end

          j1_mw_auth_mgr_api_auth.warn 'DEAD PATH - pass to requested page: ' + "#{user_session_data['requested_page']}"
          redirect user_session_data['requested_page']
        end
      else
        raise J1App::ConfigError
      end
    end
    # --------------------------------------------------------------------------
    # END: get '/authentication'

    # ENDPOINT post_authentication (called after a user is back from OAuth Provider)
    # --------------------------------------------------------------------------
    get '/post_authentication' do
      MDC.put('path', env['REQUEST_URI'])

      nickname  = warden.user[:info]['nickname']
      provider  = warden.user[:provider]
      token     = warden.user[:credentials]['token']

      j1_mw_auth_mgr_api_post_auth.info "user successfully authenticated: #{provider}, #{nickname}"
      j1_mw_auth_mgr_api_post_auth.info "authentication requester deteced as: #{oauth_requester}"

      if oauth_requester.include? 'cc'
        j1_mw_auth_mgr_api_post_auth.info 'auth request was requested by Netlify CMS'
        j1_mw_auth_mgr_api_post_auth.info 'prepare signin for Netlify CMS'

        signin_client = <<IIF
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <!-- Simple HttpErrorPages | MIT License | https://github.com/AndiDittrich/HttpErrorPages -->
            <meta charset="utf-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>J1 Control Center | SignIn to Github</title>
            <style type="text/css">/*! normalize.css v5.0.0 | MIT License | github.com/necolas/normalize.css */html{font-family:sans-serif;line-height:1.15;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,footer,header,nav,section{display:block}h1{font-size:2em;margin:.67em 0}figcaption,figure,main{display:block}figure{margin:1em 40px}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent;-webkit-text-decoration-skip:objects}a:active,a:hover{outline-width:0}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:inherit}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}dfn{font-style:italic}mark{background-color:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}img{border-style:none}svg:not(:root){overflow:hidden}button,input,optgroup,select,textarea{font-family:sans-serif;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=reset],[type=submit],button,html [type=button]{-webkit-appearance:button}[type=button]::-moz-focus-inner,[type=reset]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type=button]:-moz-focusring,[type=reset]:-moz-focusring,[type=submit]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{display:inline-block;vertical-align:baseline}textarea{overflow:auto}[type=checkbox],[type=radio]{box-sizing:border-box;padding:0}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}[type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details,menu{display:block}summary{display:list-item}canvas{display:inline-block}template{display:none}[hidden]{display:none}/*! Simple HttpErrorPages | MIT X11 License | https://github.com/AndiDittrich/HttpErrorPages */body,html{width:100%;height:100%;background-color:#21232a}body{color:#fff;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,.5);padding:0;min-height:100%;-webkit-box-shadow:inset 0 0 100px rgba(0,0,0,.8);box-shadow:inset 0 0 100px rgba(0,0,0,.8);display:table;font-family:"Open Sans",Arial,sans-serif}h1{font-family:inherit;font-weight:500;line-height:1.1;color:inherit;font-size:36px}h1 small{font-size:68%;font-weight:400;line-height:1;color:#777}a{text-decoration:none;color:#fff;font-size:inherit;border-bottom:dotted 1px #707070}.lead{color:silver;font-size:21px;line-height:1.4}.cover{display:table-cell;vertical-align:middle;padding:0 20px}footer{position:fixed;width:100%;height:40px;left:0;bottom:0;color:#a0a0a0;font-size:14px}</style>
          </head>
          <body>
            <div class="cover">
              <h1>Control Center <small>sign in</small></h1>
              <p class="lead">
                The Control Center is accessing #{provider} for user #{nickname}.<br>
                Providing authentication data ..</p>
            </div>

            <script>
            (function() {
              // Register an event handler to listen for messages of the child window
              window.addEventListener("message", receiveMessage, false);

              // Post a authorizing message to the parent window (Netlify CMS App)
              // as a handshake with the parent window
              window.opener.postMessage("authorizing:#{provider}", "*");

              function receiveMessage() {
                // send message to main (parent) window (Netlify CMS App)
                window.opener.postMessage(
                  'authorization:#{provider}:success:{"token":"#{token}","provider":"#{provider}"}'
                )
              } // end receiveMessage
            })()
            </script>

          </body>
        </html>
IIF

        j1_mw_auth_mgr_api_post_auth.info "pass authentication message to Netlify CMS for provider: #{provider}"
        # noinspection RubyJumpError
        return signin_client
      end

      reward = {
          :id    => 'unknown',
          :name  => 'unknown',
          :link  => '#'
      }
      campaign = {
          :id    => 'unknown',
          :link  => '#'
      }

       MDC.put('path', env['REQUEST_URI'])
        j1_mw_auth_mgr_api_post_auth.info 'identification request received'

      # Read current J1 SESSION cookie
      # ------------------------------------------------------------------------
      if existsCookie? user_session_cookie
        user_session_data = readCookie(user_session_cookie)
        j1_mw_auth_mgr_api_post_auth.info 'read user session cookie'
        j1_mw_auth_mgr_api_post_auth.info 'requested page found as: ' + "#{user_session_data['requested_page']}"
      else
        j1_mw_auth_mgr_api_post_auth.error 'user session cookie missing: ' + "#{user_session_cookie}"
      end

      user      = warden.user
      user_json = user.to_json

      if user[:provider] === 'disqus'
        user[:info][:urls][:site]       = "https://disqus.com"
        user[:info][:urls][:home]       = user[:info]['urls']['profileUrl']
        user[:info][:urls][:blog]       = "https://disqus.com/by/juergen_adams/"
        user[:info][:urls][:member]     = user[:info]['urls']['profileUrl']
      end

      if user[:provider] === 'github'
        user[:info][:urls][:site]       = "https://github.com"
        user[:info][:urls][:home]       = user[:info]['urls']['GitHub']
        user[:info][:urls][:blog]       = "https://github.com/jekyll-one"
        user[:info][:urls][:member]     = user[:info]['urls']['Blog']
      end

      if user[:provider] === 'patreon'

        user[:info][:urls][:site]       = "https://patreon.com"
        user[:info][:urls][:home]       = "https://patreon.com/home"
        user[:info][:urls][:blog]       = "https://patreon.com/jekyll_one"

        unless user[:info]['payment_info'].empty?
          reward_url                    = user[:info]['payment_info']['relationships']['reward']['links']['related']
          reward_json                   = RestClient.get "#{reward_url}", {:content_type => :json, :accept => :json}
          reward_data                   = JSON.parse(reward_json)
          user[:info][:urls][:member]   = "https://patreon.com" + reward_data['data']['attributes']['url']
          user[:info][:payment_status]  = user[:info]['payment_info']['attributes']['declined_since'].nil? ? 'true' : 'false'
        else
          reward_url                    = ""
          reward_json                   = ""
          reward_data                   = ""
          user[:info][:payment_status]  = 'false'
        end

        unless reward_data.empty?
          reward[:id]                   = reward_data['data']['id']
          reward[:name]                 = reward_data['data']['attributes']['title']
          reward[:link]                 = "https://patreon.com" + reward_data['data']['attributes']['url']
          campaign[:id]                 = reward_data['data']['relationships']['campaign']['data']['id']
          campaign[:link]               = reward_data['data']['relationships']['campaign']['links']['related']
        else
          reward[:id]                   = ""
          reward[:name]                 = "no tiers"
          reward[:link]                 = ""
          campaign[:id]                 = ""
          campaign[:link]               = ""
        end
      end

      user[:extra][:reward]             = reward
      user[:extra][:campaign]           = campaign

      # EXCEPTION: collection of session data failed (e.g cookie > 4K)
      # ------------------------------------------------------------------------
      if user.nil?
        j1_mw_auth_mgr_api_post_auth.error 'internal error: user identification failed'
        j1_mw_auth_mgr_api_post_auth.error 'check user session cookie for consistency'
        warden.logout
        session.clear
        j1_mw_auth_mgr_api_post_auth.info 'pass to error page: access denied'
        description_title = "Access Denied"
        redirect "/access_denied?provider=unknown&user=unknown&category=unknown&title=#{description_title}"
      else
        j1_mw_auth_mgr_api_post_auth.info 'user identified successfully'

        user_session_data['user_name']              = user[:info]['nickname']
        user_session_data['user_id']                = user[:uid]
        user_session_data['provider']               = user[:provider]
        user_session_data['provider_membership']    = 'member'
        user_session_data['provider_permissions']   = providers["#{user[:provider]}"]['permissions']
        user_session_data['users_allowed']          = providers["#{user[:provider]}"]['users']
        user_session_data['authenticated']          = 'true'
        user_session_data['payment_status']         = user[:info][:payment_status]
        user_session_data['writer']                 = 'middleware'

        current_user                                = user[:info]['nickname']
        current_provider                            = user[:provider]

        user_session_data['requested_page'].scan(/(protected|private)/) do |match|

          # Set category from requested page
          # --------------------------------------------------------------------
          category = match[0]
          j1_mw_auth_mgr_api_post_auth.info 'Processing content category: ' + "#{category}"

          # Check if user is allowed to access protected content in GENERAL
          # --------------------------------------------------------------------
          j1_mw_auth_mgr_api_post_auth.info 'check for users allowed'
          unless user_session_data['users_allowed'].include? 'all'
            unless user_session_data['users_allowed'].include? "#{current_user}"
              j1_mw_auth_mgr_api_post_auth.info 'user not allowed: ' + "#{current_user}"
              j1_mw_auth_mgr_api_post_auth.info 'allowed users: ' + "#{user_session_data['users_allowed']}"
              j1_mw_auth_mgr_api_post_auth.info 'pass to error page: access_denied'
              description_title = "Access Denied"
              redirect "/access_denied?provider=#{current_provider}&user=#{current_user}&category=#{category}&title=#{description_title}"
            end
          end
          j1_mw_auth_mgr_api_post_auth.info 'allowed users found: ' + "#{user_session_data['users_allowed']}"

          # Check conditions to access protected content (if any)
          #
          j1_mw_auth_mgr_api_post_auth.info 'check conditions for provider: ' + "#{current_provider}"
          check_conditions = providers["#{user[:provider]}"]['conditions'][category]['enabled']
          if check_conditions

            if providers["#{user[:provider]}"]['conditions'][category]['users']['whitelist'].nil?
              category_whitelist = 'all'
            else
              category_whitelist = providers["#{user[:provider]}"]['conditions'][category]['users']['whitelist']
            end

            # Check if user is BLACKLISTED
            #
            blacklist = providers["#{user[:provider]}"]['conditions'][category]['users']['blacklist']
            if blacklist.include? "#{current_user}"
              j1_mw_auth_mgr_api_post_auth.info 'check blacklisting'
              j1_mw_auth_mgr_api_post_auth.info 'found user blacklisted: ' + "#{current_user}"

              user[:info][:blacklisted] = 'true'
              j1_mw_auth_mgr_api_post_auth.info 'logout user from current session: ' + "#{current_user}"
              warden.logout
              session.clear
              j1_mw_auth_mgr_api_post_auth.info 'pass to error page: access_denied'
              description_title = "User blacklisted"
              redirect "/access_denied?provider=#{current_provider}&user=#{current_user}&category=#{category}&title=#{description_title}"
            end

            j1_mw_auth_mgr_api_post_auth.info 'check whitelisting'
            if category_whitelisted? category_whitelist, current_user
              user[:info][:whitelisted] = 'true'
              reward[:name]             = 'whitelisted'
              j1_mw_auth_mgr_api_post_auth.info 'found user whitelisted: ' + "#{current_user}"
              j1_mw_auth_mgr_api_post_auth.info 'set user rewards to: whitelisted'
            else
              j1_mw_auth_mgr_api_post_auth.info 'no whitelisting found for user: ' + "#{current_user}"
            end
            j1_mw_auth_mgr_api_post_auth.info 'check provider conditions'
            unless category_whitelisted? category_whitelist, current_user
              j1_mw_auth_mgr_api_post_auth.info 'check rewards for user: ' + "#{current_user}"
              payment_tiers = providers["#{user[:provider]}"]['conditions'][category]['payment']['activated']
              if payment_activated? payment_tiers
                j1_mw_auth_mgr_api_post_auth.info 'rewards found : ' + "#{reward[:name]}"

                # Check if any payment exists
                # --------------------------------------------------------------
                j1_mw_auth_mgr_api_post_auth.info 'check payment status'
                if user[:info]['payment_info'].empty?
                  j1_mw_auth_mgr_api_post_auth.info 'payment status not available for user: ' + "#{current_user}"
                  j1_mw_auth_mgr_api_post_auth.info 'logout user from current session'
                  warden.logout
                  session.clear
                  j1_mw_auth_mgr_api_post_auth.info 'pass to error page: access denied'
                  description_title = "Invalid funds"
                  redirect "/access_denied?provider=#{current_provider}&user=#{current_user}&category=#{category}&title=#{description_title}"
                end

                # Check for VALID payments (scope: pledge-to-me)
                # --------------------------------------------------------------
                payment_status = user[:info]['payment_info']['attributes']['declined_since']
                unless payment_valid? payment_status
                  j1_mw_auth_mgr_api_post_auth.info 'payment status invalid for user: ' + "#{current_user}"
                  j1_mw_auth_mgr_api_post_auth.info 'logout user from current session'
                  warden.logout
                  session.clear
                  j1_mw_auth_mgr_api_post_auth.info 'pass to error page: access denied'
                  description_title = "Invalid funds"
                  redirect "/access_denied?provider=#{current_provider}&user=#{current_user}&category=#{category}&title=#{description_title}"
                else
                  j1_mw_auth_mgr_api_post_auth.info 'payment status valid for user: ' + "#{current_user}"
                end
              end

            end
            # end category_whitelisted
          else
            category_condition_state = providers["#{user[:provider]}"]['conditions'][category]['enabled']

            j1_mw_auth_mgr_api_post_auth.info 'category check failed for provider: ' + "#{current_provider}"
            j1_mw_auth_mgr_api_post_auth.info 'category check failed for category: ' + "#{category}"
            j1_mw_auth_mgr_api_post_auth.info 'category support found as: ' + "#{category_condition_state}"
            j1_mw_auth_mgr_api_post_auth.info 'pass to error page: access denied'

            description_title = "Access Denied"
            redirect "/access_denied?provider=#{current_provider}&user=#{current_user}&category=#{category}&title=#{description_title}"
          end
          # end check conditions

        end
        # end protected content
      end
      # end user.nil?

      # jadams, 2019-08-08: writeCookie of 'j1.user.session' is needed to
      # track the requested_page. This cause the potential risk to
      # corrupt the cookie (now, for unknown reason)
      # ------------------------------------------------------------------
      timestamp                       = Time.now.strftime("%Y-%m-%d %H:%M:%S")
      user_session_data['timestamp']  = timestamp
      user_session_data['writer']     = 'middleware'
      session_json                    = user_session_data.to_json

      j1_mw_auth_mgr_preflight.info 'write user session data to cookie: ' + "#{session_json}"
      writeCookie(user_session_cookie, session_json)

      j1_mw_auth_mgr_api_post_auth.info 'provider detected: ' + "#{user[:provider]}"
      j1_mw_auth_mgr_api_post_auth.info 'user detected: ' + "#{user[:info]['nickname']}"
      j1_mw_auth_mgr_api_post_auth.info 'pass to requested page: ' + "#{user_session_data['requested_page']}"

      redirect user_session_data['requested_page']
    end
    # --------------------------------------------------------------------------
    # END: get /post_authentication

    # ENDPOINT status (called from WEB to get current state of an user)
    # --------------------------------------------------------------------------
    get '/status' do
      requested_page = params.fetch('page')
      category = 'public'

      requested_page.scan(/(public|protected|private)/) do |match|
        category = match[0]
      end

      # MDC.put('path', requested_page)
      MDC.put('path', env['REQUEST_URI'])
      j1_mw_auth_mgr_api_state.info 'status request received'
      j1_mw_auth_mgr_api_state.info 'page requested: ' + "#{requested_page}"
      j1_mw_auth_mgr_api_state.info 'content category found: ' + "#{category}"

      # if request.warden.user.respond_to?(:info)
      #
      if warden.authenticated?
        user_name               = warden.user[:info]['nickname']
        user_id                 = warden.user[:uid]
        users_allowed           = providers[warden.user[:provider]]['users']
        provider                = warden.user[:provider]
        provider_membership     = 'member'
        provider_permissions    = user_session_data['provider_permissions']

        if provider == 'github'
          provider_site_url       = warden.user[:info][:urls][:site]
          provider_home_url       = warden.user[:info][:urls][:blog]
          provider_blog_url       = warden.user[:info][:urls][:blog]
          provider_member_url     = warden.user[:info][:urls][:blog]
        end

        if provider == 'disqus'
          provider_site_url       = warden.user[:info][:urls][:site]
          provider_home_url       = warden.user[:info][:urls][:blog]
          provider_blog_url       = warden.user[:info][:urls][:blog]
          provider_member_url     = warden.user[:info][:urls][:blog]
        end

        if provider == 'patreon'
          provider_membership     = warden.user[:extra][:reward][:name]
          provider_site_url       = warden.user[:info][:urls][:site]
          provider_home_url       = warden.user[:info][:urls][:home]
          provider_blog_url       = warden.user[:info][:urls][:blog]
          provider_member_url     = warden.user[:extra][:reward][:link]
        end

        j1_mw_auth_mgr_api_state.info 'user detected as: ' + "#{user_name}"
        j1_mw_auth_mgr_api_state.info 'user state detected as: signed in'
      else
        user_name = 'unknown'
        j1_mw_auth_mgr_api_state.info 'user state detected as: signed out'
      end

      timestamp = Time.now.strftime("%Y-%m-%d %H:%M:%S")

      # if request.warden.authenticated?
      #
      if user_name != 'unknown'
        j1_mw_auth_mgr_api_state.info 'send data for: signed in'
        content_type 'application/json'
        {
            user_name:                user_name,
            user_id:                  user_id,
            users_allowed:            users_allowed,
            provider:                 provider,
            provider_membership:      provider_membership,
            provider_permissions:     provider_permissions,
            provider_site_url:        provider_site_url,
            provider_home_url:        provider_home_url,
            provider_blog_url:        provider_blog_url,
            provider_member_url:      provider_member_url,
            provider_privacy_url:     provider_privacy_url_default,
            page_permission:          category,
            requested_page:           requested_page,
            authenticated:            'true',
            timestamp:                timestamp
        }.to_json
      else
        j1_mw_auth_mgr_api_state.info 'send data for: signed out'
        content_type 'application/json'
        {
            user_name:                'visitor',
            user_id:                  'unknown',
            users_allowed:            'all',
            provider:                 'j1',
            provider_membership:      'guest',
            provider_permissions:     ['public'],
            provider_site_url:        provider_site_url_default,
            provider_home_url:        provider_home_url_default,
            provider_blog_url:        provider_blog_url_default,
            provider_member_url:      provider_member_url_default,
            provider_privacy_url:     provider_privacy_url_default,
            page_permission:          category,
            requested_page:           requested_page,
            authenticated:            'false',
            timestamp:                timestamp
        }.to_json
      end
    end
    # --------------------------------------------------------------------------
    # END: get /status

    #  ENDPOINT access_denied (exception, called from the app|auth manager)
    # --------------------------------------------------------------------------
    get '/access_denied' do
      provider          = params.fetch('provider')
      category          = params.fetch('category')
      user              = params.fetch('user')
      description_title = params.fetch('title')

      MDC.put('path', env['REQUEST_URI'])
      j1_mw_auth_mgr_api_auth.info 'request received'
      j1_mw_auth_mgr_api_auth.warn 'access denied'

      # Read current J1 SESSION cookie
      # ------------------------------------------------------------------------
      if existsCookie? user_session_cookie
        j1_mw_auth_mgr_api_auth.info 'read user session cookie'
        user_session_data = readCookie(user_session_cookie)
      else
        j1_mw_auth_mgr_api_auth.error 'user session cookie missing: ' + "#{user_session_cookie}"
      end

      j1_mw_auth_mgr_api_auth.info 'pass to error page: access denied'

      # Capitalize first char
      provider =  provider.sub(/^./, &:upcase)
      route    = '/'

      @route             = route
      @provider          = provider
      @modal             = "centralModalInfo"
      @info_type         = "danger"
      @modal_icon        = "account-off"
      @modal_ok_text     = "Ok, understood"
      @modal_title       = "Authentication Manager"
      @modal_description = "<h4>#{description_title}</h4></br></br> User <b>#{user}</b> from provider <b>#{provider}</b> is not allowed to access <b>#{category}</b> pages."

      erb :auth_manager_ui
    end
    # --------------------------------------------------------------------------
    # END: get '/access_denied'

    # /page_validation ENDPOINT
    # --------------------------------------------------------------------------
    get '/page_validation' do
      requested_page  = params.fetch('page')
      category        = ''
      provider        = ''
      allowed_users   = ''

      # MDC.put('path', requested_page)
      MDC.put('path', env['REQUEST_URI'])
      j1_mw_auth_mgr_api_validate.info 'validate request received for page: ' + "#{requested_page}"

      requested_page.scan(/(protected|private)/) do |match|
        category      = match[0]
        provider      = permissions[:"#{category}"][0]
        allowed_users = providers["#{provider}"]['users'].join(',')
      end

      j1_mw_auth_mgr_api_validate.info 'category detected: ' + "#{category}"
      j1_mw_auth_mgr_api_validate.info 'provider detected: ' + "#{provider}"
      j1_mw_auth_mgr_api_validate.info 'users allowed detected: ' + "#{allowed_users}"


      if warden.authenticated?
        j1_mw_auth_mgr_api_validate.info 'validation: successful'
        j1_mw_auth_mgr_api_validate.info 'pass user to requested page: ' + "#{requested_page}"
        route = requested_page
      else
        j1_mw_auth_mgr_api_validate.info 'validation: failed: user not authenticated'
        j1_mw_auth_mgr_api_validate.info 'pass user to authentication: ' + "/authentication?request=signin&provider=#{provider}&allowed_users=#{allowed_users}"
        route = "/authentication?request=signin&provider=#{provider}&allowed_users=#{allowed_users}"
      end

      # Capitalize first char
      provider              =  provider.sub(/^./, &:upcase)

      @provider             = provider
      @route                = route
      @modal                = "signInProtectedContent"
      @modal_icon           = "login"
      @modal_agreed_text    = "Yes, please"
      @modal_disagreed_text = "No, thanks"
      @modal_title          = "SignIn"
      @modal_image          = "/assets/images/modules/attics/banner/admin-dashboard-bootstrap-1280x600.png"
      @modal_description    = "The page <b>#{requested_page}</b> you requested belongs to <b>#{category}</b> content. You'll be redirected to authenticate with the provider <b>#{provider}</b>. If signed in successfully, you get access to all <b>#{category} pages</b>."

      erb :auth_manager_ui
    end
    # --------------------------------------------------------------------------
    # END: get '/page_validation

    # Rescue OmniAuth::Strategies::OAuth2::CallbackError
    # ------------------------------------------------------------------------
    get '/redirect_on_failure' do

      MDC.put('path', env['REQUEST_URI'])
      j1_mw_auth_mgr_api_auth .error 'callback error on oauth redirect'
      j1_mw_auth_mgr_api_auth.info 'pass user to page: /'

      redirect '/'
    end

    post '/log2disk' do
#     payload   = params
#     request   = params.fetch('request')
      logger    = params.fetch('logger')
      epoch     = params.fetch('timestamp').to_i
      level     = params.fetch('level')
      url       = params.fetch('url')
      message   = params.fetch('message')
#     layout    = params.fetch('layout')
      timestamp = Time.at(epoch/1000.0).strftime('%Y-%m-%d %H:%M:%S.%3N')
      path      = ''

      # additional response header to allow 'log2disk' requests
      # from several origins
      # NOTE: See response header control for 'Sinatra'
      # with j1_site_manager
      # ------------------------------------------------------------------------
      response.headers['Access-Control-Allow-Origin'] = '*'

      url.scan(/((?:file|https?):.*?):(\d+)(.*)/) do |match|
        path = match[2]
      end

      if logger.include? 'j1.mw'
        MDC.put('id', page_id)
      else
        MDC.put('id', env['HTTP_X_PAGE_ID'])
      end

      MDC.put('path', path)
      MDC.put('level', level)
      MDC.put('timestamp', timestamp)
      MDC.put('message', message)
      MDC.put('logger', logger)

      j1_mw_auth_mgr_api_log2disk.info 'pass data'

      # return HTTP 200
      "finished"
    end
    # --------------------------------------------------------------------------
    # END: get /redirect_on_failure

    # ENDPOINT  invalid_funds (exception, called from the app|auth manager)
    # --------------------------------------------------------------------------
    # get '/invalid_funds' do
    #   provider          = params.fetch('provider')
    #   category          = params.fetch('category')
    #   user              = params.fetch('user')
    #   description_title = params.fetch('title')
    #
    #   log_info! 'API', 'ExceptionHandler', 'Request received'
    #   log_info! 'ExceptionHandler', 'ERROR', 'Invalid Funds'
    #
    #   session_encoded = request.cookies['j1.user.session']
    #   session_decoded = Base64.decode64(session_encoded)
    #   user_session_data  = JSON.parse(session_decoded)
    #
    #   log_info! 'ExceptionHandler', 'Redirect', 'Pass to error page', 'Invalid Funds'
    #
    #   # Capitalize first char
    #   provider  =  provider.sub(/^./, &:upcase)
    #   route     = '/'
    #
    #   @route                  = route
    #   @provider               = provider
    #   @modal                  = "centralModalInfo"
    #   @info_type              = "danger"
    #   @modal_icon             = "account-off"
    #   @modal_ok_text          = "Ok, understood"
    #   @modal_title            = "Authentication Manager"
    #   @modal_description      = "<h4>#{description_title}</h4></br></br> User <b>#{user}</b> from provider <b>#{provider}</b> is not allowed to access <b>#{category}</b> pages."
    #
    #   erb :auth_manager_ui
    # end
    # END: get /invalid_funds
    # --------------------------------------------------------------------------

    # ENDPOINT iframe
    # --------------------------------------------------------------------------
    # get '/iframe' do
    #   @website_url = "https://jekyll-one.github.io/"
    #   erb :iframe
    # end
    # END: get /iframe
    # --------------------------------------------------------------------------

  end
end
