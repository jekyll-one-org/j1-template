# ------------------------------------------------------------------------------
# ~/lib/j1_app/j1_auth_manager/omniauth/strategies/helpers_github.rb
#
# Provides helper methods for the github omniauth strategy
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023 Juergen Adams
#
# J1 Theme is licensed under the MIT License
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
#
# ------------------------------------------------------------------------------
# NOTES
#
# ------------------------------------------------------------------------------
module J1App
  module GithubHelpers

    # The authenticated user object
    #
    # Supports a variety of methods, name, full_name, email, etc
    def github_user
      warden.user
    end

    # Send a V3 API GET request to path
    #
    # path - the path on api.github.com to hit
    #
    # Returns a rest client response object
    #
    # Examples
    #   github_raw_request("/user")
    #   # => RestClient::Response
    def github_raw_request(path)
      github_user.github_raw_request(path)
    end

    # Send a V3 API GET request to path and parse the response body
    #
    # path - the path on api.github.com to hit
    #
    # Returns a parsed JSON response
    #
    # Examples
    #   github_request("/user")
    #   # => { 'login' => 'atmos', ... }
    def github_request(path)
      github_user.github_request(path)
    end

    # See if the user is a public member of the named organization
    #
    # name - the organization name
    #
    # Returns: true if the user is public access, false otherwise
    def github_public_organization_access?(name)
      github_user.publicized_organization_member?(name)
    end

    # See if the user is a member of the named organization
    #
    # name - the organization name
    #
    # Returns: true if the user has access, false otherwise
    def github_organization_access?(name)
      github_user.organization_member?(name)
    end

    # See if the user is a member of the team id
    #
    # team_id - the team's id
    #
    # Returns: true if the user has access, false otherwise
    def github_team_access?(team_id)
      github_user.team_member?(team_id)
    end

    # Enforce publicized user membership to the named organization
    #
    # name - the organization to test membership against
    #
    # Returns an execution halt if the user is not a publicized member of the named org
    def github_public_organization_authenticate!(name)
      authenticate!
      halt([401, "Unauthorized User"]) unless github_public_organization_access?(name)
    end

    # Enforce user membership to the named organization
    #
    # name - the organization to test membership against
    #
    # Returns an execution halt if the user is not a member of the named org
    def github_organization_authenticate!(name)
      authenticate!
      halt([401, "Unauthorized User"]) unless github_organization_access?(name)
    end

    # Enforce user membership to the team id
    #
    # team_id - the team_id to test membership against
    #
    # Returns an execution halt if the user is not a member of the team
    def github_team_authenticate!(team_id)
      authenticate!
      halt([401, "Unauthorized User"]) unless github_team_access?(team_id)
    end

  end
end
