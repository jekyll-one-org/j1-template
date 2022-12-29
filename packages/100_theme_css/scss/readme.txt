# -----------------------------------------------------------------------------
# ~/100_theme_css/scss/readme.txt
#
#  Product/Info:
#  https://jekyll.one
#
#  Copyright (C) 2023 Juergen Adams
#
#  J1 Theme is licensed under the MIT License.
#  See: https://github.com/jekyll-one-org/j1-template/blob/main/LICENSE.md
#
# -----------------------------------------------------------------------------

Light Theme

Light Theme is the default theme|skin for J1 Theme. This themes has a
1:1 copy under ~/src/scss to create the CSS files at *build-time*.

The (SASS) index "light-theme.scss" references all (scss) files needed to
generate a *full* custom theme for J1 Theme. The *main* output file is
located in ~/assets/themes/j1/core/css/custom.scss.

NOTE:

To load the custom theme at run-time, the J1 Theme loader is needed.

You have two kinds of Sass files:

* Main files, which you wish to be output as CSS files
* Partials, which are used by main files in @import statements

Main files are like pages – they go where you want them to be output, and
they contain the YAML front matter (--- lines) at the top. Partials are like
hidden Jekyll data, so they go in an underscored directory, which defaults
to _sass.
