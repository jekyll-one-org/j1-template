# ------------------------------------------------------------------------------
# ~/lib/j1_app/j1_auth_manager/omniauth/strategies/helpers_disqus.rb
#
# Provides helper methods for the disqus omniauth strategy
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023-2025 Juergen Adams
#
# J1 Theme is licensed under the MIT License
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
#
# ------------------------------------------------------------------------------
# NOTES
#
# ------------------------------------------------------------------------------
module J1App
  module DisqusHelpers

    # The authenticated user object
    #
    # Supports a variety of methods, name, full_name, email, etc
    def disqus_user
      warden.user
    end

  end
end