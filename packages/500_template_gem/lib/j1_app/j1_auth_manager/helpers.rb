module J1App
  module Helpers

    def public_content?
      return true if request.path_info == '/authentication'
      return true if request.path_info == '/info'
      return true if request.path_info == '/redirect_after_callback'
      !!(J1App.public_content && J1App.public_content.match(request.path_info))
    end

    def redirect_whitelisted?(redirect)
      return true if redirect == '/authentication'
      return true if redirect == '/info'
      return true if redirect == '/redirect_after_callback'
      !!(J1App.public_content && J1App.public_content.match(redirect))
    end

    def authentication_enabled?
      return J1App.auth?
    end

    def warden
      env['warden']
    end

    def authenticate!(*args)
      warden.authenticate!(*args)
    end

    def authenticated?(*args)
      warden.authenticated?(*args)
    end

    def category_whitelisted?(*args)
      whitelist, user  = *args
      return true if whitelist.include? 'all'
      return true if whitelist.include? user
      return false
    end

    def payment_activated?(payment)
      return true if payment.any?
      return false
    end

    def payment_valid?(payment_info)
      return true if payment_info.nil?
      return false
    end

    def logout!
      warden.logout
    end

    def has_umlaut? (str)
      !!(str =~ /[öäüÖÄÜß]/)
    end

    # def log_info! (*args)
    #   scope, func, text, details = *args
    #
    #   if details.nil?
    #     message = sprintf( "[%-20s] [%-20s] %s", "#{scope} ", "#{func}", "#{text}" )
    #   else
    #     message = sprintf( "[%-20s] [%-20s] %s: %s", "#{scope} ", "#{func}", "#{text}", "#{details}" )
    #   end
    #   logger.info "#{message}"
    # end
    #
    # def log_error! (*args)
    #   scope, func, text, details = *args
    #
    #   if details.nil?
    #     message = sprintf( "[%-20s] [%-20s] %s", "#{scope} ", "#{func}", "#{text}" )
    #   else
    #     message = sprintf( "[%-20s] [%-20s] %s: %s", "#{scope} ", "#{func}", "#{text}", "#{details}" )
    #   end
    #   logger.error "#{message}"
    # end

    # def authentication_strategy
    #   if !ENV["GITHUB_TEAM_ID"].to_s.blank?
    #     :team
    #   elsif !ENV["GITHUB_TEAM_IDS"].to_s.blank?
    #     :teams
    #   elsif !ENV["GITHUB_ORG_NAME"].to_s.blank?
    #     :org
    #   elsif !ENV['GITHUB_MEMBERS'].to_s.blank?
    #     :member
    #   end
    # end

    # --------------------------------------------------------------------------
    #  merge: merge two hashes (input <- hash)
    #
    #  Example:
    #   {% assign nav_bar_options = nav_bar_default | merge: nav_bar_config %}
    # --------------------------------------------------------------------------
    def merge(input, hash)
      unless input.respond_to?(:to_hash)
        raise ArgumentError.new("merge filter requires hash arguments: arg_input")
      end
      # if hash to merge is NOT a hash or empty return first hash (input)
      unless hash.respond_to?(:to_hash)
        input
      end
      if hash.nil? || hash.empty?
        input
      else
        merged = input.dup
        hash.each do |k, v|
          merged[k] = v
        end
        merged
      end
    end

    # --------------------------------------------------------------------------
    #  writeCookie: 
    #
    #  Example:
    #   
    # --------------------------------------------------------------------------
    def writeCookie(name, data)
      session_encoded = Base64.encode64(data)
      response.set_cookie(
          name,
          domain: false,
          value: session_encoded.to_s,
          path: '/'
      )
    end

    # --------------------------------------------------------------------------
    #  readCookie: 
    #
    #  Example:
    #   
    # --------------------------------------------------------------------------
    def readCookie(name)
      if env['HTTP_COOKIE'].include? name
        session_encoded = request.cookies[name]
        session_decoded = Base64.decode64(session_encoded)
        session_data = JSON.parse(session_decoded)
        return session_data
      else
        return {}
      end
    end

    # --------------------------------------------------------------------------
    #  existsCookie? 
    #
    #  Example:
    #   
    # --------------------------------------------------------------------------
    def existsCookie? (name)
      if env['HTTP_COOKIE'].include? name
        return true
      else
        return false
      end
    end

  end # END helpers
end # END module
