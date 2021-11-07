// -----------------------------------------------------------------------------
//  J1: compiler-log-plugin.js
//  Custom Webpack logger Plugin
//
//  Product/Info:
//  https://jekyll.one
//
//  Copyright (C) 2021 Juergen Adams
//
//  J1 Template is licensed under the MIT License.
//  See: https://github.com/jekyll-one-org/J1 Template/blob/master/LICENSE
//
// -----------------------------------------------------------------------------
// NOTE
//  Webpack >= 4.x
//    As of webpack 4, a new plugin API is used. See:
//    https://webpack.js.org/api/plugins/
//    https://medium.com/webpack/the-new-plugin-system-week-22-23-c24e3b22e95
//    https://github.com/GoogleChrome/workbox/issues/1151
//
// -----------------------------------------------------------------------------

function CompilerLogPlugin(options) {}

CompilerLogPlugin.prototype.apply = function(compiler) {

  compiler.hooks.emit.tap("CompilerLogPlugin", compilation => {

    // Create a header string for the generated file
    var filelist = '';

    // Loop through all compiled assets, adding a new item each filename
    for (var filename in compilation.assets) {
      filelist += ('  - '+ filename +'\n');
    }

    // Do something async...
    setTimeout(function() {
      console.log(filelist);
    }, 1000);

  });

  // Setup callback|s for accessing the compilation
  compiler.hooks.compilation.tap("CompilerLogPlugin", compilation => {

    // Setup callbacks for accessing compilation steps:
    compilation.hooks.optimize.tap("CompilerLogPlugin", function() {
      console.log('Assets are being optimized ..');
    });

  });

  // Log after successful compilation
  compiler.hooks.done.tap("CompilerLogPlugin", function(stats) {
    const time = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
    console.log('Compilation finished in ' + time + 'sec.');
  });

};

module.exports = CompilerLogPlugin;
