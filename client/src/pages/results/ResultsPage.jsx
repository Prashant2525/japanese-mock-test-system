import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { attemptsApi } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';

export default function ResultsPage() {
  const { data, loading, error, execute } = useAsync(attemptsApi.results);
  if (loading) return <LoadingState label="Loading your results…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  return <div className="results-page page-stack"><PageHeader eyebrow="Results history" title="See your progress clearly." description="Every completed assessment is a useful signal. Review the details and choose your next step." /><div className="results-summary-strip"><div><span className="eyebrow">Completed activities</span><strong>{data.results.length}</strong></div><div><span className="eyebrow">Mock tests</span><strong>{data.results.filter((result) => result.kind === 'mock').length}</strong></div><div><span className="eyebrow">Level status</span><strong>Assigned</strong></div></div>{data.results.length ? <div className="results-table"><div className="results-table-head"><span>Test</span><span>Level</span><span>Score</span><span>Outcome</span><span>Date</span><span /></div>{data.results.map((result) => <Link className="results-row" to={`/results/${result.id}`} key={result.id}><span><strong>{result.title}</strong><small>{result.examType}</small></span><StatusBadge tone="blue">{result.level}</StatusBadge><strong>{result.percentage}%</strong><StatusBadge tone={result.passed ? 'success' : 'neutral'}>{result.passed ? 'Passed' : 'Review'}</StatusBadge><span className="muted-text">{formatDate(result.submittedAt)}</span><span className="row-arrow">→</span></Link>)}</div> : <EmptyState title="Your results will appear here" description="Complete your first mock test to start building a history." />}</div>;
}

function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'; }

