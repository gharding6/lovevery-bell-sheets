// Built-in song library.
//
// Every song is a simplified arrangement that fits the Lovevery pentatonic
// bells (C, D, E, G, A). Each note is a tuple:  [ note, lyric, beats ]
//   - note:  e.g. "E4" / "C5", or null for a rest
//   - lyric: the syllable shown under the dot ("" for none / rests)
//   - beats: how many beats the note lasts (1 = quarter note in 4/4)
//
// To add your own song: copy a block below, keep every note within
// C / D / E / G / A (any octave), and add it to the SONGS array.

// The app never renders or plays past this limit (the "max one minute" rule).
export const MAX_SECONDS = 60

const SONG_DATA = [
  {
    id: 'mary-had-a-little-lamb',
    title: 'Mary Had a Little Lamb',
    subtitle: 'longer version',
    tempo: 104,
    beatsPerBar: 4,
    notes: [
      ['E4', 'Ma-', 1], ['D4', 'ry', 1], ['C4', 'had', 1], ['D4', 'a', 1],
      ['E4', 'lit-', 1], ['E4', 'tle', 1], ['E4', 'lamb', 2],
      ['D4', 'lit-', 1], ['D4', 'tle', 1], ['D4', 'lamb', 2],
      ['E4', 'lit-', 1], ['G4', 'tle', 1], ['G4', 'lamb', 2],
      ['E4', 'Ma-', 1], ['D4', 'ry', 1], ['C4', 'had', 1], ['D4', 'a', 1],
      ['E4', 'lit-', 1], ['E4', 'tle', 1], ['E4', 'lamb', 1], ['E4', 'its', 1],
      ['D4', 'fleece', 1], ['D4', 'was', 1], ['E4', 'white', 1], ['D4', 'as', 1],
      ['C4', 'snow', 4],
    ],
  },
  {
    id: 'hot-cross-buns',
    title: 'Hot Cross Buns',
    subtitle: 'a 3-note classic',
    tempo: 100,
    beatsPerBar: 4,
    notes: [
      ['E4', 'Hot', 1], ['D4', 'cross', 1], ['C4', 'buns', 2],
      ['E4', 'Hot', 1], ['D4', 'cross', 1], ['C4', 'buns', 2],
      ['C4', 'one', 0.5], ['C4', 'a', 0.5], ['C4', 'pen-', 0.5], ['C4', 'ny', 0.5],
      ['D4', 'two', 0.5], ['D4', 'a', 0.5], ['D4', 'pen-', 0.5], ['D4', 'ny', 0.5],
      ['E4', 'Hot', 1], ['D4', 'cross', 1], ['C4', 'buns', 2],
    ],
  },
  {
    id: 'rain-rain-go-away',
    title: 'Rain, Rain, Go Away',
    subtitle: 'so–mi–la',
    tempo: 96,
    beatsPerBar: 4,
    notes: [
      ['G4', 'Rain', 1], ['G4', 'rain', 1], ['E4', 'go', 1], ['G4', 'a-', 1], ['E4', 'way', 2],
      ['A4', 'come', 1], ['A4', 'a-', 1], ['G4', 'gain', 1], ['G4', 'some', 1], ['E4', 'day', 2],
    ],
  },
  {
    id: 'pentatonic-warmup',
    title: 'Pentatonic Warm-Up',
    subtitle: 'up & back down the bells',
    tempo: 120,
    beatsPerBar: 4,
    notes: [
      ['C4', 'Up', 1], ['D4', 'we', 1], ['E4', 'climb', 1], ['G4', 'up', 1], ['A4', 'up', 1], ['C5', 'high!', 2],
      ['C5', 'And', 1], ['A4', 'back', 1], ['G4', 'down', 1], ['E4', 'we', 1], ['D4', 'all', 1], ['C4', 'go', 2],
    ],
  },
]

// Expand a song's compact notes into a playable timeline with absolute
// start times (in seconds) and durations, clamped to MAX_SECONDS.
export function withTimeline(song) {
  const secondsPerBeat = 60 / song.tempo
  let beatCursor = 0
  const events = []

  song.notes.forEach((tuple, index) => {
    const [note, lyric, beats] = tuple
    const startSec = beatCursor * secondsPerBeat
    const durSec = beats * secondsPerBeat
    beatCursor += beats
    if (startSec >= MAX_SECONDS) return // never go past one minute
    events.push({
      id: index,
      note,
      lyric,
      beats,
      startBeat: beatCursor - beats,
      startSec,
      durSec: Math.min(durSec, MAX_SECONDS - startSec),
      isRest: note === null,
    })
  })

  const rawTotal = beatCursor * secondsPerBeat
  const totalSec = Math.min(rawTotal, MAX_SECONDS)
  return { ...song, secondsPerBeat, events, totalSec }
}

export const SONGS = SONG_DATA
