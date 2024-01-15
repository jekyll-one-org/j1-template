# ------------------------------------------------------------------------------
# ~/lib/j1_app/j1_auth_manager/omniauth/strategies/github.rb
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
    class Disqus < OmniAuth::Strategies::OAuth2

      # ========================================================================
      # OAuth client settings
      # ========================================================================

      DEFAULT_SCOPE = 'read write email'

      option :name, 'disqus'
      option :client_options, {
        :site          => 'https://disqus.com',
        :authorize_url => '/api/oauth/2.0/authorize/',
        :token_url     => '/api/oauth/2.0/access_token/'
      }

      def callback_url
        options[:redirect_uri] || full_host + script_name + callback_path
      end

      # ========================================================================
      # OAuth client data (returned by provider)
      # ========================================================================

      uid { access_token.params['user_id'] }

      info do
        {
          :description    => raw_info['about'],
          :email          => nil,
          :image          => raw_info['avatar']['small']['permalink'],
          :location       => raw_info['location'],
          :name           => raw_info['name'],
          :first_name     => nil,
          :last_name      => nil,
          :nickname       => raw_info['username'].gsub('ä','ae').gsub('ö','oe').gsub('ü','ue').gsub(' ','_').downcase,
          :urls           => {
            'site'        => raw_info['profileUrl'],
            'blog'        => nil
          },
          # Make payment_info always available
          #
          :payment_info   => {}
        }
      end

      extra do
        hash = {}
        hash['raw_info'] = raw_info unless skip_extra? || skip_info?
        hash
      end

      def raw_info
        url    = '/api/3.0/users/details.json'
        params = {
          'api_key'      => access_token.client.id,
          'access_token' => access_token.token
        }
        @raw_info ||= access_token.get(url, :params => params).parsed['response']
      end

      # ========================================================================
      # Helpers
      # ========================================================================

      private

      def get_scope(params)
        raw_scope = params[:scope] || DEFAULT_SCOPE
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