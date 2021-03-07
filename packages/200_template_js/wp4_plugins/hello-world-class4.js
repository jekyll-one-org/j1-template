class HelloWorldPlugin {
  apply(compiler) {
//  compiler.plugin("done", () => {
    compiler.hooks.done.tap("HelloWorldPlugin", () => {
      console.log("Hello world");
    });
  }
}

module.exports = HelloWorldPlugin;
