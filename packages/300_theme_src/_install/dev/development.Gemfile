# ------------------------------------------------------------------------------
# ~/Gemfile (development)
# Provides package information to bundle all Ruby gem needed
# for Jekyll and J1 Theme (managed by Ruby Gem Bundler)
#
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023-2025 Juergen Adams
#
# J1 Template is licensed under the MIT License.
# See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE
# ------------------------------------------------------------------------------
# NOTE:
# Make sure, the syntax used for the Gemfile is compatible with the
# Ruby Gem Bundler
# ------------------------------------------------------------------------------
# NOTE:
# To install all gem needed for Jekyll and J1 Theme:
#   bundle install
# ------------------------------------------------------------------------------
# TIP:
# When all packages needed are installed, a list of all gem and dependencies
# installed for the bundle canbe created by running:
#   bundle list
# ------------------------------------------------------------------------------
# NOTE:
# When you see warnings like:
#   WARN: Unresolved specs during Gem::Specification.reset
# you may need to cleanup your bundle by running:
#   gem cleanup
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Define the source, Ruby GEMs are loaded (from remote)
#
source 'https://rubygems.org'

# ------------------------------------------------------------------------------
# Specify your Ruby version when the J1 Project is used as an container-based
# web application. This makes sure to use identical Ruby runtime environments
# for BUILD and RUN (e.g. for Docker images, builds on Netlify or Heroku).
# ------------------------------------------------------------------------------
#
# ruby '3.3.6'

# ------------------------------------------------------------------------------
# Jekyll
# ------------------------------------------------------------------------------
# NOTE:
# J1 Theme is using Jekyll v4
#
# ------------------------------------------------------------------------------
# NOTE:
# Install Jekyll loaded from 'Github' (branch: master):
#   gem 'jekyll', github: 'jekyll/jekyll'
#
# Install latest Jekyll V4 GEM from 'RubyGems' (remote)
# gem 'jekyll', '~> 4.0'
#
# Install Jekyll version platform-specific:
#
# On Windows platforms, install e.g. older Jekyll GEM
# install_if -> { RUBY_PLATFORM =~ /mswin/ } do
#   gem 'jekyll', '= 4.3.3'
# end
#
# On *nix and MacOS platforms, install e.g. latest Jekyll GEM
# install_if -> { RUBY_PLATFORM =~ /(aix|darwin|linux|(net|free|open)bsd|cygwin|solaris|irix|hpux)/i } do
#   gem 'jekyll', '~> 4.0'
# end
#
# ------------------------------------------------------------------------------
#
gem 'jekyll', '= 4.3.3'

# ------------------------------------------------------------------------------
# Install Webrick GEM (internally used Web Server) when Ruby V3 is used.
#
install_if -> { RUBY_VERSION =~ /3/ } do
  gem 'webrick', '~> 1.9'
end

# ------------------------------------------------------------------------------
# Install GEM csv (to suppress warnings) when Ruby version >= 3.3 is used.
#
# NOTE: The GEM will no longer be part of the default gems starting
# from Ruby 3.4.0
#
install_if -> { RUBY_VERSION =~ /3.3/ } do
   gem 'csv', '~> 3.0'
end

# ------------------------------------------------------------------------------
# Code Highlighter Rouge
#
gem 'rouge', '~> 4.0'

# ------------------------------------------------------------------------------
# XML|HTML processing
#
gem 'builder', '~> 3.2'
gem 'nokogiri', '>= 1.10.3'
gem 'nokogiri-pretty', '>= 0.1.0'
gem 'htmlbeautifier', '>= 1.2.1'

# ------------------------------------------------------------------------------
# Compress JS and JSON files
#
gem 'uglifier', '~> 4.2'
gem 'json-minify', '~> 0.0.3'

# ------------------------------------------------------------------------------
# Run JS code (from Ruby) to create the index for Lunr
#
gem 'execjs', '~> 2.7'

# ------------------------------------------------------------------------------
# Timezone support (multi-platform)
#
gem 'tzinfo', '>= 1.2.2'

# ------------------------------------------------------------------------------
# Platform specific GEM
#
# NOTE:
# Windows does not include zoneinfo files (timezone support).
# To provide zoneinfo, tzinfo-data gem is bundled on win platforms
#
# ------------------------------------------------------------------------------
# NOTE:
# Windows Directory Monitor (WDM) required to monitor directories
# for changes
#
# ------------------------------------------------------------------------------
#
install_if -> { Gem.win_platform? } do
  gem 'tzinfo-data'
  gem 'wdm', '>= 0.1.1'
end

