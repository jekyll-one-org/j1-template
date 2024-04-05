# ------------------------------------------------------------------------------
# ~/lib/j1_app/j1_auth_manager/omniauth/strategies/twitter.rb
#
# Provides OmniAuth OAuth2 strategy for Github
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023, 2024 Juergen Adams
# Copyright (C) 2012 Mark Dodwell
#
# J1 Theme is licensed under the MIT License
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
#
# omniauth-patreon-v2 is licensed under the MIT License
# See: https://github.com/doumart/omniauth-patreon-v2#license
#
# ------------------------------------------------------------------------------
# NOTES
#
# ------------------------------------------------------------------------------

# require 'omniauth-oauth2'
# require 'json'

module OmniAuth
  module Strategies
    class Twitter < OmniAuth::Strategies::OAuth2

      # ========================================================================
      # OAuth client settings
      # ========================================================================

      DEFAULT_SCOPE = 'user'

      option :name, 'twitter'
      option :client_options, {
        :authorize_path => '/oauth/authenticate',
        :site => 'https://api.twitter.com',
        :proxy => ENV['http_proxy'] ? URI(ENV['http_proxy']) : nil
      }

      uid { access_token.params[:user_id] }

      info do
        {
          :description    => raw_info['description'],
          :email          => raw_info["email"],
          :image          => image_url,
          :location       => raw_info['location'],
          :name           => raw_info['name'],
          :first_name     => nil,
          :last_name      => nil,
          :nickname       => raw_info['screen_name'].gsub('ä','ae').gsub('ö','oe').gsub('ü','ue').gsub(' ','_').downcase,
          :urls           => {
            'site'        => raw_info['url'],
            'blog'        => "https://twitter.com/#{raw_info['screen_name']}",
          },
          :payment_info   => {}
        }
      end

      # ========================================================================
      # OAuth client data (returned by provider)
      # ========================================================================

      extra do
        hash = {}
        hash['raw_info']  = raw_info unless skip_extra? || skip_info?
        hash
      end

      def raw_info
        @raw_info ||= JSON.load(access_token.get('/1.1/account/verify_credentials.json?include_entities=false&skip_status=true&include_email=true').body)
      rescue ::Errno::ETIMEDOUT
        raise ::Timeout::Error
      end

      alias :old_request_phase :request_phase

      def request_phase
        %w[force_login lang screen_name].each do |v|
          if request.params[v]
            options[:authorize_params][v.to_sym] = request.params[v]
          end
        end

        %w[x_auth_access_type].each do |v|
          if request.params[v]
            options[:request_params][v.to_sym] = request.params[v]
          end
        end

        if options[:use_authorize] || request.params['use_authorize'] == 'true'
          options[:client_options][:authorize_path] = '/oauth/authorize'
        else
          options[:client_options][:authorize_path] = '/oauth/authenticate'
        end

        old_request_phase
      end

      alias :old_callback_url :callback_url

      def callback_url
        if request.params['callback_url']
          request.params['callback_url']
        else
          old_callback_url
        end
      end

      def callback_path
        params = session['omniauth.params']

        if params.nil? || params['callback_url'].nil?
          super
        else
          URI(params['callback_url']).path
        end
      end

      # ========================================================================
      # Helpers
      # ========================================================================

      private

      def image_url
        original_url = options[:secure_image_url] ? raw_info['profile_image_url_https'] : raw_info['profile_image_url']
        case options[:image_size]
        when 'mini'
          original_url.sub('normal', 'mini')
        when 'bigger'
          original_url.sub('normal', 'bigger')
        when 'original'
          original_url.sub('_normal', '')
        else
          original_url
        end
      end

      def prune!(hash)
        hash.delete_if do |_, value|
          prune!(value) if value.is_a?(Hash)
          value.nil? || (value.respond_to?(:empty?) && value.empty?)
        end
      end

      def skip_extra?
        !!options[:skip_extra]
      end

    end
  end
end