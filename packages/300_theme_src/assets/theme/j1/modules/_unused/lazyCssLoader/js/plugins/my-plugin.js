// my-plugin.js
// import PluginInterface from './plugin-interface.js';

class PluginInterface {
  constructor() {}

  // Diese Methode muss jedes Plugin implementieren
  register(app) {
    throw new Error("register method must be implemented");
  }
}

class MyPlugin extends PluginInterface {
  register(app) {
    // Plugin-spezifische Logik, die zur Hauptanwendung beiträgt
    console.log("MyPlugin registered");

    // z.B. eine neue Funktion zu der Anwendung hinzufügen
    app.addFeature('myFeature', () => {
      console.log('MyFeature is working');
    });
  }
}

export default new MyPlugin();
