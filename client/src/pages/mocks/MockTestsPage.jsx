import { useState } from 'react';
import MockCard from '../../components/MockCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { mocksApi } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';

export default function MockTestsPage() {
  const [filters, setFilters] = useState({ examType: '', level: '', section: '', difficulty: '', status: '' });
  const { data, loading, error, execute } = useAsync(() => mocksApi.list(filters), Object.values(filters));
  if (loading) return <LoadingState label="Loading mock tests…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  const tests = data.mockTests;
  return <div className="mocks-page page-stack"><PageHeader eyebrow="Mock tests" title="Practice with a plan." description="Choose a focused JLPT, NAT, or JFT mock and see how your preparation is progressing." /><div className="exam-overview"><div><span className="exam-mark">J</span><strong>JLPT</strong><small>Japanese Language Proficiency Test</small></div><div><span className="exam-mark exam-mark-red">N</span><strong>NAT</strong><small>Practical Japanese assessment</small></div><div><span className="exam-mark exam-mark-gold">J</span><strong>JFT</strong><small>Japanese Foundation Test</small></div></div><div className="mock-filters"><select value={filters.examType} onChange={(event) => setFilters({ ...filters, examType: event.target.value })}><option value="">All exams</option><option value="JLPT">JLPT</option><option value="NAT">NAT</option><option value="JFT">JFT</option></select><select value={filters.level} onChange={(event) => setFilters({ ...filters, level: event.target.value })}><option value="">All levels</option>{['N5', 'N4', 'N3', 'N2', 'N1', 'A1', 'A2.1', 'A2.2', 'A2'].map((level) => <option value={level} key={level}>{level}</option>)}</select><select value={filters.section} onChange={(event) => setFilters({ ...filters, section: event.target.value })}><option value="">All sections</option>{['Listening', 'Grammar', 'Reading', 'Kanji', 'Vocabulary'].map((section) => <option value={section} key={section}>{section}</option>)}</select><select value={filters.difficulty} onChange={(event) => setFilters({ ...filters, difficulty: event.target.value })}><option value="">All difficulty</option><option value="Foundational">Foundational</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All status</option><option value="completed">Completed</option><option value="not_started">Not started</option></select></div>{tests.length ? <div className="card-grid mock-grid">{tests.map((test) => <MockCard test={test} key={test._id} />)}</div> : <EmptyState title="No mock tests found" description="Try clearing one of the filters to see more practice options." />}</div>;
}

