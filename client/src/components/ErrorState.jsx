export default function ErrorState({ message = 'We could not load this page.', onRetry }) {
  return <div className="state-card error-state"><div className="state-icon">!</div><h3>Something needs attention</h3><p>{message}</p>{onRetry && <button className="button button-secondary" onClick={onRetry}>Try again</button>}</div>;
}

