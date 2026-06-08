import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BellPlayer, noteToFreq } from './bells.js'
import { SONGS, withTimeline } from './songs.js'
import ScrollingSheet from './components/ScrollingSheet.jsx'
import Legend from './components/Legend.jsx'
import Transport from './components/Transport.jsx'

const LEAD_IN = 0.15 // small delay before the first note so audio can warm up

export default function App() {
  const [songId, setSongId] = useState(SONGS[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // The fully-expanded, timed version of the selected song.
  const song = useMemo(
    () => withTimeline(SONGS.find((s) => s.id === songId) || SONGS[0]),
    [songId],
  )

  const playerRef = useRef(null)
  const rafRef = useRef(0)
  const t0Ref = useRef(0) // audio-clock time that corresponds to song-time 0
  const offsetRef = useRef(0) // seconds already played (for pause / resume / seek)

  if (!playerRef.current) playerRef.current = new BellPlayer()

  const stopClock = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  // Schedule every note from `fromSec` onward on the audio clock.
  const schedule = useCallback(
    (fromSec) => {
      const player = playerRef.current
      const t0 = player.now + LEAD_IN - fromSec
      t0Ref.current = t0
      for (const ev of song.events) {
        if (ev.isRest) continue
        if (ev.startSec < fromSec - 1e-3) continue
        player.strike(noteToFreq(ev.note), t0 + ev.startSec, {
          duration: Math.max(0.7, ev.durSec * 1.4),
        })
      }
    },
    [song],
  )

  const tick = useCallback(() => {
    const player = playerRef.current
    const cur = player.now - t0Ref.current
    if (cur >= song.totalSec) {
      setCurrentTime(song.totalSec)
      setIsPlaying(false)
      offsetRef.current = 0
      stopClock()
      return
    }
    setCurrentTime(Math.max(0, cur))
    rafRef.current = requestAnimationFrame(tick)
  }, [song.totalSec, stopClock])

  const play = useCallback(() => {
    const player = playerRef.current
    player.resume()
    if (offsetRef.current >= song.totalSec) offsetRef.current = 0
    schedule(offsetRef.current)
    setIsPlaying(true)
    stopClock()
    rafRef.current = requestAnimationFrame(tick)
  }, [schedule, song.totalSec, stopClock, tick])

  const pause = useCallback(() => {
    const player = playerRef.current
    const cur = Math.min(Math.max(0, player.now - t0Ref.current), song.totalSec)
    offsetRef.current = cur
    player.stopAll()
    stopClock()
    setIsPlaying(false)
    setCurrentTime(cur)
  }, [song.totalSec, stopClock])

  const restart = useCallback(() => {
    playerRef.current.stopAll()
    stopClock()
    offsetRef.current = 0
    setCurrentTime(0)
    setIsPlaying(false)
  }, [stopClock])

  const seek = useCallback(
    (sec) => {
      const clamped = Math.min(Math.max(0, sec), song.totalSec)
      const wasPlaying = isPlaying
      playerRef.current.stopAll()
      stopClock()
      offsetRef.current = clamped
      setCurrentTime(clamped)
      if (wasPlaying) {
        // resume from the new position
        playerRef.current.resume()
        schedule(clamped)
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setIsPlaying(false)
      }
    },
    [isPlaying, schedule, song.totalSec, stopClock, tick],
  )

  // Reset playback whenever the song changes.
  useEffect(() => {
    playerRef.current.stopAll()
    stopClock()
    offsetRef.current = 0
    setCurrentTime(0)
    setIsPlaying(false)
  }, [songId, stopClock])

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      stopClock()
      playerRef.current?.stopAll()
    }
  }, [stopClock])

  const togglePlay = isPlaying ? pause : play

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="app-mark" aria-hidden="true">
            <i style={{ background: '#E0533D' }} />
            <i style={{ background: '#E89B3C' }} />
            <i style={{ background: '#ECC94B' }} />
            <i style={{ background: '#5FB28A' }} />
            <i style={{ background: '#5B8FB9' }} />
          </span>
          Bell Sheets
        </h1>
        <p className="tagline">
          Side-scrolling, color-coded song sheets for the Lovevery pentatonic bells.
        </p>
      </header>

      <div className="song-picker">
        <label htmlFor="song">Song</label>
        <select
          id="song"
          value={songId}
          onChange={(e) => setSongId(e.target.value)}
        >
          {SONGS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
              {s.subtitle ? ` — ${s.subtitle}` : ''}
            </option>
          ))}
        </select>
      </div>

      <ScrollingSheet
        events={song.events}
        totalSec={song.totalSec}
        currentTime={currentTime}
        secondsPerBeat={song.secondsPerBeat}
        beatsPerBar={song.beatsPerBar}
      />

      <Transport
        isPlaying={isPlaying}
        currentTime={currentTime}
        totalSec={song.totalSec}
        onTogglePlay={togglePlay}
        onRestart={restart}
        onSeek={seek}
      />

      <Legend onPreview={(note) => playerRef.current.preview(note)} />

      <footer className="app-footer">
        <p>
          Tap a bell above to hear it. Built for the Lovevery Music Set
          pentatonic bells (C · D · E · G · A). Not affiliated with Lovevery.
        </p>
      </footer>
    </div>
  )
}
