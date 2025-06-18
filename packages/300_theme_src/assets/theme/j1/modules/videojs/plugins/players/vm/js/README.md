# Videojs Vimeo plugin hard fork

## videojs-vimeo official plugin fork for supporting videojs v7.6.6 onwards.

This project is a hard fork of the currently unmaintained official
videojs-vimeo plugin: https://github.com/videojs/videojs-vimeo

This fork has some significant changes in project structure:

- Build now uses rollup;
- Project linting now uses eslint + videojs styleguide;
- Project folder structure reworked;
- Lib version reseted relative to the official plugin.

## Installation

```bash
npm i @devmobiliza/videojs-vimeo
// OR
yarn add @devmobiliza/videojs-vimeo
```

## Usage

- CommonJS:

```js
import videojs from 'video.js';
import '@devmobiliza/videojs-vimeo/dist/videojs-vimeo.cjs';
```

- Module:

```js
import videojs from 'video.js';
import '@devmobiliza/videojs-vimeo/dist/videojs-vimeo.esm';
```

- Browser:

See [index.html](https://github.com/Mobiliza/videojs-vimeo/blob/master/index.html)

## Events / Vimeo Options

Events, like `on('play')`, `one('play')` work as per the video.js
API: https://docs.videojs.com/

For setting the time of the player the `videojs.currentTime(TIME_SECONDS)`
function can be used.

Vimeo options are available here (must be used with the `vimeo` key in
the options object of the video.js):
https://vimeo.zendesk.com/hc/pt/articles/360001494447-Usando-os-par%C3%A2metros-do-player

