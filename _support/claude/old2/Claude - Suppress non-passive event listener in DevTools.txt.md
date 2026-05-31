Prompt
  https://claude.ai/chat/a4b87c9a-60c2-40a2-b0b3-fd9adb524eda
--------------------------------------------------------------------------------

In Chrome Browser dev tools, I got many warnings like:
"Added non-passive event listener to a scroll-blocking".

Almost all of them concern 3rd-party components I have no influence over.
Can I stop those warnings for 3rd party components?

Claude
--------------------------------------------------------------------------------

Yes, you can suppress them in DevTools. A few approaches, from least
to most aggressive:

**1. Filter them out in the Console**
In the Console panel's filter box, type a negative filter:

```
-Added non-passive event listener
```
Anything matching that text will be hidden. You can chain more with
additional `-...` terms.

**2. Hide messages from specific scripts**
Right-click any of those warnings → **Hide messages from [filename.js]**.
This is great for third-party libraries since the warning almost always
originates from their bundle. Once hidden, every future warning from that
file is suppressed for the session (and persists across reloads as long as
DevTools settings stay).

To undo: Console settings (gear icon) → uncheck **Selected context only**
area, or open **Settings → Ignore List** to manage.

**3. Lower the log level**
These are emitted as **Verbose** messages in current Chrome. In the Console's
log-level dropdown (next to the filter box), uncheck **Verbose** and they
all disappear — at the cost of also hiding other verbose logs.

**4. Add the third-party scripts to the Ignore List**
DevTools → Settings (F1) → **Ignore List** → add a regex matching the
third-party files (e.g. `/node_modules/`, `vendor\.js`, or a CDN domain).
This not only suppresses warnings originating from those files but also
skips them while stepping through in the debugger. This is usually the
cleanest long-term solution when the noise is all from libraries you
don't own.

For your case (warnings from 3rd-party only), I'd combine **#4**
(ignore list for the vendor files) with **#1** if anything still leaks
through.

That way warnings from your own code still surface, which is what you
actually want.
