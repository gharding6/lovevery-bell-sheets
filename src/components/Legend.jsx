import { BELL_ORDER, BELL_COLORS } from '../bells.js'

// The five Lovevery bells. Tap one to hear it (handy for tuning your ear
// before following the sheet).
export default function Legend({ onPreview }) {
  return (
    <div className="legend">
      <span className="legend-label">The bells</span>
      <div className="legend-bells">
        {BELL_ORDER.map((note) => (
          <button
            key={note}
            type="button"
            className="legend-bell"
            style={{ background: BELL_COLORS[note] }}
            onClick={() => onPreview(`${note}4`)}
            aria-label={`Play bell ${note}`}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  )
}
