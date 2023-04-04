## Update Rubygems

gem install rubygems-update
update_rubygems
gem update --system


## Install a Ruby Gem

Add this line to your application's Gemfile:

``` ruby
gem 'j1_template', '~> 2023.1.0'
```

and install the locally created RubGem as:

``` sh
gem install --local j1-template --no-document
```

### Userized Installation

When you use the --user-install option, RubyGems will install the gems to a
directory inside your home directory, something like ~/.gem/ruby/1.9.1. The
commands provided by the gems you installed will end up in
~/.gem/ruby/1.9.1/bin.

  gem install j1-template --user-install --no-document

For the programs installed userized, you need to add ~/.gem/ruby/1.9.1/bin
to your PATH environment variable.

### Install a Gem in specific version

  gem install j1-template -v 2023.1.0 --user-install --no-document

You can also use version comparators like >= or ~>

  gem install j1-template -v "~> 2023.1.0" --user-install --no-document


### Install a Gem from different source

  gem install j1-template -v 2023.1.0 --source 'https://gem.fury.io/jekyll-one-org/' --user-install --no-document
