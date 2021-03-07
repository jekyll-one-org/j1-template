# Heroku build notes
# ------------------------------------------------------------------------------
# heroku apps:destroy j1-preview
#
# heroku apps:create j1-preview
# --
# Creating j1-preview... done
# https://j1-preview.herokuapp.com/ | https://git.heroku.com/j1-preview.git
#
# heroku logs -a j1-preview --tail
#
# git remote add heroku https://git.heroku.com/j1-preview.git
# git push heroku master
#
# heroku apps:errors -a j1-preview
# === Errors on j1-preview in the last 24 hours
# source  name  level     desc              count
# ──────  ────  ────────  ────────────────  ─────
# router  H10   critical  App Crashed       7
# router  H20   critical  App boot timeout  3
#
# heroku dyno:restart -a j1-preview
#
# h#eroku dyno:kill DYNO -a j1-preview
#
# heroku run bash -a j1-preview
#
# heroku login
# --
# heroku: Enter your login credentials
# Email [email_name@domain]:
# Password: *********
# Logged in as email_name@domain
#
#
# cls && heroku logs -a j1-preview --tail
#


== Managing config vars

Whenever you set or remove a config var using any method, your app is
*restarted* and a new release is created.

# See: https://devcenter.heroku.com/articles/config-vars
#
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# heroku config:set PATREON_CLIENT_ID=
# heroku config:set PATREON_CLIENT_SECRET=

# Windows:
#   set J1_PROJECT_HOME=%cd%

# UNIX:
#   export J1_PROJECT_HOME=`pwd`
# NOTE: On Heroku, typically "/app"

# On Heroku
#   heroku config:set J1_PROJECT_HOME="/app"
