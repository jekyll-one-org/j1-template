#!/usr/bin/env bash
# ------------------------------------------------------------------------------
#   Product/Info:
#   https://jekyll.one
#
#   Copyright (C) 2023-2025 Juergen Adams
#   J1 Template is licensed under the MIT License.
# ------------------------------------------------------------------------------

docker run --restart=always -d \
  --name starter_web --volume=$PWD:/j1/data  \
  --publish=0.0.0.0:4000:4000 \
   -it jekyllone/j1 \
   j1 site
