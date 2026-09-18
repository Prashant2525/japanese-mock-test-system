export default function LoadingState({ label = 'Loading your learning space…' }) {
  return <div className="loading-state"><span className="spinner" aria-hidden="true" />{label}</div>;
}

