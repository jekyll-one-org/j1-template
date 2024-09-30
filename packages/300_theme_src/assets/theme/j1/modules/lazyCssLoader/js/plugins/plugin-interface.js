// plugin-interface.js
export default class PluginInterface {
  constructor() {}

  // Diese Methode muss jedes Plugin implementieren
  register(app) {
    throw new Error("register method must be implemented");
  }
}
