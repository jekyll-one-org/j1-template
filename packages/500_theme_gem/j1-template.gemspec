# ------------------------------------------------------------------------------
#  J1: ~/packages/500_theme_gem/j1-template.gemspec
#  Provides Gem Spec information to create the gem-based Template
#  for J1 Theme
#
#  Product/Info:
#  https://jekyll.one
#
#  Copyright (C) 2022 Juergen Adams
#
#  J1 Theme is licensed under the MIT License.
#  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
#
# ------------------------------------------------------------------------------
# NOTE:
#   Removed spec.add_runtime_dependency 'activesupport'. Conflicts with
#   Jekyll (3.8) that requires version 5.0.7 already
#
#   Deactivated spec.add_runtime_dependency for test. No tests
#   currently used from former Rubie 'jekyll-auth'
#
# ------------------------------------------------------------------------------
#
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'j1/version'

Gem::Specification.new do |spec|

  spec.name          = 'j1-template'
  spec.version       = J1::VERSION
  spec.authors       = ['juergen_jekyll_one']
  spec.email         = ['juergen@jekyll.one']

  spec.summary       = %q{J1 Theme}
  spec.description   = %q{J1 Theme is a gem-based, clean, responsive and fully featured template made for Jekyll}
  spec.homepage      = 'https://jekyll.one'
  spec.license       = 'MIT'

  # Prevent|Allow pushing this spec.add_runtime_dependency to RubyGems.org. To allow pushes either
  # set the 'allowed_push_host' to allow pushing to a single host or delete
  # this section to allow pushing to any host.

  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = 'https://rubygems.org'
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
          'public spec.add_runtime_dependency pushes.'
  end

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r{^(exe|lib|_data|_sass|_includes|_layouts|_plugins|apps|assets|LICENSE|README.md|screenshot.png)}i) }
  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})

  # Dependencies: Jekyll
  #
  spec.add_runtime_dependency 'jekyll', '~> 4.0'
  spec.add_runtime_dependency 'pathutil', '~> 0.16'
  spec.add_runtime_dependency 'mercenary', '~> 0.3'
  spec.add_runtime_dependency 'colorator', '~> 1.0'

  # Dependencies: Runtime Web Application
  #
  spec.add_runtime_dependency 'rack', '~> 2.0', '>= 2.0.8'
  spec.add_runtime_dependency 'rack-protection', '~> 2.0'
  spec.add_runtime_dependency 'rack-ssl-enforcer', '~> 0.2'
  spec.add_runtime_dependency 'rest-client', '~> 2.0'
  spec.add_runtime_dependency 'sinatra', '~> 2.0'
  spec.add_runtime_dependency 'warden', '~> 1.2'

  # Dependencies: Runtime Addons (currently NOT used)
  #
  # spec.add_runtime_dependency 'sinatra-cross_origin', '~> 0.3.1'

  # Dependencies: Logging
  #
  spec.add_runtime_dependency 'log4r', '~> 1.1', '>= 1.1.10'
  spec.add_runtime_dependency 'date', '~> 2.0'

  # Dependencies: Authentication
  #
  # NOTE:
  # For the base gem omniauth, the currtent version >= 2 cannot be
  # used. For unknown reason, a WRONG redirect URL is calculated
  # e.g. for strategy oauth2/github
  #   Wrong:    http://localhost:xxx/auth/github
  #   Correct:  https://github.com/login?client_id=xx&return=yyy
  #
  # spec.add_runtime_dependency 'omniauth', '~> 2.0'
  # ----------------------------------------------------------------------------
  #
  spec.add_runtime_dependency 'omniauth', '~> 1.0'
  spec.add_runtime_dependency 'omniauth-oauth2', '~> 1.7'

  # Dependencies: Development
  #
  spec.add_runtime_dependency 'bump', '~> 0.8'

  # Dependencies: Development Tools (currentlyNOT used)
  #
  # spec.add_runtime_dependency 'pry', '~> 0.10'
  # spec.add_runtime_dependency 'rack-test', '~> 0.6'
  # spec.add_runtime_dependency 'rspec', '~> 3.1'
  # spec.add_runtime_dependency 'rubocop', '~> 0.49', '>= 0.49.0'
  # spec.add_runtime_dependency 'webmock', '~> 1.2 '

end
