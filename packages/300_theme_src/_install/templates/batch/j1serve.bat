@echo off
rem  ---------------------------------------------------------------------------
rem Product/Info:
rem https://jekyll.one
rem
rem Copyright (C) 2023, 2024 Juergen Adams
rem J1 Template is licensed under the MIT License.
rem  ---------------------------------------------------------------------------

set URL=http://localhost:40000

cls

rem detect language
rem  ---------------------------------------------------------------------------
for /f "Tokens=2*" %%a in ('reg QUERY HKEY_LOCAL_MACHINE\system\controlset001\control\nls\language /v Installlanguage^|findstr "REG_SZ"') do (
  set LANGUAGE_KEY=%%b
)
rem echo Language detected: %LANGUAGE_KEY%

rem detect default browser
rem  ---------------------------------------------------------------------------
for /f "Tokens=2*" %%a in ('reg QUERY HKEY_CLASSES_ROOT\http\shell\open\command /ve^|findstr "REG_SZ"') do (
  set DEFAULT_BROWSER=%%b
)
rem echo Default browser detected: %DEFAULT_BROWSER%
rem echo.

rem open j1 home page
rem  ---------------------------------------------------------------------------
rem sleep start "" "%URL%"

rem build j1 home page
rem  ---------------------------------------------------------------------------
rem cls && bundle exec jekyll s --incremental -c config/_config.yml --source work/ --destination site
rem bundle exec jekyll s --incremental --verbose --trace --profile --livereload --open  1> output.txt 2>&1
rem
bundle exec jekyll s --incremental --livereload --open
