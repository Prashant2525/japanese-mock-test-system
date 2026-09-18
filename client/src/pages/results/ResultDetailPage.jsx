import { Link, useLocation, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { attemptsApi } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';

export default function ResultDetailPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const { data, loading, error, execute } = useAsync(() => attemptsApi.result(attemptId), [attemptId]);
  if (loading) return <LoadingState label="Opening result review…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  const { result, test } = data;
  return <div className="result-detail-page page-stack"><Link className="back-link" to="/results">← Back to results</Link><PageHeader eyebrow={`${result.examType} · ${result.level}`} title={test?.title || 'Level Determination Assessment'} description={`Completed ${formatDate(result.submittedAt)}${location.state?.autoSubmitted ? ' · Automatically submitted when time expired' : ''}`} action={<StatusBadge tone={result.passed ? 'success' : 'neutral'}>{result.passed ? 'Passed' : 'Review needed'}</StatusBadge>} /><section className="result-detail-hero"><div className="score-hero"><span className="eyebrow">Your score</span><strong>{result.percentage}<small>%</small></strong><span>{result.marksObtained} of {result.totalMarks} marks</span></div><div className="result-breakdown"><Metric label="Correct answers" value={`${result.correctAnswers}/${result.totalQuestions}`} /><Metric label="Incorrect answers" value={result.incorrectAnswers} /><Metric label="Threshold" value={`${result.passingThreshold}%`} /></div></section><section className="section-results"><div className="section-heading"><div><span className="eyebrow">Performance by section</span><h2>Where your score came from</h2></div></div><div className="section-result-grid">{result.sectionResults.map((section) => <div className="section-result-card" key={section.section}><div><strong>{section.section}</strong><span>{section.correctAnswers}/{section.totalQuestions} correct</span></div><strong>{section.percentage}%</strong><div className="progress-track"><span style={{ width: `${section.percentage}%` }} /></div></div>)}</div></section><section className="review-section"><div className="section-heading"><div><span className="eyebrow">Question review</span><h2>Learn from every answer.</h2></div></div><div className="review-list">{result.review.map((item, index) => <ReviewItem item={item} index={index} key={String(item.questionId)} />)}</div></section></div>;
}

function Metric({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div>; }

function ReviewItem({ item, index }) {
  const selectedText = item.selectedOption === null || item.selectedOption === undefined ? 'No answer selected' : item.options[item.selectedOption]?.text || 'Unavailable';
  const correctText = item.options[item.correctOption]?.text || 'Unavailable';
  return <article className={`review-item ${item.isCorrect ? 'review-correct' : 'review-incorrect'}`}><div className="review-number">{String(index + 1).padStart(2, '0')}</div><div className="review-body"><div className="review-status"><StatusBadge tone={item.isCorrect ? 'success' : 'error'}>{item.isCorrect ? 'Correct' : 'Incorrect'}</StatusBadge></div><h3>{item.question}</h3><div className="review-answers"><div><span>Your answer</span><strong>{selectedText}</strong></div><div><span>Correct answer</span><strong>{correctText}</strong></div></div>{item.explanation && <div className="review-explanation"><span>Why</span><p>{item.explanation}</p></div>}</div></article>;
}

function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'; }

