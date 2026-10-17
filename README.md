# vinyl

a little record player that runs entirely in the browser. plain html, css and javascript — no frameworks, no build step, nothing to install.

## run it

just open `index.html`. the typefaces load from google fonts but there are local fallbacks if you're offline.

## what it does

- plays the record it ships with (an oasis track i had lying around)
- the tonearm follows the song for real — it parks on its rest, drops onto the first groove when you hit play, and drifts inward as the side plays out. pause and the record freezes mid-spin, like a deck with the motor cut
- a 33⅓ / 45 switch that actually changes the spin speed
- drop audio files anywhere on the page and they go into the crate. titles, artists and cover art are read out of the files' own id3 tags, right there in the browser — nothing gets uploaded anywhere
- keyboard: space plays or pauses, arrow keys skip ten seconds

## how it's put together

- `index.html` — the page
- `css/style.css` — all the styling in one file, custom properties + container queries so the deck scales cleanly
- `js/app.js` — the player, the tonearm maths, drag & drop, and a small id3v2 reader (title, artist, embedded art)

## notes to self

- drag-to-reorder the crate
- read the year out of the tags too (tyer / tdrc frames)
- a little vu meter that actually listens to the audio
