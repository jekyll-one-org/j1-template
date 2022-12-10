# Update Rubygems

gem install rubygems-update
update_rubygems
gem update --system

# J1 Theme MDE 4

Welcome to your new gem! In this directory, you'll find the files you need to
be able to package up your Ruby library into a gem. Put your Ruby code in the
file `lib/j1`. To experiment with that code, run `bin/console` for
an interactive prompt.

## Create the RubyGem

The creation process is controlled by the (gemspec) configuration file
*j1-template.gemspec*. This configuration is used by the Ruby
commandline utility `gem` called like so:

``` sh
gem build j1-template.gemspec
```

## Installation

Add this line to your application's Gemfile:

``` ruby
gem 'j1_template', '~> 2023.0.0'
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


For the programs installed there to be available for
you, you need to add ~/.gem/ruby/1.9.1/bin to your PATH environment variable.

For example, if you use bash you can add that directory to your PATH by
adding code like this to your ~/.bashrc file:


## Usage

To install a Starter Web, simply run:

``` sh
j1 generate starter
```

This will create a general purpose skeleton under folder `starter`. To startup
a Web using Jekyll, run on *Linux* or *MacOS*:

``` sh
cd starter
j1server.sh
```
or on *Windows*:

``` sh
cd starter
j1server.bat
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. You can
also run `bin/console` for an interactive prompt that will allow you to
experiment.

To install this gem onto your local machine, run `bundle exec rake install`.
To release a new version, update the version number in `version.rb`, and then
run `bundle exec rake release`, which will create a git tag for the version,
push git commits and tags, and push the `.gem` file to
[rubygems.org](https://rubygems.org).


## Contributing

Bug reports and pull requests are welcome at
[GitHub](https://github.com/jekyll-one-org/J1 Theme).


## License

The gem is available as OpenSource under the terms of the
[MIT License](https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md).
