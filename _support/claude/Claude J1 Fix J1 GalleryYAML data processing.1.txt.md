Prompt
  https://claude.ai/chat/54b97c5e-1767-4134-a572-b31113a6e380
--------------------------------------------------------------------------------

When a page is loaded using multiple configured players, the values from the 
(YAML) configuration files are applied per instance. Like the fix commented by
"Modify J1 VideoPlayer #48" for the adapter of the J1 VideoPlayer module
(videoPlayer.js) should also apply the AmplitudeJS module.

For the HTML data and the adapter, loading the config files should be implemented
an inheritance chain:

```
  player settings -> overload user settings -> overload default settings
```

All default settings should be available under user and player settings, but
the default values should be overwritten when the same key is present in
both user and player settings.

Create fixed versions and use the comment "Fix Amplitude YAML data processing #1"
for all proposed fixes.


Claude
--------------------------------------------------------------------------------

**Die Kette**
`player settings → overload user settings → overload default settings` ist
jetzt auf beiden Ebenen implementiert:

**amplitude.html**
Pro Player-Iteration wird `player_effective` als `deep_merge`-Kette aufgebaut
(`defaults.player ← control.player ← players[]-Eintrag`), dazu
`playlist_pane_effective` mit dem bestehenden `players[].playlist.*`-Key-Naming.
Die alten Truthiness-Blöcke (`{% if shuffle_button or player.shuffle_button %}`
etc.) sind deprecated erhalten,

Sie waren in beide Richtungen kaputt: per-Player `false` konnte ein
Default-`true` nie überladen (daher Ihr Kommentar "currently dont work on player level"),
und das `or`-Muster wies `nil` zu, wenn der Player-Key fehlte.

Zusätzlich behoben: `source_media_attribute` wurde nur im LARGE-Zweig gesetzt
und leckte von einem Video-Player in danach gerenderte Mini/Compact-Player
derselben Seite.

**amplitude.js (Adapter)** — drei Ebenen:

(1) Liquid-global `amplitude_player_global`/`amplitude_playlist_global`
    (defaults ← user) für die seitenglobalen Runtime-Variablen;
(2) per-Player `player_effective` in der `initPlayerUiEvents`-Schleife
    für `playerType`, `player_scroller_song_element_min` (neu per Instanz)
    und den Plugin-Manager — dessen alter Ausdruck fiel bei per-Player
    `false` auf den Default zurück;
(3) JS-seitig `_deepMerge` + `getInstanceOptions(playerId)` (Arrays ersetzen,
    Objekte rekursiv — identische Semantik wie #48), exponiert als
    `j1.adapter.amplitude.amplitudeInstanceOptions` und
    `j1.modules.amplitudejs.instanceOptions` für Modul/YTP-Plugin.
    Nebenbefund im Scope behoben: `amplitudePlayers` las noch das seit v46
    nicht mehr zugewiesene `amplitude_player` (v44-Naming) und war daher
    immer leer — liest jetzt `amplitude_control`.


**Out of scope, geflaggt**

`forward_backward_skip_seconds` wird vom Adapter weiterhin seitenglobal
konsumiert (Kandidat für #2: per-Instanz an den Skip-Button-Event-Sites);
ebenso die ungenutzten playlist-scoped Default-Assigns im HTML
(per-Playlist-Kette vorbereitet, aber nicht verdrahtet).

