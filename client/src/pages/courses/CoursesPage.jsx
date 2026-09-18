import { useState } from 'react';
import CourseCard from '../../components/CourseCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Button from '../../components/Button.jsx';
import { coursesApi } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';

const categories = ['All', 'Listening', 'Grammar', 'Reading', 'Kanji', 'Vocabulary'];

export default function CoursesPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { data, loading, error, execute } = useAsync(() => coursesApi.list({ category: category === 'All' ? undefined : category, search: search || undefined }), [category, search]);
  if (loading) return <LoadingState label="Loading your study materials…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  return <div className="courses-page page-stack"><PageHeader eyebrow="Study materials" title="A clearer way to keep learning." description={`Explore ${data.courses.length} courses across your assigned level and the levels beneath it.`} action={<StatusBadge tone="blue">Assigned level · {data.assignedLevel}</StatusBadge>} /><div className="filter-toolbar"><div className="filter-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search study materials" /></div><div className="filter-tabs">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>{data.courses.length ? <div className="card-grid course-grid">{data.courses.map((course) => <CourseCard course={course} key={course._id} />)}</div> : <EmptyState title="No materials match your search" description="Try a different phrase or browse another category." />}</div>;
}

