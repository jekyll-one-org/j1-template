# ------------------------------------------------------------------------------
# ~/lib/j1_app/j1_auth_manager/omniauth/strategies/github.rb
#
# Provides OmniAuth OAuth2 strategy for Github
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023-2025 Juergen Adams
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

#require 'omniauth-oauth2'
#require 'omniauth/facebook/signed_request'
require 'openssl'
require 'rack/utils'
require 'uri'

require_relative '../facebook/signed_request'

module OmniAuth
  module Strategies
    class Facebook < OmniAuth::Strategies::OAuth2

      class NoAuthorizationCodeError < StandardError; end

      # ========================================================================
      # OAuth client settings
      # ========================================================================

      DEFAULT_SCOPE = 'email'

      option :client_options, {
          site: 'https://graph.facebook.com/v2.10',
          authorize_url: "https://www.facebook.com/v2.10/dialog/oauth",
          token_url: 'oauth/access_token'
      }

      option :access_token_options, {
          header_format: 'OAuth %s',
          param_name: 'access_token'
      }

      option :authorize_options, [:scope, :display, :auth_type]

      uid { raw_info['id'] }

      info do
        {
          'description'   => raw_info['bio'],
          'email'         => raw_info['email'],
          'image'         => image_url(uid, options),
          'location'      => (raw_info['location'] || {})['name'],
          'name'          => raw_info['name'],
          'first_name'    => raw_info['first_name'],
          'last_name'     => raw_info['last_name'],
          'nickname'      => raw_info['username'].gsub('ä','ae').gsub('ö','oe').gsub('ü','ue').gsub(' ','_').downcase,
          'urls'          => {
             'site'       => raw_info['link'],
             'blog'       => raw_info['website']
          },
          :payment_info   => {}
        }
      end

      extra do
        hash = {}
        hash['raw_info']  = raw_info unless skip_extra? || skip_info?
        hash
      end

      def raw_info
        @raw_info ||= access_token.get('me', info_options).parsed || {}
      end

      def info_options
        params = {appsecret_proof: appsecret_proof}
        params.merge!({fields: (options[:info_fields] || 'name,email')})
        params.merge!({locale: options[:locale]}) if options[:locale]

        { params: params }
      end

      def callback_phase
        with_authorization_code! do
          super
        end
      rescue NoAuthorizationCodeError => e
        fail!(:no_authorization_code, e)
      rescue OmniAuth::Facebook::SignedRequest::UnknownSignatureAlgorithmError => e
        fail!(:unknown_signature_algorithm, e)
      end

      # NOTE If we're using code from the signed request then FB sets the redirect_uri to '' during the authorize
      #      phase and it must match during the access_token phase:
      #      https://github.com/facebook/facebook-php-sdk/blob/master/src/base_facebook.php#L477
      def callback_url
        if @authorization_code_from_signed_request_in_cookie
          ''
        else
          # Fixes regression in omniauth-oauth2 v1.4.0 by https://github.com/intridea/omniauth-oauth2/commit/85fdbe117c2a4400d001a6368cc359d88f40abc7
          options[:callback_url] || (full_host + script_name + callback_path)
        end
      end

      def access_token_options
        options.access_token_options.inject({}) { |h,(k,v)| h[k.to_sym] = v; h }
      end

      # You can pass +display+, +scope+, or +auth_type+ params to the auth request, if you need to set them dynamically.
      # You can also set these options in the OmniAuth config :authorize_params option.
      #
      # For example: /auth/facebook?display=popup
      def authorize_params
        super.tap do |params|
          %w[display scope auth_type].each do |v|
            if request.params[v]
              params[v.to_sym] = request.params[v]
            end
          end

          params[:scope] ||= DEFAULT_SCOPE
        end
      end

      protected

      def build_access_token
        super.tap do |token|
          token.options.merge!(access_token_options)
        end
      end

      private

      def signed_request_from_cookie
        @signed_request_from_cookie ||= raw_signed_request_from_cookie && OmniAuth::Facebook::SignedRequest.parse(raw_signed_request_from_cookie, client.secret)
      end

      def raw_signed_request_from_cookie
        request.cookies["fbsr_#{client.id}"]
      end

      # Picks the authorization code in order, from:
      #
      # 1. The request 'code' param (manual callback from standard server-side flow)
      # 2. A signed request from cookie (passed from the client during the client-side flow)
      def with_authorization_code!
        if request.params.key?('code')
          yield
        elsif code_from_signed_request = signed_request_from_cookie && signed_request_from_cookie['code']
          request.params['code'] = code_from_signed_request
          @authorization_code_from_signed_request_in_cookie = true
          # NOTE The code from the signed fbsr_XXX cookie is set by the FB JS SDK will confirm that the identity of the
          #      user contained in the signed request matches the user loading the app.
          original_provider_ignores_state = options.provider_ignores_state
          options.provider_ignores_state = true
          begin
            yield
          ensure
            request.params.delete('code')
            @authorization_code_from_signed_request_in_cookie = false
            options.provider_ignores_state = original_provider_ignores_state
          end
        else
          raise NoAuthorizationCodeError, 'must pass either a `code` (via URL or by an `fbsr_XXX` signed request cookie)'
        end
      end

      def image_url(uid, options)
        uri_class = options[:secure_image_url] ? URI::HTTPS : URI::HTTP
        site_uri = URI.parse(client.site)
        url = uri_class.build({host: site_uri.host, path: "#{site_uri.path}/#{uid}/picture"})

        query = if options[:image_size].is_a?(String) || options[:image_size].is_a?(Symbol)
                  { type: options[:image_size] }
                elsif options[:image_size].is_a?(Hash)
                  options[:image_size]
                end
        url.query = Rack::Utils.build_query(query) if query

        url.to_s
      end

      def appsecret_proof
        @appsecret_proof ||= OpenSSL::HMAC.hexdigest(OpenSSL::Digest::SHA256.new, client.secret, access_token.token)
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