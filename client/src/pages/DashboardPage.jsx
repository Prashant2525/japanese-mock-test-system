import { Link } from 'react-router-dom';
import { dashboardApi, getErrorMessage } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import CourseCard from '../components/CourseCard.jsx';
import MockCard from '../components/MockCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function DashboardPage() {
  const { data, loading, error, execute } = useAsync(dashboardApi.get);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  const { user, stats, recommendedCourses = [], recommendedMockTests = [], recentResults = [] } = data;
  return <div className="dashboard-page page-stack"><section className="welcome-panel"><div><span className="eyebrow">Your learning space</span><h1>こんにちは, {user.fullName?.split(' ')[0]} <span className="wave">👋</span></h1><p>Keep a steady pace and make one meaningful step in Japanese today.</p><div className="welcome-actions"><Link className="button button-primary" to="/courses">Continue learning <span>→</span></Link><Link className="button button-light" to="/mock-tests">Explore mock tests</Link></div></div><div className="level-orbit"><span>Current level</span><strong>{user.assignedLevel}</strong><small>System assigned</small></div></section><section className="stats-grid"><Metric label="Tests completed" value={stats.completedTests} detail="Mock attempts" symbol="▣" /><Metric label="Average score" value={`${stats.averageScore}%`} detail="Across completed tests" symbol="↗" /><Metric label="Best score" value={`${stats.bestScore}%`} detail="Personal best" symbol="★" /><Metric label="Courses started" value={stats.coursesStarted} detail="Keep the rhythm" symbol="◌" /></section><section className="section-heading"><div><span className="eyebrow">A path shaped for you</span><h2>Recommended courses</h2></div><Link className="text-link" to="/courses">View all courses →</Link></section><div className="card-grid course-grid">{recommendedCourses.map((course) => <CourseCard course={course} key={course._id} />)}</div><section className="section-heading section-heading-spaced"><div><span className="eyebrow">Practice with purpose</span><h2>Recommended mock tests</h2></div><Link className="text-link" to="/mock-tests">Browse tests →</Link></section><div className="card-grid mock-grid">{recommendedMockTests.map((test) => <MockCard test={test} key={test._id} />)}</div><section className="recent-section"><div className="section-heading"><div><span className="eyebrow">Your momentum</span><h2>Recent results</h2></div><Link className="text-link" to="/results">See history →</Link></div>{recentResults.length ? <div className="recent-table"><div className="recent-table-head"><span>Test</span><span>Score</span><span>Result</span><span>Date</span></div>{recentResults.map((result) => <Link to={`/results/${result._id}`} className="recent-row" key={result._id}><span><strong>{result.examType}</strong><small>{result.level} · {result.totalQuestions} questions</small></span><strong>{result.percentage}%</strong><StatusBadge tone={result.passed ? 'success' : 'neutral'}>{result.passed ? 'Passed' : 'Keep practicing'}</StatusBadge><span className="muted-text">{formatDate(result.submittedAt)}</span></Link>)}</div> : <div className="empty-inline">Your completed mock tests will appear here.</div>}</section></div>;
}

function Metric({ label, value, detail, symbol }) { return <div className="metric-card"><span className="metric-symbol">{symbol}</span><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'; }

