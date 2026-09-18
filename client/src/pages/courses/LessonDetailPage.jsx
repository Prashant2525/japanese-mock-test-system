import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { coursesApi } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Button from '../../components/Button.jsx';

export default function LessonDetailPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, execute } = useAsync(() => coursesApi.get(courseId), [courseId]);
  const [saving, setSaving] = useState(false);
  if (loading) return <LoadingState label="Opening lesson…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  const course = data.course;
  const index = course.lessons.findIndex((lesson) => String(lesson._id) === String(lessonId));
  const lesson = course.lessons[index];
  if (!lesson) return <ErrorState message="That lesson could not be found." />;
  const previous = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const isComplete = course.completedLessonIds.map(String).includes(String(lesson._id));

  async function markComplete() {
    setSaving(true);
    try { await coursesApi.updateProgress(courseId, { lessonId: lesson._id, completed: !isComplete }); await execute(); }
    finally { setSaving(false); }
  }

  return <div className="lesson-page page-stack"><Link className="back-link" to={`/courses/${courseId}`}>← Back to course</Link><div className="lesson-breadcrumb"><span>{course.level}</span><span>·</span><span>{course.title}</span></div><section className="lesson-article"><div className="lesson-article-header"><div><span className="eyebrow">Lesson {index + 1} · {lesson.type}</span><h1>{lesson.title}</h1><p>{lesson.durationMinutes} minutes · {isComplete ? 'Completed' : 'In progress'}</p></div><div className={`lesson-check ${isComplete ? 'done' : ''}`}>{isComplete ? '✓' : String(index + 1).padStart(2, '0')}</div></div><div className="lesson-content"><p className="japanese-content">{lesson.content}</p><div className="lesson-explanation"><span className="eyebrow">Explanation</span><p>{lesson.explanation}</p></div>{lesson.audioUrl && <div className="audio-block"><span className="eyebrow">Listening practice</span><audio controls src={lesson.audioUrl} /></div>}{lesson.transcript && <div className="transcript-block"><span className="eyebrow">Transcript</span><p>{lesson.transcript}</p></div>}{lesson.documentUrl && <div className="transcript-block"><span className="eyebrow">Study document</span><p><a className="text-link" href={lesson.documentUrl} target="_blank" rel="noreferrer">Open document →</a></p></div>}</div><div className="lesson-footer"><Button variant={isComplete ? 'secondary' : 'primary'} onClick={markComplete} disabled={saving}>{saving ? 'Saving…' : isComplete ? 'Mark as incomplete' : 'Mark lesson complete'}</Button><div className="lesson-navigation">{previous ? <Link className="button button-secondary" to={`/courses/${courseId}/lessons/${previous._id}`}>← Previous</Link> : <span />}{next ? <Link className="button button-primary" to={`/courses/${courseId}/lessons/${next._id}`}>Next lesson →</Link> : <Button onClick={() => navigate(`/courses/${courseId}`)}>Finish course →</Button>}</div></div></section></div>;
}
