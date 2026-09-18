import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';

export default function CourseCard({ course }) {
  const categoryClass = course.category.toLowerCase();
  return <article className="content-card course-card"><div className={`card-accent accent-${categoryClass}`}><span>{course.category.slice(0, 1)}</span><small>{course.level}</small></div><div className="card-body"><div className="card-topline"><StatusBadge tone="blue">{course.level}</StatusBadge><span className="muted-text">{course.durationMinutes} min</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="card-meta"><span>{course.lessons?.length || 0} lessons</span><span>·</span><span>{course.category}</span></div><div className="card-progress"><div className="progress-track"><span style={{ width: `${course.progressPercent || 0}%` }} /></div><span>{course.progressPercent || 0}%</span></div><Link className="text-link" to={`/courses/${course._id}`}>{course.progressPercent > 0 ? 'Continue learning' : 'View course'} <span>→</span></Link></div></article>;
}