# ------------------------------------------------------------------------------
# Jekyll Plugins
# If any (additional) Jekyll Plugins are required, they goes here
#
group :jekyll_plugins do
  # Base Jekyll Plugins (required)
  #
  gem 'asciidoctor', '~> 2.0'
  gem 'jekyll-asciidoc', '>= 3.0'
  gem 'j1-paginator', '>= 2024.1'
  #
  # Additional Supporting GEMs (optional)
  #
  # gem 'algolia', '~> 2.0', '>= 2.0.4'                                         # Required for Algolia support only
  # gem 'asciidoctor-pdf', '>= 1.5.4'                                           # Required for Asciidoctor PDF creation only
  # gem 'jekyll-sass-converter', '>= 2.1.0'                                     # Required for Jekyll|SASS (file) conversion support
  #
  # Additional Jekyll Plugins  (optional)
  #
  # gem 'jekyll-admin', '~> 0.11'
  # gem 'jekyll-archives', '~> 2.2
  # gem 'jekyll-gist', '>= 1.5.0'
  # gem 'jekyll-redirect-from', '>= 0.16.0'
end

# ------------------------------------------------------------------------------
# GEM needed for the Jekyll and J1 dev environment
#
# NOTE:
# For the build (npm|yarn), J1 Theme is using scss_lint
# for linting the SCSS (Sass) components.
#
# ------------------------------------------------------------------------------
# NOTE:
# scss_lint is based on old gem 'sass', '~> 3.5.5'. A replacement
# is needed (?) for a linter using the new Ruby Sass GEM (sassc)
# gem 'scss_lint', '~> 0.56.0', require: false
#
# ------------------------------------------------------------------------------
gem 'bump', '~> 0.10'
gem 'sassc', '~> 2.4'
gem 'safe_yaml', '~> 1.0', '>= 1.0.5'

# ------------------------------------------------------------------------------
# Web Application specific RubyGems
#

# ------------------------------------------------------------------------------
# Ruby Task Manager
#
# NOTE:
# Enable the `rake` Gem when needed. For container-based apps, Rake can
# be used as a pre-processor engine running # tasks defined by a
# Rakefile prior running the app|web.
#
# ------------------------------------------------------------------------------
# gem 'rake', '~> 12.0'

# html-proofer. Automate the process of checking links on your site
#
#   bundle exec htmlproofer \
#     --allow_missing_href \
#     --allow_hash_href \
#     --assume_extension \
#     --directory_index_file \
#     --directory_index_file \
#     --empty_alt_ignore ./_site/index.html &> out.txt
#
# gem 'html-proofer', '~> 3.10'

# ------------------------------------------------------------------------------
# Web server used by applications
#
# NOTE:
# Define the build environment and the web server for J1 sites that
# runs as an web application. To improve the production (run-time)
# performance for the web, the RubyGems e.g Puma or Passenger can be
# used to replace the internal server WEBrick used by Jekyll for
# default.
# The web server Puma, a multi-threaded native Ruy-based web server
# can be used on ALL platforms. Passenger integrates the web server
# NginX but supported for Linux and Unix platforms only.
# For container-based apps, Rake can be used as a pre-processor engine
# running # tasks defined by a Rakefile prior running the app|web.
#
# ------------------------------------------------------------------------------
#
gem 'puma', '>= 6.0'

# ------------------------------------------------------------------------------
# Data encryption (currently NOT supported)
#
# NOTE:
# OpenSSL provides SSL, TLS and general purpose cryptography. Used to
# encrypt 'private' data used by applications.
#
# ------------------------------------------------------------------------------
# gem 'openssl'

# ------------------------------------------------------------------------------
# Runtime environment for applications
#
# NOTE:
# When sformed into a (Rack and Sinatra based) Web application, the site 
# can be secured using user authentication for accessing private pages.
# J1 is using the Omniauth stack for authentication. For default, the
# Omniauth (authentication) strategies for Github, Twitter, Facebook and
# Patreon are implemented.
#
# ------------------------------------------------------------------------------+#
# sinatra v4 requires rack v3
# gem 'rack', '~> 2.2', '>= 2.2.3'
gem 'rack', '~> 2.2', '>= 2.2.3'

gem 'rack-protection', '~> 2.0'
gem 'rack-ssl-enforcer', '~> 0.2'
gem 'rest-client', '~> 2.0'

# update sinatra v2 -> v4 for security reasons
# gem 'sinatra', '~> 4.0'
gem 'sinatra', '~> 2.0'

gem 'warden', '~> 1.2'

# ------------------------------------------------------------------------------
# Authentication
#
# NOTE:
# For the base gem omniauth, the currtent version >= 2 cannot be
# used. For unknown reason, a WRONG redirect URL is calculated
# e.g. for strategy oauth2/github
#   Wrong:    http://localhost:xxx/auth/github
#   Correct:  https://github.com/login?client_id=xx&return=yyy
#
# ------------------------------------------------------------------------------
# Note:
# For upcoming J1 versions, v2.x version will be used
# gem 'omniauth', '~> 2.0'
# ------------------------------------------------------------------------------
gem 'omniauth', '~> 1.9'
gem 'omniauth-oauth2', '~> 1.7'

# ------------------------------------------------------------------------------
# Logging
# GEM required for J1 logger based on log4r (middleware)
# ------------------------------------------------------------------------------
gem 'log4r', '~> 1.1', '>= 1.1.10'
gem 'date', '~> 3.0'

# ------------------------------------------------------------------------------
# END