function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const remaining = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${remaining}`;
}

export default function Timer({ seconds }) {
  const tone = seconds <= 60 ? 'critical' : seconds <= 180 ? 'warning' : 'normal';
  return <div className={`test-timer timer-${tone}`}><span className="timer-dot" />{formatTime(seconds)}</div>;
}

