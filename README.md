# 🔔 Bell Sheets

Turn simple songs into **side-scrolling, color-coded music sheets** for the
[Lovevery Music Set](https://lovevery.com/products/the-music-set) pentatonic
bells. Pick a song, hit play, and follow the colored dots as they scroll past
the playhead — each dot lights up (and the bell rings) exactly when it's that
note's turn, so a toddler can play along.

> Not affiliated with or endorsed by Lovevery. Built for personal use with the
> bells from the Music Set.

## The bells

The Lovevery Music Set uses a **5-note pentatonic** set — these five notes
always sound harmonious together:

| Note | Color  |
| :--: | :----- |
|  C   | 🔴 red |
|  D   | 🟠 orange |
|  E   | 🟡 yellow |
|  G   | 🟢 green |
|  A   | 🔵 blue |

Colors live in one place — [`src/bells.js`](src/bells.js) — so you can fine-tune
them to match your physical set.

## Features

- **Side-scrolling player** with a fixed playhead, lyric syllables under each
  dot, and held-note tails — styled after the physical Lovevery song cards.
- **Synthesized bell audio** (Web Audio API) scheduled on the audio clock, so
  the sound stays in sync with the scroll even if the tab drops frames.
- **Tap-to-hear bells** in the legend.
- **Play / pause / restart** and a click-to-seek progress bar.
- Capped at **one minute** per song (`MAX_SECONDS` in `src/songs.js`).
- Built-in song library — all arrangements stay within C · D · E · G · A.

## Run it locally

Requires **Node 18+** (built and tested on Node 24).

```bash
npm install
npm run dev      # start the dev server, then open the printed localhost URL
```

To make a production build:

```bash
npm run build    # outputs to dist/
npm run preview  # serve the built version locally
```

## Add your own song

Songs are plain data in [`src/songs.js`](src/songs.js). Copy a block and edit
it — every note must stay within the five pentatonic notes (any octave, e.g.
`C4`, `A4`, `C5`):

```js
{
  id: 'my-song',
  title: 'My Song',
  subtitle: 'a little tune',
  tempo: 100,          // beats per minute
  beatsPerBar: 4,
  notes: [
    // [ note, lyric, beats ]   ( note: null = rest )
    ['E4', 'la', 1], ['G4', 'la', 1], ['A4', 'laa', 2],
  ],
}
```

The arrangements that ship with the app are intentionally simplified to fit the
pentatonic bells, so a few melodies differ slightly from versions that use notes
outside the set.

## Project layout

```
index.html
src/
  main.jsx                  app entry
  App.jsx                   playback engine + layout
  bells.js                  note→color, note→frequency, Web Audio bell synth
  songs.js                  song library + timeline builder
  styles.css
  components/
    ScrollingSheet.jsx      the scrolling strip + playhead
    Transport.jsx           play/pause/restart + seek bar
    Legend.jsx              tappable bell colors
```

## Tech

React 19 + Vite 6, no other runtime dependencies. Audio is synthesized in the
browser (no audio files to ship).
