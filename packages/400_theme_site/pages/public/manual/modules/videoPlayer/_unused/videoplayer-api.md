<!--
claude - J1 VideoPlayer manual #1
===============================================================================
~/pages/public/manuals/videoplayer/videoplayer-api.md
User manual for the J1 VideoPlayer module (native + YouTube playlists over
Video.js). Written for beginners: it favours configuration (YAML) and concepts
over deep JavaScript. The structure mirrors the J1 Amplitude API manual.
===============================================================================
-->

# J1 VideoPlayer

**Video Player over Video.js**

> J1 VideoPlayer is a complete video player engine for the J1 Template. It plays
> self-hosted (native) videos and YouTube videos, and manages one playlist per
> player. You set everything up in simple YAML files — no scripting knowledge is
> needed for normal use.

The HTML5 `<video>` tag is an easy way to put a video on a web page. The
downside is that the **browser** draws the player (the play button, the
progress bar, the volume control, ...). Every browser draws them a little
differently, and you can not change how they look. On a carefully designed
page, the default video player often looks out of place — and it has no idea
what a **playlist** is.

J1 VideoPlayer solves both problems. It is a complete video player engine built
on top of [Video.js](https://videojs.com/). It gives every video the same
good-looking, skinnable player, and it adds a full **playlist** on top: a
searchable, sortable list of videos that the viewer can play, rate, and continue
from where they left off. It plays two kinds of video: **native** videos (files
such as `mp4`, `webm` or `ogv` that you host yourself) and **YouTube** videos.

You do not need to write any JavaScript to use it. You describe your players in
a few simple **YAML** files and J1 builds the HTML for you. You can put
**several players on one page** and each one keeps its own separate playlist.
The rest of this manual explains every setting you can change, the shape of a
playlist file, and — for advanced users — the JavaScript methods the module
exposes.

🕔 **15–30 Minutes** to read

---

## How It Works

Before diving into the settings, it helps to know the **four pieces** that make
up a J1 VideoPlayer. You never touch most of them directly, but knowing they
exist makes every later section easier to follow.

- **The configuration (YAML)** — Three small text files describe your players:
  what they are called, which playlist they load, and how they look and behave.
  This is the part you edit. It is covered in [Configuration](#configuration).
- **The HTML** — J1 reads your configuration and **automatically writes the
  HTML** for each player (the video area, the playlist panel, and the edit
  panel). You do not write this by hand.
- **The JavaScript core** — A module called `videoPlayer` starts Video.js,
  wires up the buttons, and manages the playlist. It also loads a few helper
  plugins (skip buttons, next/previous buttons, zoom). Advanced users can call
  it directly; see [Methods](#methods).
- **The playlist store** — Each player keeps its playlist in the browser's
  **local storage**. That is why a viewer's ratings, and the position they
  stopped at, are still there the next time they open the page.

### Native Videos and YouTube Videos

A single playlist can mix both kinds of video:

- **Native video** — A video file that you host on your own web server (for
  example an `mp4`). The player loads it directly. This is the most reliable
  option and works offline / on private sites. The file address goes in the
  entry's `src` field.
- **YouTube video** — A video that lives on YouTube. You give the player the
  YouTube link and it plays the video through Video.js. The poster image is
  taken from YouTube automatically.

### Several Players on One Page

You can place as many players on a page as you like. Every player has its own
**id** (a short name such as `player_1`), its own playlist, and its own
settings. Nothing leaks from one player to another: a video you add to
`player_1` never shows up in `player_2`. Internally each player is a separate
**instance** of the module, created through a factory function — exactly the
same idea Video.js uses. This is explained in
[Notes on Implementation](#notes-on-implementation).

---

## Configuration

Almost everything you will ever change lives in **YAML** configuration files.
YAML is a plain-text format for settings: a name, a colon, and a value. You do
not need to know any programming to edit it.

### The Three Configuration Files

Settings come from three files that are merged together in order. Later files
win, so you only have to write down what you want to **change**.

| File | What it is for |
|------|----------------|
| `_data/modules/defaults/videoPlayer.yml` | The **defaults**. Every possible option with a sensible value and a comment. You normally leave this file alone and read it as a reference. |
| `_data/modules/videoPlayer.yml` | Your **global** settings. Anything here overrides the defaults for **all** players. This is where you switch the module on with `enabled: true`. |
| `_data/modules/videoPlayer_control.yml` | Your **per-player** settings. This file lists each player separately, so you can give every player its own id, playlist, and look. |

> **Note:** The merge is *shallow per section*. A per-player `videoJS:` block
> only needs the keys you want to change; every missing key falls back to the
> value in the defaults file. You never have to copy the whole defaults block.

### General Options

These live at the top of the settings and control the module as a whole.

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `false` | Master on/off switch. Set it to `true` in your global `videoPlayer.yml` to turn the player on. |
| `initTimeout` | `1200` | A short delay in milliseconds before a player starts up, giving the browser time to finish drawing the HTML. |
| `hideDisabled` | `true` | When a player is disabled, hide its box completely instead of showing an empty frame. |
| `playlist_url_base` | `/assets/data/apps/videoPlayer/playlists/lists` | The folder where your ready-made playlist files live. |
| `xhr_data_path` | `/assets/data/videoPlayer` | The folder the module reads its generated data from. |

### Playlist Options

The `playlist:` block controls the playlist panel that sits under each player.

| Option | Default | Description |
|--------|---------|-------------|
| `playlist.enabled` | `true` | Show the playlist panel. Turn it off for a plain single-video player. |
| `playlist.close_on_play` | `false` | Close the playlist panel automatically as soon as a video starts playing. |
| `playlist.search.enabled` | `true` | Show the search box. The viewer can filter by title, author, description, category, type, or tag. |
| `playlist.sort.enabled` | `true` | Show the sort control (for example by watch date or rating). |
| `playlist.modeSwitch.enabled` | `true` | Show the switch that flips the playlist between a plain **list** and a grid of **cards**. |
| `playlist.mergeSwitch.enabled` | `true` | Show the **merge** switch. When on, importing another playlist adds its videos instead of replacing the list. |
| `playlist.loop.enabled` | `false` | Start over from the first video when the last one finishes. |
| `playlist.loop.pip` | `false` | Allow picture-in-picture (a small floating video window) while looping. |
| `playlist.type` | `list` | The starting layout of the playlist: `list` or `cards`. |
| `playlist.cards.perRow` | `2` | How many cards to show per row in **cards** mode. |

### Player Options (videoJS)

The `videoJS:` block controls the video engine itself.

| Option | Default | Description |
|--------|---------|-------------|
| `videoJS.autoStart` | `true` | Start playing as soon as a video is loaded. |
| `videoJS.preloadVideo` | `true` | Let the browser fetch the video ahead of time so playback starts quickly. |
| `videoJS.playbackRates.enabled` | `true` | Offer a speed menu on the player. |
| `videoJS.playbackRates.values` | `[ 0.25, 0.5, 1, 1.5, 2 ]` | The speeds available in that menu (`1` is normal speed). |

The `players.native` block sets the behaviour for self-hosted videos. The most
useful keys are:

| Option | Default | Description |
|--------|---------|-------------|
| `autoplay` | `true` | Play as soon as the video is ready. |
| `controls` | `true` | Show the player's control bar. |
| `fluid` | `true` | Make the player responsive so it fills the width of its container. |
| `preload` | `auto` | How eagerly to load the video: `auto`, `metadata`, or `none`. |
| `playsinline` | `true` | On iPhones, play inside the page instead of forcing full screen. |
| `default_poster` | `/assets/image/icon/videojs/videojs-poster.png` | The image shown before a video plays, when no other poster is available. |
| `sourceOrder` | `[ mp4, webm, ogv ]` | The order in which video file types are tried. |

#### Automatic Poster Images

A **poster** is the still image shown before a video plays. For native videos,
J1 VideoPlayer can **create the poster for you** by grabbing a frame from the
start of the video. This is controlled by `videoJS.poster.autoGenerate`.

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `true` | Turn automatic poster creation on or off. |
| `capturePosition` | `5` | Which second of the video to grab the frame from. If `0` or less, `captureFraction` is used instead. |
| `captureFraction` | `10` | A percentage of the video's length to use as the capture point (used when `capturePosition` is `0` or less). |
| `maxWidth` | `540` | The poster is shrunk to at most this many pixels wide (the shape is kept). |
| `mimeType` | `webp` | The image type to save: `jpeg`, `png`, or `webp`. |
| `quality` | `0.8` | Image quality from `0` to `1` (used for `jpeg` and `webp`). |

> **Note:** For YouTube videos you never need this — the poster is fetched
> straight from YouTube's own thumbnail service.

### Plugin Options

Video.js gains extra buttons through small **plugins**. J1 VideoPlayer ships a
handful, switched on and off under `videoJS.plugins:`.

| Plugin | What it does |
|--------|--------------|
| `playlist` | The playlist engine. `autoadvance` plays the next video when one ends; `autoadvance_delay` sets the pause (in seconds) between them. |
| `skipButtons` | Adds **skip forward** and **skip back** buttons. `forward` and `backward` set how many seconds each skip jumps. |
| `nextPrevButtons` | Adds **next** and **previous** buttons to jump between playlist items. |
| `zoomButtons` | Adds zoom / rotate controls for the video image. |
| `hotKeys` | Keyboard shortcuts (for example the arrow keys to seek). Off by default. |

### Per-Player Settings

The `videoPlayer_control.yml` file is where you actually **create** players. It
holds a list of players, and each entry describes one. Keys you do not set fall
back to the global settings and then the defaults.

| Key | Description |
|-----|-------------|
| `enabled` | Whether this player is built at all. |
| `id` | The player's unique name (for example `player_1`). Must be unique on the page; used to build all of the player's element ids. |
| `description` | A human-friendly label for the player. |
| `playlist.preload` | A list of playlist files to load into this player on page load. See [Playlist Files and Preloading](#playlist-files-and-preloading). |
| `videoJS`, `playlist`, `toolbox`, ... | Any option from the sections above, applied to **this player only**. |

A minimal control file with one player looks like this:

```yaml
settings:
  players:

    - player:
      enabled:      true
      id:           player_1
      description:  NPR Tiny Desk Concerts
      videoJS:
        autoStart:  true
      playlist:
        preload:    [ tinydesk-concerts.json ]
        cards:
          perRow:   4
```

---

## The Player on the Page

You do not write the player's HTML — J1 generates it from your configuration.
Still, it helps to know the parts a viewer sees, because the settings above map
onto them.

### The Header Bar

Every player has a slim header bar with three slots:

- **Show / Hide Playlist button (left)** — Opens and closes the playlist panel.
  It is disabled and greyed out until a playlist is loaded.
- **Title (centre)** — A short label, for example "Show Playlist".
- **Manage Playlists button (right)** — Opens the **edit panel**, where the
  viewer can add, import, export, or clear videos.

### The Video Area

Below the header is the video itself. Before anything is loaded, a friendly
placeholder (the VideoJS logo) is shown in its place.

### The Playlist Panel

When opened, the playlist panel shows a **search box**, a **sort** control, a
**list / cards** switch, a **merge** switch, a **loop** switch, and the videos
themselves — each with its poster, title, author, and a star rating. Which of
these appear depends on the matching options in the `playlist:` block.

### The Edit Panel

The edit panel is where content is managed. It offers a box to **paste a video
link**, an **Import** control to load a server playlist, **Export Playlist** to
save to a file, **Import Playlist** to load a file from the viewer's computer,
and **Clear Playlist** to empty the list.

---

## Playlist Items

A playlist is simply a **list of items**, and each item is a small block of
information about one video. Only `videoId` is truly required; every other field
has a sensible default and can be left out.

| Field | Type | Description |
|-------|------|-------------|
| `videoId` | text | **Required.** A unique id for this item. For YouTube this is usually the video's id; for native videos any unique string works. |
| `title` | text | The video's title, shown in the list. |
| `author` | text | The channel or author name. |
| `description` | text | A longer description. It is searchable. |
| `category` | text | A category label used for grouping and search. |
| `tags` | list | A list of tag words, for example `[ music, live ]`. |
| `type` | text | The video's MIME type. Defaults to `video/mp4`. |
| `src` | text | The address of the native video file. Leave empty for YouTube items. |
| `videoLink` | text | The canonical link. For YouTube the YouTube URL; for native videos usually the same as `src`. |
| `infoLink` | text | An optional link to a page with more information. |
| `poster` | text | The preview image URL. Filled in automatically for YouTube; can be generated for native videos. |
| `duration` | number | The length of the video in seconds. |
| `issueDate` | text | The publish date of the video. |
| `episode` | number | An episode number, if part of a series. |
| `series` | number | A series number. |
| `rating` | number | A star rating from `0` to `5`. The viewer can set this in the panel. |
| `lastPosition` | number | The second the viewer last stopped at, so playback can resume. |
| `watchDate` | text | When the item was last watched (set automatically). |
| `createDate` | text | When the item was added (set automatically). |
| `creator` | text | Always `videoPlayer` for items the module creates. |

A single item in a playlist file looks like this:

```json
{
  "videoId":     "abcXYZ12345",
  "title":       "Tiny Desk Concert",
  "author":      "NPR Music",
  "description": "A short live set recorded at the office.",
  "category":    "music",
  "tags":        [ "live", "acoustic" ],
  "type":        "video/mp4",
  "videoLink":   "https://www.youtube.com/watch?v=abcXYZ12345",
  "poster":      "",
  "duration":    920,
  "rating":      0
}
```

> **Note:** A playlist file may be either a plain **array** of items
> (`[ { ... }, { ... } ]`) or an object with a `playlist` key
> (`{ "playlist": [ { ... } ] }`). The module reads both shapes.

### Playlist Files and Preloading

Ready-made playlist files are ordinary `.json` files kept in the folder set by
`playlist_url_base`. To have a player load one (or several) on page load, list
the file names under that player's `playlist.preload` key:

```yaml
playlist:
  preload: [ tinydesk-concerts.json, carpool-karaoke.json ]
```

Preloading is **safe to repeat**. On every page load the module **merges** the
file into the player's playlist: it adds any videos that are not there yet and
leaves everything else — including the viewer's own additions, ratings, and
watch positions — untouched. Nothing is ever duplicated or overwritten.
Preloading only fills the list; it does not start playing on its own.

---

## Methods

Most pages need **no** JavaScript at all — the configuration files already cover
normal use. The methods below are for advanced users who want to build custom
controls, load videos after the page has loaded, or read the player's state.

The module follows the same shape as Video.js. You get a player through a
**factory function**, and then work with that player object.

### The Module Factory

`videoPlayer(id, options)` is the main entry point. It **creates** the player
for `id` the first time you call it and **returns the existing one** on later
calls ("create-or-get"). Options given for a player that already exists are
ignored.

```js
// create or fetch the player named 'player_1'
const vp = videoPlayer('player_1', options);
```

| Function | Description |
|----------|-------------|
| `videoPlayer(id, options)` | Create the player for `id`, or return it if it already exists. |
| `videoPlayer.getPlayer(id)` | Return the player for `id`, or `null` if it does not exist. Never creates one. |
| `videoPlayer.getPlayers()` | Return the registry object holding every live player, keyed by id. |
| `videoPlayer.VERSION` | The module's version string. |
| `videoPlayer.players` | A direct reference to the same registry `getPlayers()` returns. |

> **Note:** Older code may use `videoPlayer.createInstance(id)`,
> `getInstance(id)`, `hasInstance(id)`, `listInstances()`, or
> `removeInstance(id)`. These still work but are **deprecated** aliases. New
> code should use the factory, `getPlayer()`, `getPlayers()`, and `dispose()`.

### A Player Instance

The object returned by the factory represents one player.

| Member | Description |
|--------|-------------|
| `vp.id()` | The player's id. |
| `vp.options()` | The options the player was created with. |
| `vp.getPlayerID()` | The active player id used internally to scope elements. |
| `vp.playlistManager` | The object that manages this player's playlist (see below). |
| `vp.closePlaylist()` | Close the playlist panel. |
| `vp.closeEditPlaylist()` | Close the edit panel. |
| `vp.dispose()` | Remove the player from the registry so its id can be created again. |

### Working with the Playlist

The playlist is managed by `vp.playlistManager`. Its methods are grouped below
by what they do. Anywhere you see `videoId`, it is the `videoId` field of a
playlist item.

**Adding and updating videos**

| Method | Description |
|--------|-------------|
| `addEntry(entry)` | Add a video to the playlist from an item object. |
| `createEntry(entry)` | Create a playlist item early (from what is known at load time) and store it. |
| `enrichEntry(videoId, meta, force)` | Fill in details that only arrive later — the real title, author, poster, or measured length. By default it only fills empty fields; pass `force = true` to overwrite. |
| `updateEntryRating(videoId, rating)` | Set the star rating (`0`–`5`) for an item. |
| `updateEntryPosition(videoId, positionSeconds)` | Remember where the viewer stopped, so playback can resume. |
| `updateWatchDate(videoId)` | Mark an item as watched now. |
| `updateEntryFields(videoId, fields)` | Update several fields of an item at once. |

**Removing videos**

| Method | Description |
|--------|-------------|
| `deleteEntry(videoId)` | Remove a single video from the playlist. |
| `clearPlaylist()` | Remove every video from the playlist. |

**Reading the playlist**

| Method | Description |
|--------|-------------|
| `load()` | Return the whole playlist as an array of items. |
| `getEntry(videoId)` | Return one item. |
| `getEntryPosition(videoId)` | Return the saved resume position (in seconds) for an item. |
| `getNextVideoId(currentVideoId)` | Return the id of the video that follows the given one. |

**Playing videos**

| Method | Description |
|--------|-------------|
| `playEntry(videoId)` | Load and play the given video. |
| `embedRunVideo(videoId, mode)` | Load a video into the player (the lower-level call `playEntry()` uses). |
| `autoLoadFirstEntryOnReload()` | Load the first item of the playlist automatically when the page reloads. |

**Importing, exporting, and preloading**

| Method | Description |
|--------|-------------|
| `importFromUrl(url)` | Load a playlist file from a web address into the playlist. |
| `importFromFile()` | Load a playlist from a file chosen on the viewer's computer. |
| `exportToFile(filename)` | Save the current playlist to a `.json` file. |
| `backupToFile(filename)` | Save a backup copy of the current playlist to a file. |
| `preloadPlaylists(preloadList, baseUrl, playerId)` | Merge one or more configured playlist files into the player on load. This is what the `playlist.preload` setting triggers behind the scenes. |

**Searching and sorting**

| Method | Description |
|--------|-------------|
| `buildSearchIndex()` | Build the search index for the current playlist. |
| `searchPlaylist(query)` | Filter the playlist by a search term. |
| `clearSearch()` | Clear the current search and show the whole list again. |
| `sortPlaylist(criterion)` | Reorder the list, for example by `watchDate` or `rating`. |

**Rendering the panel**

| Method | Description |
|--------|-------------|
| `renderCurrent()` | Redraw the playlist panel to match the stored playlist. |
| `setActiveItem(videoId)` | Mark an item as the one currently playing (it is highlighted). |
| `clearActiveItem()` | Remove the "currently playing" highlight from all items. |

**Setup methods** — normally called by the adapter that starts the player; you
rarely call them yourself.

| Method | Description |
|--------|-------------|
| `setAdapterOptions(options)` | Hand the merged configuration to the playlist manager. |
| `setPlayerID(id)` | Tell the manager which player it belongs to, so it uses the right storage and the right HTML elements. |

---

## Notes on Implementation

This section explains a few design choices. You do not need them for daily use,
but they help when something behaves unexpectedly on a page with several
players.

### One Instance Per Player

The module is built the same way as Video.js. Calling `videoPlayer(id)` returns
a separate **instance** for each id, kept in a shared registry. Each instance
owns its own state, its own playlist manager, and its own event handlers. There
is no hidden "default" player that everything shares — that older design caused
several players to fight over one set of settings, so it was removed.

### Each Player Has Its Own Storage

Because every player keeps its playlist in the browser's local storage, the
module gives each player its **own** storage name by adding the player id to it
(for example `playlist_player_1`). This is why a video added to one player never
appears in another. The same scoping applies to the small UI preferences, such
as whether the playlist was last shown as a list or as cards.

### Native and YouTube Share One Path

Both native and YouTube videos play through the same Video.js player. The module
looks at the item's link to decide which one it is: a YouTube link is recognised
and played through YouTube; anything else is treated as a native file and loaded
from its `src`. Posters follow the same rule — YouTube posters come from
YouTube, native posters are generated from the video.

### Preloading Is Non-Destructive

Preloading always **merges**. It never overwrites the viewer's existing list,
and running it again on the next reload never creates duplicates. This is why it
is safe to keep a `preload` list in your configuration permanently.

---

## Examples

The examples below are complete, working configurations. Copy one into your
`videoPlayer_control.yml` and adjust the ids and playlist file names.

> **Note:** J1 VideoPlayer is mobile-friendly. On touch devices the player and
> its buttons respond to taps, and the layout follows the width of the page so
> it looks right on phones and tablets.

### One Player With a Preloaded Playlist

The simplest useful setup: a single player that loads a ready-made playlist file
on page load and shows it as a grid of cards, four per row.

```yaml
settings:
  players:

    - player:
      enabled:      true
      id:           player_1
      description:  NPR Tiny Desk Concerts
      videoJS:
        autoStart:  true
      playlist:
        preload:    [ tinydesk-concerts.json ]
        type:       cards
        cards:
          perRow:   4
```

### Two Players on One Page

Each player has its own id, its own preloaded playlist, and its own card layout.
They do not share anything.

```yaml
settings:
  players:

    - player:
      enabled:      true
      id:           player_1
      description:  NPR Tiny Desk Concerts
      playlist:
        preload:    [ tinydesk-concerts.json ]
        cards:
          perRow:   4

    - player:
      enabled:      true
      id:           player_2
      description:  Carpool Karaoke
      playlist:
        preload:    [ carpool-karaoke.json ]
        cards:
          perRow:   3
```

### A Small Playlist File

A playlist file that mixes one YouTube video and one native video. Save it in
your `playlist_url_base` folder and reference it from a `preload` list.

```json
[
  {
    "videoId":     "abcXYZ12345",
    "title":       "Live at the Tiny Desk",
    "author":      "NPR Music",
    "description": "A short acoustic set.",
    "category":    "music",
    "tags":        [ "live", "acoustic" ],
    "videoLink":   "https://www.youtube.com/watch?v=abcXYZ12345",
    "duration":    920,
    "rating":      0
  },
  {
    "videoId":     "promo-clip-01",
    "title":       "Product Tour",
    "author":      "Our Team",
    "description": "A self-hosted introduction video.",
    "category":    "howto",
    "tags":        [ "intro" ],
    "type":        "video/mp4",
    "src":         "/assets/video/product-tour.mp4",
    "videoLink":   "/assets/video/product-tour.mp4",
    "duration":    140,
    "rating":      0
  }
]
```

### Adding a Video From JavaScript

For a custom button, you can add and play a video yourself. First get the
player, then use its playlist manager.

```js
// get the running player named 'player_1'
const vp = videoPlayer.getPlayer('player_1');

if (vp) {
  // add a video to the playlist
  vp.playlistManager.addEntry({
    videoId:   'abcXYZ12345',
    title:     'Live at the Tiny Desk',
    author:    'NPR Music',
    videoLink: 'https://www.youtube.com/watch?v=abcXYZ12345'
  });

  // then play it
  vp.playlistManager.playEntry('abcXYZ12345');
}
```
