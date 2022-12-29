#!/usr/bin/env bash

# ------------------------------------------------------------------------------
#   Product/Info:
#   https://jekyll.one
#
#   Copyright (C) 2023 Juergen Adams
#   J1 Theme is licensed under the MIT License.
# ------------------------------------------------------------------------------

# clear && jekyll b --incremental --trace --watch -c config/_config.yml --source work/ --destination site
# clear && jekyll b --incremental --trace --watch
# clear && bundle exec jekyll b --incremental --verbose --trace --watch 1> output.txt 2>&1
#
clear && bundle exec jekyll b --incremental --watch
