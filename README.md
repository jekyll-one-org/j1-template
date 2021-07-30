# All you need for your new amazing site

Jekyll meets Bootstrap - and makes a lot of friends. J1 Template combines
the best of OpenSource software for the Web and the Web site generator
`Jekyll`. J1 is OpenSource, and so are the packaged modules - no pain for
private or professional use. Explore this site to learn what's possible if
you go to the Jekyll Way.

![Screenshot](https://github.com/jekyll-one-org/j1-template/raw/main/home-screenshot.jpg "J1 Starter Web")

* Fully Responsive. J1 Template supports modern web browsers on all
  devices for best results on PCs, Tablets, and SmartPhones.
* Full Bootstpap V4 support. Current Technology and Design. Excellent
  performance running desktop and mobile websites. Use Jekyll One to
  present your content at its best.
* Start in no time. No programming is needed to start using J1. The
  Template provides a large number of building blocks to create modern
  web pages in minutes.


**Create powerful modern Static Webs: Secure, Flexible and Fast.**

Have fun!

# Live Demo

The template comes with a Web included, a skeleton for your new Web site.
This Web is called the **Starter Web**, a general-purpose Website scaffold to
be modified for your needs. The built-in Starter Web can be visited live
at [Netlify](https://j1-template-starter.netlify.app/).

**Have fun exploring what a modern static web, a Jekyll site can do**!

# Features

The template combines the best free software for the web. Jekyll One Template
is OpenSource and the modules included are free to use as well. No license
issues for private or professional use.

* Fully Responsive. J1 Template supports modern web browsers on all
  devices for best results on PCs, Tablets, and SmartPhones.
* Full Bootstpap V4 support. Current Technology and Design. Excellent
  performance running desktop and mobile websites. Use Jekyll One to
  present your content at its best.
* Start in no time. No programming is needed to start using J1. The
  Template provides a large number of building blocks to create modern
  web pages in minutes.

## General

* Jekyll 4.2 support
* Ruby 2.7 support
* Asciidoc (Asciidoctor) and Markdown support
* Asciidoctor plugins included
* Bootstrap V4 (v4.6)
* Responsive Design
* Material Design
* Responsive Text
* Responsive HTML tables
* Compressed HTML, CSS and Javascript support
* Themes support (Bootswatch)
* Icon Font support (MDI, FA, Iconify, Twitter Emoji)
* Themeable source code highlighting (Rouge)
* Desktop and Mobile Web and Navigation ready
* Fully configurable
* 100/100 Google Lighthouse scores

## Modules and Extensions

* Bootstrap extensions included
* Asciidoctor extensions included
* Smooth-srcoll support
* Full-text search engine included (Lunr)
* Blog Post navigation included
* Clipboard module included
* Floating Action Buttons included
* Navigation modules included
* Lightbox modules included
* Gallery modules included
* Carousel module included
* Video modules included

## Addons and Integrations

* Featured example content included
* Royalty free images included
* Disqus support
* Google Analytics support
* Deploy to Github Pages, Netlify and Heroku ready

# Supported platforms

J1 is supported on all current x64-based OS:

* Windows 10, build >= 1903
* Windows WSL 2
* Linux, kernel version >= 4.15 (e.g. Ubuntu  18.x LTS)
* OSX, version >= 10.10.5 (Yosemite)

Note that 32-bit versions (x32) are generally NOT supported for all
platforms.


# Development languages and tools

To run the Development System for J1 Template, the following languages and
tools expected to be in place with your OS:

*   Ruby language, version >= 2.6 < 2.7
*   RubyGems >= 3.2.4
*   Bundler >= 2.2.4
*   Javascript language (NodeJS), version >= 12.x < 13
*   NPM, version >= 6.14
*   YARN, version >= 1.22
*   Git, version >= 2.29

More current or older versions may work, but not tested.


## Development packages

For some of the components, a working C/C++ development environment is needed
for compiling platform-specific libraries. Ensure that all dev packages are
installed for your OS (Linux, OSX, or Windows).

### Development packages on Windows

For Ruby on Windows, a installation using RubyInstaller is recommended. A
current Ruby version of 2.6 is available with
[RubyInstaller, Downloads](https://rubyinstaller.org/downloads/)
To automatically install a development environment for Ruby on Windows, a
x64 version should be installed that is already bundled with a DEVKIT
(MSYS2 toolchain).

### Development packages on Linux (Ubuntu)

In order to install all required development chain on Ubuntu, you can run:

``` sh
sudo apt-get -y install \
gcc g++ make \
autoconf bison build-essential \
libssl-dev \
libyaml-dev \
libreadline-dev \
zlib1g-dev \
libncurses5-dev \
libffi-dev \
libgdbm-dev
```

To install the required languages and tools - if not already in place - the
following command can be used to do so:

``` sh
sudo apt-get -y install \
curl \
git-all \
nodejs \
ruby
```

Additionally, for Ruy and NodeJS the dev-packages are to be installed as
well to make all header files available for a working C/C++ development
environment:

``` sh
sudo apt-get -y install \
nodejs-dev \
ruby-dev
```

Note that priviliged (administrative) user rights are needed to install
system-wide software packages for the OS.

### Development packages on OSX

For all OSX system, the installation of the Apple Developer Tools (XCode)
is expected. Development tools like Ruby, NodeJS, or the bash, comes
with the OS are NOT recommended to use. Most of the software comes in very
old and therefor unusable version for J1 development.

To install recommended versions, the easiest way to install the missing
software is [Homebrew](https://brew.sh/). A lot of helpful information
how to manage package installations using Homebrew can be found on the
internet.

Beside the base installation of the recommend tools, all other recommendations
for Linux systems are for OSX the same.

## Upgrades needed for all platforms

If Ruby and NodeJS are in place, some packeages are to be upgraded to more
current versions. Install all packages system-wide with their respective
product installation pathes.

### Upgrades needed for Ruby <= v2.6

Install latest bundler for Ruby:

  gem install bundler --no-document

Install latest RubyGems for Ruby:

  gem install rubygems-update --no-document
  update_rubygems --no-document
  gem update --system


### Upgrades needed for NodeJS

NodeJS comes with NPM pre-installed. The native CLI for the NodeJS package
management is `npm`. Besides `npm` there's another quite handy CLI for NPM
available: *Yarn*.

The CLI `yarn` is developed at Facebook and can be used as a replacement
for `npm`. From a top-level perspective, both package management clients behave
pretty much the same. The syntax `yarn` uses is shorter in writing, making
the command-line look a bit more natural. Therefore, we prefer to use `yarn`.

NOTE: Yarn adds some additional features to the NodeJS package management
implemented for the needs at Facebook. Regarding the J1 development system,
those add-ons are neither needed nor used.

Install latest NPM and Yarn packages for NodeJS:

  npm install -g npm@latest
  npm install -g yarn@latest


# Setting up the project

Running the J1 template project is very simple:

* Downlad the repo
* Setup the project
* Run and develop the buildin starter web

## Checkout the Repo

The repo for the J1 Template development system is published on Github.
You can get it from Github by cloning the repository using `git`:

``` sh
git clone https://github.com/jekyll-one-org/j1-template.git
```

The repo gets written to folder `j1-template`. Have a look and browse the
folder. You'll see a structure like this:

j1 development repo
```
  ├──── .git
  │    └─── packages
  │         ├──  100_template_css
  │         ├──  200_template_js
  │         ├──  300_template_src
  │         ├──  400_template_site
  │         ├──  500_template_gem
  │         └─── 600_template_utilsrv
  ├──── .gitattributes
  ├──── .gitignore
  ├──── lerna.json
  ├──── LICENSE.md
  ├──── package.json
  └──── README.md
```

J1 template is a so-called *multi-package* project, a *Monorepo* managed by
Lerna. A Monorepo is a strategy where multiple (sub-)projects are stored in a
single repository instead of handling individual repositories.

All development *tasks* are defined as NPM *scripts* with the top-level project
config file `package.json`. For each package, package-level config files
are used having the same name `package.json` to manage specific tasks like
the generation of CSS and JS files, or creating the buildin starter web.

All base development *tasks* are defined with the top-level project
configuration; no need to dive into the package-level configurations.
All is managed by Lerna, based on simple top-level *tasks*.


## Initialize the project

Initializing the project is managed by the top-level *task* `setup`. A bunch
of sub-tasks are fired, all of the managed by Lerna.

Let's start ...

``` sh
yarn setup
```

Because a lot of sub-tasks getting started for a (first) `setup`, see below
the output as a summary :

``` sh
Set up development system for first use ..
Bootstrap base modules ..
done.
Create project folders ..
done.
Bootstrap project modules ..
done.

Initialize development packages ..
lerna notice cli v3.22.1
lerna info Updating package.json
lerna info Updating lerna.json
lerna info Creating packages directory
lerna success Initialized Lerna files
lerna notice cli v3.22.1
lerna info Bootstrapping 6 packages
lerna info Installing external dependencies
lerna info Symlinking packages and binaries
lerna success Bootstrapped 6 packages
done.

Detect operating system ..
OS detected as: Windows_NT
Create links for shared resources ..
lerna notice cli v3.22.1
lerna info Executing command in 1 package: "yarn run setup-links"
site: $ cross-var if-env OS=Windows_NT && run-s -s link-default || cross-env OS=$(echo $(getos)) run-s -s switch-links
lerna success run Ran npm script 'setup-links' in 1 package in 2.4s:
lerna success - site
lerna notice cli v3.22.1
lerna info Executing command in 3 packages: "yarn run build"
js: $ npm run clean && npm run lint
css: $ npm run clean
site: $ run-s -s clean:jekyll-conf && run-s -s jekyll_build:*
css: > css@2021.1.15 clean D:\j1\github\j1-template\packages\100_template_css
css: > run-p -s clean:*
js: > js@2021.1.15 clean D:\j1\github\j1-template\packages\200_template_js
js: > run-p -s clean:*
css: $ npm run build_css && npm run uglify_css
css: > css@2021.1.15 build_css D:\j1\github\j1-template\packages\100_template_css
css: > run-p -s theme_css:*
js: > js@2021.1.15 lint D:\j1\github\j1-template\packages\200_template_js
js: > run-p -s lint:*
css: Rendering Complete, saving .css file...
css: Rendering Complete, saving .css file...
css: Wrote CSS to D:\j1\github\j1-template\packages\100_template_css\dist\vendor.css
..
js: $ npm run build-js
js: > js@2021.1.15 build-js D:\j1\github\j1-template\packages\200_template_js
js: > cross-var webpack --mode production --config $npm_package_wp_build
js: > js@2021.1.15 uglify-js D:\j1\github\j1-template\packages\200_template_js
js: > terser dist/template.js -o dist/template.min.js -m
css: > css@2021.1.15 deploy D:\j1\github\j1-template\packages\100_template_css
css: > run-p -s mkdir:* && run-p -s deploy:*
js: > js@2021.1.15 deploy D:\j1\github\j1-template\packages\200_template_js
js: > run-s -s deploy:*
..
css: Rendering Complete, saving .css file...
css: Wrote CSS to D:\j1\github\j1-template\packages\100_template_css\dist\themes\uno-light\bootstrap.css
css: > css@2021.1.15 uglify_css D:\j1\github\j1-template\packages\100_template_css
css: > run-p -s uglify_css:*
..
site: > site@2021.1.15 bundle D:\j1\github\j1-template\packages\400_template_site
site: > run-s -s bundler:*
site: Create bundle ..
site: Fetching gem metadata from https://rubygems.org/..........
site: Fetching gem metadata from https://rubygems.org/.
site: Resolving dependencies...
site: Fetching rake 12.3.3
site: Installing rake 12.3.3
site: Fetching public_suffix 4.0.6
site: Installing public_suffix 4.0.6
..
site: Configuration file: D:/j1/github/j1-template/packages/400_template_site/_config.yml
site:             Source: D:/j1/github/j1-template/packages/400_template_site
site:        Destination: D:/j1/github/j1-template/packages/400_template_site/_site
site:  Incremental build: enabled
site:       Generating...
site:      J1 LunrSearch: creating search index ...
site:      J1 LunrSearch: finished, index ready
site:       J1 Paginator: autopages, disabled|not configured
site:       J1 Paginator: pagination enabled, start processing ...
site:       J1 Paginator: finished, processed 1 pagination page|s
..
site: Build Process Summary:
site: | PHASE      |    TIME |
site: +------------+---------+
site: | RESET      |  0.0045 |
site: | READ       |  1.2372 |
site: | GENERATE   |  1.0914 |
site: | RENDER     | 36.4321 |
site: | CLEANUP    |  0.0233 |
site: | WRITE      |  1.2013 |
site: +------------+---------+
site: | TOTAL TIME | 39.9898 |
site:
site: Site Render Stats:
site: | Filename                                                                          | Count |     Bytes |    Time |
site: +-----------------------------------------------------------------------------------+-------+-----------+---------+
site: | _layouts/default.html                                                             |    78 |  5471.71K |  34.751 |
site: | _includes/themes/j1/procedures/layouts/default_writer.proc                        |   312 |  6293.71K |  33.301 |
site: | _includes/themes/j1/layouts/layout_module_generator.html                          |    78 |  1968.77K |  30.002 |
..
site: | _includes/themes/j1/layouts/content_generator_blog_archive.html                   |     3 |    41.11K |   0.008 |
site: +-----------------------------------------------------------------------------------+-------+-----------+---------+
site: | TOTAL (for 50 files)                                                              | 17250 | 32823.55K | 162.778 |
site:
site: done in 40.019 seconds.
site: Auto-regeneration: disabled. Use --watch to enable.
..
site: $ run-s -s jekyll_post_build:*
lerna success run Ran npm script 'build' in 3 packages in 160.1s:
lerna success - css
lerna success - js
lerna success - site
Configure environment ..
done.

Done in 240.84s.
```

The `setup` process will take a while - typically five to ten minutes for the
first run (depending on the performances of your Internet connection and your
workstation). A bunch of NPM modules and Ruby Gems are downloaded and linked
for the packages part of the repo. See `setup` as an extended `install` and
`build` process to manage an initial setup for the (Lerna) Monorepo.

## Running the Starter Web

Running the buildin Starter Web for development is done like so:

``` sh
yarn site
```

The task `site` does a lot for you; whatever is necessary for a full-stack
Web development. The task will put in place all needed CSS and JS components,
build the Web content, and finally run the webite in a browser.

Go, go, go ..

``` sh
$ lerna run --parallel develop
lerna notice cli v3.22.1
lerna info Executing command in 2 packages: "yarn run develop"
..
utls: $ run-p -s utilsrv
utls: UTILSRV disabled. Not started.
..
site: $ run-p -s develop:*
site: i ｢wds｣: Project is running at http://localhost:44000/
site: i ｢wds｣: webpack output is served from /assets/themes/j1/core/js
site: i ｢wds｣: Content not from webpack is served from D:\j1\github\j1-template\packages\400_template_site\_site
site: Configuration file: D:/j1/github/j1-template/packages/400_template_site/_config.yml
site: i ｢wdm｣: wait until bundle finished: /assets/themes/j1/core/js/template.js
site:             Source: D:/j1/github/j1-template/packages/400_template_site
site:        Destination: D:/j1/github/j1-template/packages/400_template_site/_site
site:  Incremental build: enabled
site:       Generating...
site: i ｢wdm｣:    49 modules
site: i ｢wdm｣: Compiled successfully.
site:      J1 LunrSearch: creating search index ...
site:      J1 LunrSearch: finished, index ready
site:       J1 Paginator: autopages, disabled|not configured
site:       J1 Paginator: pagination enabled, start processing ...
site:       J1 Paginator: finished, processed 1 pagination page|s
site:                     done in 6.295 seconds.
site:  Auto-regeneration: enabled for '.'
site:     Server address: http://localhost:4000/
site:   Server running... press ctrl-c to stop.
```
Finally,  J1 starter web get openend in your default browser.


## Reset the Development System

To start from the beginning, you can reset the Development System to the
factory state. The top-level task `reset` does the resetting work for you
and cleans up each and everything except the Git repo and the NPM modules
folder `node_modules` stored in the project root. Both are kept untouched
by a reset.

``` sh
yarn reset
```

The cleanup runs some tasks for the root folder and in parallel sub-tasks
using Lerna for all packages:

``` sh
Reset development system to factory state ..
Clean up project root files ..
Remove bundle folder ..
Remove log folder ..
Remove log files ..

Clean up project packages ..
lerna notice cli v3.22.1
lerna info Executing command in 6 packages: "yarn run clean"
js: $ run-p -s clean:*
css: $ run-p -s clean:*
src: $ run-s clean:*
site: $ run-p -s clean:*
gem: $ run-p -s clean:* && run-p -s clean-bundle:*
utls: $ shx rm -f *.lock && shx rm -f package-lock.json

lerna success run Ran npm script 'clean' in 6 packages in 3.1s:
lerna success - css
lerna success - js
lerna success - src
lerna success - site
lerna success - gem
lerna success - utls

Remove js modules from all packages ..
lerna notice cli v3.22.1
lerna info clean removing D:\j1\github\j1-template\packages\100_template_css\node_modules
lerna info clean removing D:\j1\github\j1-template\packages\200_template_js\node_modules
lerna info clean removing D:\j1\github\j1-template\packages\300_template_src\node_modules
lerna info clean removing D:\j1\github\j1-template\packages\400_template_site\node_modules
lerna info clean removing D:\j1\github\j1-template\packages\500_template_gem\node_modules
lerna info clean removing D:\j1\github\j1-template\packages\600_template_utilsrv\node_modules
lerna success clean finished
done.

Done in 11.20s.
```

To reset the Development System *completely*, delete the folder `node_modules`
manually and start from scratch by running the `setup` task again:

``` sh
yarn setup
```

Happy Jekylling!
