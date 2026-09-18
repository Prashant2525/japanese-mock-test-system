import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import { mocksApi, getErrorMessage } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';

export default function MockTestDetailPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, execute } = useAsync(() => mocksApi.get(testId), [testId]);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  if (loading) return <LoadingState label="Loading test details…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  const { mockTest, previousAttempts } = data;
  async function start() {
    setStarting(true); setStartError('');
    try { const response = await mocksApi.start(testId); navigate(`/mock-tests/session/${response.data.attemptId}`); }
    catch (startFailure) { setStartError(getErrorMessage(startFailure)); }
    finally { setStarting(false); }
  }
  return <div className="mock-detail-page page-stack"><Link className="back-link" to="/mock-tests">← Back to mock tests</Link><PageHeader eyebrow={`${mockTest.examType} · ${mockTest.level}`} title={mockTest.title} description={mockTest.description} action={<StatusBadge tone="blue">{mockTest.difficulty}</StatusBadge>} /><div className="mock-detail-grid"><section className="test-instructions-card"><div className="instructions-header"><div className="test-symbol large-symbol">{mockTest.examType.slice(0, 1)}</div><div><span className="eyebrow">Test instructions</span><h2>Set aside a focused block of time.</h2></div></div><p>Work through one question at a time. Your answers are saved as you move through the test, and the timer will submit automatically when it reaches zero.</p><div className="instruction-facts"><div><span>Questions</span><strong>{mockTest.numberOfQuestions}</strong></div><div><span>Duration</span><strong>{mockTest.durationMinutes} min</strong></div><div><span>Sections</span><strong>{mockTest.sections.length}</strong></div></div><ul className="rules-list"><li>You can move between questions using the navigator.</li><li>Review answered and unanswered questions before manual submission.</li><li>A timed test is submitted automatically when time expires.</li></ul><FormMessage>{startError}</FormMessage><Button onClick={start} disabled={starting}>{starting ? 'Preparing test…' : 'Start test'} <span>→</span></Button></section><aside className="test-detail-aside"><div className="aside-section"><span className="eyebrow">Included sections</span><div className="section-pills">{mockTest.sections.map((section) => <span key={section}>{section}</span>)}</div></div><div className="aside-section"><span className="eyebrow">Previous attempts</span>{previousAttempts.length ? <div className="attempt-mini-list">{previousAttempts.slice(0, 4).map((attempt) => <div key={attempt.id}><span>{formatDate(attempt.submittedAt)}</span><strong>{attempt.percentage}%</strong><StatusBadge tone={attempt.passed ? 'success' : 'neutral'}>{attempt.passed ? 'Passed' : 'Review'}</StatusBadge></div>)}</div> : <p className="muted-text">You haven’t taken this test yet.</p>}</div></aside></div></div>;
}

function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'; }

