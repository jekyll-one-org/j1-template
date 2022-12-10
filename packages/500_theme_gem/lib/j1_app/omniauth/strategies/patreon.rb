# ------------------------------------------------------------------------------
# ~/lib/j1_app/j1_auth_manager/omniauth/strategies/github.rb
#
# Provides OmniAuth OAuth2 strategy for Github
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2022 Juergen Adams
# Copyright (C) 2012 Mark Dodwell
#
# J1 Theme is licensed under the MIT License
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
#
# omniauth-patreon-v2 is licensed under the MIT License
# See: https://github.com/doumart/omniauth-patreon-v2#license
#
# ------------------------------------------------------------------------------
# NOTES
#
# ------------------------------------------------------------------------------

require 'omniauth/strategies/oauth2'
require 'json'

module OmniAuth
  module Strategies
    class Patreon < OmniAuth::Strategies::OAuth2

      # ========================================================================
      # OAuth client settings
      # ========================================================================

      DEFAULT_SCOPE = 'users, pledges-to-me'

      option :name, 'patreon'
      option :client_options, {
          :authorize_url => '/oauth2/authorize',
          :site => 'https://www.patreon.com',
          :token_url => '/api/oauth2/token'
      }

      def callback_url
        options[:redirect_uri] || full_host + script_name + callback_path
      end

      # ========================================================================
      # OAuth client data (returned by provider)
      # ========================================================================

      uid { raw_info["data"]["id"] }

      info do
        {
         :allowed         => nil,
         :blacklisted     => nil,
         :description     => nil,
         :email           => raw_info['data']['attributes']['email'],
         :image           => nil,
         :location        => nil,
         :name            => raw_info['data']['attributes']['full_name'],
         :first_name      => nil,
         :last_name       => nil,
         :nickname        => raw_info['data']['attributes']['full_name'].gsub('ä','ae').gsub('ö','oe').gsub('ü','ue').gsub(' ','_').downcase,
         :payment_info    => raw_info['included'].nil? ? {} : raw_info['included'][0],
         :payment_status  => nil,
         :urls            => {
           'site'         => nil,
           'blog'         => nil
         },
         :whitelisted     => nil
        }
      end

      def authorize_params
        super.tap do |params|
          options[:authorize_options].each do |k|
            params[k] = request.params[k.to_s] unless [nil, ''].include?(request.params[k.to_s])
          end
          params[:scope] = get_scope(params)
          session['omniauth.state'] = params[:state] if params[:state]
        end
      end

      extra do
        hash = {}
        hash['raw_info'] = raw_info unless skip_extra? || skip_info?
        hash
      end

      def raw_info
        @raw_info ||= begin
          response = client.request(
              :get, 'https://api.patreon.com/oauth2/api/current_user',
              headers: {
                  'Authorization' => "Bearer #{access_token.token}"
              },
              parse: :json
          )
          response.parsed
        end
      end

      # ========================================================================
      # Helpers
      # ========================================================================

      private

      def get_scope(params)
        raw_scope = params[:scope] == '' ? DEFAULT_SCOPE : params[:scope]
        scope_list = raw_scope.split(' ').map { |item| item.split(',') }.flatten
        scope_list.join(' ')
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