Video.js unterstützt Playlists vollständig über offizielle, kostenlose Plugins der Entwickler. Für die Backend-Logik wird das Kern-Plugin genutzt, während für die optische Darstellung eine Benutzeroberfläche (UI) bereitsteht. [1, 2, 3] 
## Die offiziellen Plugins

* [videojs-playlist](https://github.com/videojs/videojs-playlist): Verwaltet die Logik, das Array von Videos, das automatische Weiterschalten und die API-Steuerung.
* [videojs-playlist-ui](https://github.com/videojs/videojs-playlist-ui): Erstellt automatisch eine visuelle Seitenleiste oder Liste mit Vorschaubildern zum Anklicken. [4, 5, 6, 7, 8] 

------------------------------
## Schnellanleitung zur Einbindung## 1. Ressourcen laden
Fügen Sie Video.js sowie die beiden Playlist-Skripte und deren CSS-Dateien in Ihre Webseite ein: [5, 9, 10, 11] 

<!-- Video.js Styles -->
<link href="https://zencdn.net" rel="stylesheet"><!-- Playlist UI Styles -->
<link href="https://jsdelivr.net" rel="stylesheet">
<!-- Skripte -->
<script src="https://zencdn.net"></script>
<script src="https://jsdelivr.net"></script>
<script src="https://jsdelivr.net"></script>

## 2. HTML-Struktur anlegen
Erstellen Sie das Video-Element und einen Container mit der Klasse vjs-playlist, in dem die Liste generiert wird: [7, 12, 13] 

<div class="player-container">
  <video id="my-video-player" class="video-js vjs-default-skin" controls width="640" height="360"></video>
  
  <!-- Hier wird die Playlist automatisch hineingeschrieben -->
  <div class="vjs-playlist"></div>
</div>

## 3. Playlist per JavaScript initialisieren [14] 
Definieren Sie Ihre Medienobjekte und aktivieren Sie die Plugins: [15, 16] 

// Player initialisierenvar player = videojs('my-video-player');
// Playlist-Inhalte definieren
player.playlist([
  {
    name: 'Video 1 Titel',
    description: 'Beschreibung für Video 1',
    duration: 45,
    sources: [
      { src: 'https://example.com', type: 'video/mp4' }
    ],
    thumbnail: [
      { src: 'https://example.com' }
    ]
  },
  {
    name: 'Video 2 Titel',
    sources: [
      { src: 'https://example.com', type: 'video/mp4' }
    ],
    thumbnail: [
      { src: 'https://example.com' }
    ]
  }
]);
// Visuelle Playlist-Oberfläche aktivieren
player.playlistUi();
// Optional: Automatisches Weiterschalten nach 0 Sekunden Verzögerung aktivieren
player.playlist.autoadvance(0);

------------------------------
## Wichtige API-Befehle zur Steuerung
Über JavaScript können Sie die Wiedergabe der Playlist jederzeit direkt steuern: [9, 17] 

* player.playlist.next(): Springt zum nächsten Video.
* player.playlist.previous(): Springt zum vorherigen Video.
* player.playlist.currentItem(2): Springt direkt zum dritten Video (0-basierter Index).
* player.playlist.contains(source): Prüft, ob ein bestimmtes Video in der Liste existiert. [9, 18] 

Möchten Sie erfahren, wie Sie die Playlist nebeneinander mit dem Player (im Flexbox-Layout) anordnen oder wie man HLS/M3U8-Streams in die Playlist einbindet? [6, 19] 

[1] [https://legacy.videojs.org](https://legacy.videojs.org/plugins/)
[2] [https://cdnjs.com](https://cdnjs.com/libraries/videojs-playLists)
[3] [https://www.jsdelivr.com](https://www.jsdelivr.com/package/npm/videojs-playlist-ui)
[4] [https://github.com](https://github.com/videojs/videojs-playlist)
[5] [https://www.npmjs.com](https://www.npmjs.com/package/videojs-playlist)
[6] [https://videojs.org](https://videojs.org/blog/video-js-5-s-fluid-mode-and-playlist-picker)
[7] [https://github.com](https://github.com/videojs/videojs-playlist-ui)
[8] [https://www.sledge.co.uk](https://www.sledge.co.uk/global/js/videojs/examples/playlist.html)
[9] [https://github.com](https://github.com/cfx/videojs-playlist)
[10] [https://legacy.videojs.org](https://legacy.videojs.org/guides/faqs/)
[11] [https://github.com](https://github.com/tim-peterson/videojs-playlist/blob/master/README.md)
[12] [https://www.sledge.co.uk](https://www.sledge.co.uk/global/js/videojs/examples/playlist.html)
[13] [https://dev.to](https://dev.to/gabrielalao/how-to-create-a-video-player-with-videojs-43fp)
[14] [https://tledstaff.austincc.edu](https://tledstaff.austincc.edu/nuevo/examples/playlist.html)
[15] [https://www.sledge.co.uk](https://www.sledge.co.uk/global/js/videojs/examples/playlist.html)
[16] [https://tledstaff.austincc.edu](https://tledstaff.austincc.edu/nuevo/examples/playlist.html)
[17] [https://medium.com](https://medium.com/@python-javascript-php-html-css/using-javascript-to-automatically-trigger-the-playlist-menu-button-in-the-youtube-iframe-api-ba0bd0b245b8)
[18] [https://support.google.com](https://support.google.com/youtube/answer/57792?hl=en&co=GENIE.Platform%3DAndroid)
[19] [https://legacy.videojs.org](https://legacy.videojs.org/guides/faqs/)
