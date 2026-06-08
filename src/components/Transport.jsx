function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export default function Transport({
  isPlaying,
  currentTime,
  totalSec,
  onTogglePlay,
  onRestart,
  onSeek,
}) {
  const progress = totalSec > 0 ? Math.min(1, currentTime / totalSec) : 0

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = (e.clientX - rect.left) / rect.width
    onSeek(fraction * totalSec)
  }

  return (
    <div className="transport">
      <button
        type="button"
        className="btn btn-primary"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '❚❚ Pause' : '▶ Play'}
      </button>
      <button
        type="button"
        className="btn"
        onClick={onRestart}
        aria-label="Restart"
      >
        ↺ Restart
      </button>

      <div
        className="progress"
        onClick={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalSec)}
        aria-valuenow={Math.round(currentTime)}
        tabIndex={0}
      >
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        <div className="progress-knob" style={{ left: `${progress * 100}%` }} />
      </div>

      <div className="time">
        {formatTime(currentTime)} / {formatTime(totalSec)}
      </div>
    </div>
  )
}
