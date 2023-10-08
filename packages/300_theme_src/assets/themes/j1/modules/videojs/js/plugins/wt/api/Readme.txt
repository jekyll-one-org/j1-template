See: https://wistia.com/support/developers/e-v1
See: https://wistia.com/support/developers/player-api

For most of our embeds, E-v1.js is essential for the Wistia player to
function. If you’re using an Inline, Standard or Popover embed code,
the player will not appear on the page at all if E-v1 is missing.

When a webpage loads, E-v1.js needs to be there to build the player,
deliver your video files and thumbnail, and include any customizations
or plugins you’ve chosen for the video. It also controls any integrations
you have set up for lead capture and tracking, and much more.

In the simplest terms possible, E-v1.js, or “E-v1” for short, is the
Wistia player. More specifically, it’s the Wistia JavaScript library
which loads all the player code, builds the player on a webpage, and
enables you to access all the player features that Wistia has to offer.

It looks like this:

<script src="https://fast.wistia.com/assets/external/E-v1.js" async> </script>
