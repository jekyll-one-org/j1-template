#!/usr/bin/env bash
#  -----------------------------------------------------------------------------
# Product/Info:
# http://jekyll-one
#
# Copyright (C) 2021 Juergen Adams
# J1 is licensed under the MIT License
#  -----------------------------------------------------------------------------

find ./collections -name \*\.adoc -exec egrep "jpg|png" {} \; | grep -v "cover" | sed 's/alt://' | sed 's/- url://' | sed 's/image:://' | sed 's/image:://' | sed 's/  */ /g' | sort | uniq | sed 's/^ *//g' > all.images.txt
find ./pages -name \*\.adoc -exec egrep "jpg|png" {} \; | sed 's/alt://' | sed 's/- url://' | sed 's/image://' | sed 's/image:://' | sed 's/  */ /g' | sort | uniq | sed 's/^ *//g'  >> all.images.txt
