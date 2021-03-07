Install built tools on Windows
------------------------------

Install CC|CPP compiler as Microsoft VisualStudio 2007

  npm install --global windows-build-tools

Installing Python 2 (2.7) as well:
 
  npm --add-python-to-path='true' --global windows-build-tools

Do a debug installation (very slow, log output)

  npm --add-python-to-path='true' --debug install --global windows-build-tools



Logs:

windows-build-tools 2019-05-04T20:53:30 : Verbose : Calling SetupEngine.Installer.InstallProduct. 
[channelId: VisualStudio.15.Release, productId: Microsoft.VisualStudio.Product.BuildTools, 
installationPath: 'C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools'] 

...

  windows-build-tools ------------------- Python -------------------- +62ms
  windows-build-tools Python 2.7.10 is already installed, not installing again. +33ms
  windows-build-tools Tail: Reporting success for VCC Build Tools +17m
  windows-build-tools Tail: Stopping success +70ms
  windows-build-tools Install: Build tools tailer exited +204ms
  windows-build-tools Installer: Successfully installed Visual Studio Build Tools according to tailer +23ms
  windows-build-tools ---------- Visual Studio Build Tools ---------- +34ms
  windows-build-tools Successfully installed Visual Studio Build Tools. +3ms
  windows-build-tools ------------------- Python -------------------- +1ms
  windows-build-tools Python 2.7.10 is already installed, not installing again. +0ms


Now configuring the Visual Studio Build Tools..

All done!

+ windows-build-tools@5.1.0
added 145 packages from 99 contributors in 1052.188s


Publish a package
-----------------

See: https://zellwk.com/blog/publish-to-npm/

Create a project file (manifest) package.json
Create test command (script) within the package.json

Init the project (using your <username> as a scope:)

  npm init ()--scope=jekyll-one)

Signin on NPM

  npm login


Publish on NPM:

  npm publish


  

