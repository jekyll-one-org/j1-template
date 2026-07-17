Prompt
  https://claude.ai/chat/0c0c1d15-5779-470a-9794-b0f3259e9894
--------------------------------------------------------------------------------

When a page is loaded using multiple configured galleries, the values from the 
(YAML) configuration files are applied per instance. Like the fix commented by
"Fix Amplitude YAML data processing" for the adapter of the J1 Amplitude module
(amplitude.js) should also apply the Gallery module.

For the HTML data and the adapter, loading the config files should be
implemented through an inheritance chain:
```
  gallery settings -> overload user settings -> overload default settings
```

All default settings should be available under user and gallery settings,
but the default values should be overwritten when the same key is present
in both user and gallery settings.

Create fixed versions and use the comment "Fix J1 Gallery YAML data processing #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

