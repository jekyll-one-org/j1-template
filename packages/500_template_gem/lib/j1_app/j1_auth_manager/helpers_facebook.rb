# ------------------------------------------------------------------------------
# ~/lib/j1_app/j1_auth_manager/omniauth/strategies/helpers_facebook.rb
#
# Provides helper methods for the facebook omniauth strategy
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2021 Juergen Adams
#
# J1 Template is licensed under the MIT License
# See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
#
# ------------------------------------------------------------------------------
# NOTES
#
# ------------------------------------------------------------------------------
module J1App
  module FacebookHelpers

    # The authenticated user object
    #
    # Supports a variety of methods, name, full_name, email, etc
    def facebook_user
      warden.user
    end

  end
end