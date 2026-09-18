import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

export default function MockCard({ test }) {
  return <article className="content-card mock-card"><div className="mock-card-top"><div className="test-symbol">{test.examType.slice(0, 1)}</div><div><span className="eyebrow eyebrow-small">{test.examType}</span><StatusBadge tone="blue">{test.level}</StatusBadge></div></div><h3>{test.title}</h3><p>{test.description}</p><div className="card-meta"><span>{test.numberOfQuestions} questions</span><span>·</span><span>{test.durationMinutes} min</span><span>·</span><span>{test.difficulty}</span></div>{test.bestAttempt && <div className="best-score"><span>Best score</span><strong>{test.bestAttempt.percentage}%</strong></div>}<Link className="text-link" to={`/mock-tests/${test._id}`}>{test.status === 'Completed' ? 'Review test' : 'View test'} <span>→</span></Link></article>;
}

