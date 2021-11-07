// webpack 4 compatible plugin
// https://github.com/GoogleChrome/workbox/issues/1151

function HelloWorldPlugin(options) {
  // Setup the plugin instance with options...
}

HelloWorldPlugin.prototype.apply = function(compiler) {
//  compiler.plugin('done', function() {
  compiler.hooks.done.tap("HelloWorldPlugin", function() {
    console.log('Hello World!');
  });
};

module.exports = HelloWorldPlugin;
