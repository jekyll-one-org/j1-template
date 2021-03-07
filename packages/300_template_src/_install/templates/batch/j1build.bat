rem  ---------------------------------------------------------------------------
rem    Product/Info:
rem    https://jekyll.one
rem
rem    Copyright (C) 2021 Juergen Adams
rem    J1 Template is licensed under the MIT License.
rem  ---------------------------------------------------------------------------
@echo off

rem cls && jekyll b --incremental --trace --watch -c config/_config.yml --source work/ --destination site
rem cls && jekyll b --incremental --trace --watch
rem bundle exec jekyll b --incremental --verbose --trace --watch 1> output.txt 2>&1
rem
cls && bundle exec jekyll b --incremental --watch
