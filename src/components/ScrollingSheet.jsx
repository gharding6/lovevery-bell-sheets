import { useLayoutEffect, useRef, useState } from 'react'
import { colorFor, pitchClass } from '../bells.js'

const PX_PER_SEC = 130 // horizontal scale of the scrolling strip
const PLAYHEAD_FRACTION = 0.3 // playhead sits 30% from the left edge
const DOT = 60 // dot diameter in px

export default function ScrollingSheet({
  events,
  totalSec,
  currentTime,
  secondsPerBeat,
  beatsPerBar,
}) {
  const viewportRef = useRef(null)
  const [width, setWidth] = useState(0)

  // Track the viewport width so the playhead can stay at a fixed fraction.
  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const playheadPx = width * PLAYHEAD_FRACTION
  const stripOffset = playheadPx - currentTime * PX_PER_SEC
  const stripWidth = totalSec * PX_PER_SEC + width // padding so it scrolls fully past

  // Bar lines (visual grouping) across the whole song.
  const barLines = []
  if (secondsPerBeat && beatsPerBar) {
    const barSec = secondsPerBeat * beatsPerBar
    for (let t = 0, i = 0; t <= totalSec + 1e-6; t += barSec, i++) {
      barLines.push({ x: t * PX_PER_SEC, i })
    }
  }

  return (
    <div className="sheet" ref={viewportRef}>
      <div className="sheet-playhead" style={{ left: playheadPx }}>
        <span className="sheet-playhead-cap" />
      </div>

      <div
        className="sheet-strip"
        style={{ width: stripWidth, transform: `translateX(${stripOffset}px)` }}
      >
        <div className="sheet-lane" />

        {barLines.map((b) => (
          <div key={`bar-${b.i}`} className="sheet-barline" style={{ left: b.x }} />
        ))}

        {events.map((ev) => {
          if (ev.isRest) return null
          const x = ev.startSec * PX_PER_SEC
          const tailWidth = Math.max(0, ev.durSec * PX_PER_SEC - DOT)
          const active =
            currentTime >= ev.startSec && currentTime < ev.startSec + ev.durSec
          const color = colorFor(ev.note)
          return (
            <div
              key={ev.id}
              className={`note${active ? ' is-active' : ''}`}
              style={{ left: x }}
            >
              {tailWidth > 4 && (
                <span
                  className="note-tail"
                  style={{ width: tailWidth + DOT / 2, background: color }}
                />
              )}
              <span
                className="note-dot"
                style={{ background: color, width: DOT, height: DOT }}
              >
                {pitchClass(ev.note)}
              </span>
              <span className="note-lyric">{ev.lyric}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
