// The Lovevery Music Set uses a 5-note PENTATONIC bell set: C, D, E, G, A.
// Those five notes always sound harmonious together, and each one is color-coded
// to match the bells, the pan flute, and the Rhythm & Songs book.
//
// Colors below are tuned to match the physical Lovevery cards (red / orange /
// yellow / green / blue). Tweak the hex values here if you want an even closer
// match to your set — every dot in the app reads from this single map.
export const BELL_COLORS = {
  C: '#E0533D', // red
  D: '#E89B3C', // orange
  E: '#ECC94B', // yellow
  G: '#5FB28A', // green
  A: '#5B8FB9', // blue
}

// Display order, low -> high within an octave.
export const BELL_ORDER = ['C', 'D', 'E', 'G', 'A']

// Semitone offset of each pentatonic note from C within its octave.
const NOTE_SEMITONES = { C: 0, D: 2, E: 4, G: 7, A: 9 }

// Strip the octave digit: "E4" -> "E". Used to look up color.
export function pitchClass(note) {
  return note.replace(/[0-9]/g, '')
}

export function colorFor(note) {
  return BELL_COLORS[pitchClass(note)] || '#cccccc'
}

// Convert a note name like "E4" / "C5" to a frequency in Hz (A4 = 440).
export function noteToFreq(note) {
  const m = /^([A-G])(\d)$/.exec(note)
  if (!m) return null
  const letter = m[1]
  const octave = parseInt(m[2], 10)
  const semis = NOTE_SEMITONES[letter]
  if (semis === undefined) return null
  // MIDI note number: C4 = 60, so midi = 12 * (octave + 1) + semitone.
  const midi = 12 * (octave + 1) + semis
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// A small Web Audio engine that synthesizes a soft, bell-like "ding".
// A real pat-bell tone is a fundamental plus a few slightly-inharmonic
// overtones with a quick attack and a long exponential decay.
export class BellPlayer {
  constructor() {
    this.ctx = null
    this.master = null
    this.voices = [] // oscillators currently scheduled, so we can stop on pause
  }

  ensure() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      this.ctx = new AudioCtx()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.9
      this.master.connect(this.ctx.destination)
    }
    return this.ctx
  }

  get now() {
    return this.ensure().currentTime
  }

  resume() {
    return this.ensure().resume()
  }

  // Schedule one bell strike at absolute audio-clock time `when`.
  strike(freq, when, { duration = 1.7, gain = 0.5 } = {}) {
    if (!freq) return
    const ctx = this.ensure()
    const partials = [
      { ratio: 1.0, gain: 1.0 },
      { ratio: 2.0, gain: 0.5 },
      { ratio: 2.97, gain: 0.32 },
      { ratio: 4.1, gain: 0.18 },
      { ratio: 5.43, gain: 0.1 },
    ]

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, when)
    env.gain.exponentialRampToValueAtTime(gain, when + 0.006)
    env.gain.exponentialRampToValueAtTime(0.0006, when + duration)
    env.connect(this.master)

    for (const p of partials) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq * p.ratio
      const g = ctx.createGain()
      g.gain.value = p.gain
      osc.connect(g)
      g.connect(env)
      osc.start(when)
      osc.stop(when + duration + 0.05)
      this.voices.push(osc)
      osc.onended = () => {
        this.voices = this.voices.filter((v) => v !== osc)
      }
    }
  }

  // Immediate single strike — used when tapping a bell in the legend.
  preview(note) {
    this.resume()
    this.strike(noteToFreq(note), this.now + 0.01)
  }

  // Stop everything currently sounding/scheduled (used on pause / restart).
  stopAll() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    for (const osc of this.voices) {
      try {
        osc.stop(t)
      } catch {
        /* already stopped */
      }
    }
    this.voices = []
  }
}
