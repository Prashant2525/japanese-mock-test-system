import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';
import { coursesApi } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { data, loading, error, execute } = useAsync(() => coursesApi.get(courseId), [courseId]);
  if (loading) return <LoadingState label="Opening course details…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  const { course } = data;
  const firstIncomplete = course.lessons.find((lesson) => !course.completedLessonIds.map(String).includes(String(lesson._id))) || course.lessons[0];
  return <div className="course-detail-page page-stack"><Link className="back-link" to="/courses">← Back to study materials</Link><PageHeader eyebrow={`${course.level} · ${course.category}`} title={course.title} description={course.description} action={<StatusBadge tone={course.progressPercent === 100 ? 'success' : 'blue'}>{course.status}</StatusBadge>} /><section className="course-hero-grid"><div className="course-overview-card"><div className="course-overview-top"><div className="large-course-symbol">{course.category.slice(0, 1)}</div><div><span className="eyebrow">Course overview</span><h2>Learn at a pace you can keep.</h2></div></div><p>{course.description}</p><div className="course-stat-row"><div><strong>{course.lessons.length}</strong><span>Lessons</span></div><div><strong>{course.durationMinutes}</strong><span>Minutes</span></div><div><strong>{course.progressPercent}%</strong><span>Complete</span></div></div><div className="card-progress large-progress"><div className="progress-track"><span style={{ width: `${course.progressPercent}%` }} /></div><span>{course.progressPercent}%</span></div>{firstIncomplete && <Link className="button button-primary" to={`/courses/${course._id}/lessons/${firstIncomplete._id}`}>{course.progressPercent ? 'Continue course' : 'Start course'} <span>→</span></Link>}</div><div className="learn-list"><span className="eyebrow">What you’ll learn</span><h3>Small steps, connected together.</h3><ul><li>Recognise useful Japanese in context.</li><li>Build confidence through focused practice.</li><li>Review with clear explanations.</li></ul></div></section><section className="curriculum-section"><div className="section-heading"><div><span className="eyebrow">Curriculum</span><h2>Lessons in this course</h2></div><span className="muted-text">{course.lessons.length} lessons</span></div><div className="lesson-list">{course.lessons.map((lesson, index) => { const complete = course.completedLessonIds.map(String).includes(String(lesson._id)); return <Link className={`lesson-row ${complete ? 'complete' : ''}`} to={`/courses/${course._id}/lessons/${lesson._id}`} key={lesson._id}><span className="lesson-number">{complete ? '✓' : String(index + 1).padStart(2, '0')}</span><span className="lesson-main"><strong>{lesson.title}</strong><small>{lesson.type} · {lesson.durationMinutes} min</small></span><span className="lesson-status">{complete ? 'Completed' : 'Open'} <span>→</span></span></Link>; })}</div></section></div>;
}

