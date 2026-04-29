// examplePlugin.js

export const examplePlugin = {
  init(app) {
    console.log('Example Plugin wurde initialisiert.');
    // Plugin kann auf APIs oder den State der Hauptanwendung zugreifen
    this.app = app;
  },

  onStart() {
    console.log('Example Plugin reagiert auf den Start der Hauptanwendung.');
  },
};
