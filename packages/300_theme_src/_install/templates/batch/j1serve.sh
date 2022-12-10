#!/usr/bin/env bash

# ------------------------------------------------------------------------------
#   Product/Info:
#   https://jekyll.one
#
#   Copyright (C) 2022 Juergen Adams
#   J1 Theme is licensed under the MIT License.
# ------------------------------------------------------------------------------

# clear && bundle exec jekyll s --incremental -c config/_config.yml --source work/ --destination site
# clear && bundle exec jekyll s --incremental
#
clear && bundle exec jekyll s --incremental --livereload --open
