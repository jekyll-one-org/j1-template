#!/usr/bin/env bash
#  -----------------------------------------------------------------------------
# Product/Info:
# http://jekyll-one
#
# Copyright (C) 2021 Juergen Adams
# J1 is licensed under the MIT License
#  -----------------------------------------------------------------------------

find ./collections -name \*\.adoc -exec egrep -H "jpg|png|gif" {} \; | grep -v "cover" | sed 's/- url://' | sed 's/image:://' | sed 's/  */ /g' > document.images.txt
find ./pages -name \*\.adoc -exec egrep -H "jpg|png|gif" {} \; | sed 's/- url://' | sed 's/image:://' | sed 's/  */ /g' >> document.images.txt
