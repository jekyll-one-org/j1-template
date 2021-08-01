# ------------------------------------------------------------------------------
#  ~/lib/j1_app/j1_auth_manager/omniauth/strategies/github.rb
#
#  Provides OmniAuth OAuth2 strategy for Github
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
module OmniAuth
  module Strategies
    class GitHub < OmniAuth::Strategies::OAuth2

      # ========================================================================
      # OAuth client settings
      # ========================================================================

      DEFAULT_SCOPE = 'user'

      option :client_options, {
        :site => 'https://api.github.com',
        :authorize_url => 'https://github.com/login/oauth/authorize',
        :token_url => 'https://github.com/login/oauth/access_token'
      }

      def request_phase
        super
      end

      def authorize_params
        super.tap do |params|
          %w[scope client_options].each do |v|
            if request.params[v]
              params[v.to_sym] = request.params[v]
            end
            params[:scope] = get_scope(params)
          end
        end
      end

      def callback_url
        options[:redirect_uri] || full_host + script_name + callback_path
      end

      # ========================================================================
      # OAuth client data (returned by provider)
      # ========================================================================

      uid { raw_info['id'].to_s }

      info do
        {
          :description    => nil,
          :email          => email,
          :image          => raw_info['avatar_url'],
          :location       => raw_info['location'],
          :name           => raw_info['name'],
          :first_name     => nil,
          :last_name      => nil,
          :nickname       => raw_info['login'],
          :urls           => {
            'site'        => raw_info['html_url'],
            'blog'        => raw_info['blog'],
          },
          # Make payment_info always available
          #
          :payment_info   => {}
        }
      end

      extra do
        hash = {}
        hash['raw_info']    = raw_info unless skip_extra? || skip_info?
        hash['all_emails']  = emails unless skip_extra? || skip_info?
        hash
      end

      # ========================================================================
      # Helpers
      # ========================================================================

      private

      def raw_info
        access_token.options[:mode] = :query
        @raw_info ||= access_token.get('user').parsed
      end

      def email
        (email_access_allowed?) ? primary_email : raw_info['email']
      end

      def primary_email
        primary = emails.find{ |i| i['primary'] && i['verified'] }
        primary && primary['email'] || nil
      end

      # The new /user/emails API - http://developer.github.com/v3/users/emails/#future-response
      def emails
        return [] unless email_access_allowed?
        access_token.options[:mode] = :query
        @emails ||= access_token.get('user/emails', :headers => { 'Accept' => 'application/vnd.github.v3' }).parsed
      end

      def email_access_allowed?
        return false unless options['scope']
        email_scopes = ['user', 'user:email']
        scopes = options['scope'].split(',')
        (scopes & email_scopes).any?
      end

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

OmniAuth.config.add_camelization 'github', 'GitHub'