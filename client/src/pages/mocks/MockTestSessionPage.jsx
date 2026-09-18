import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { attemptsApi, getErrorMessage } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Button from '../../components/Button.jsx';
import Timer from '../../components/Timer.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import FormMessage from '../../components/FormMessage.jsx';

export default function MockTestSessionPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, execute } = useAsync(() => attemptsApi.get(attemptId), [attemptId]);
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remaining, setRemaining] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (data?.attempt) {
      setAttempt(data.attempt);
      setAnswers(Object.fromEntries(data.attempt.answers.map((answer) => [String(answer.questionId), answer.selectedOption])));
      const end = new Date(data.attempt.startedAt).getTime() + data.attempt.durationSeconds * 1000;
      setRemaining(Math.max(0, Math.ceil((end - Date.now()) / 1000)));
    }
  }, [data]);

  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return undefined;
    const interval = window.setInterval(() => {
      const end = new Date(attempt.startedAt).getTime() + attempt.durationSeconds * 1000;
      const next = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0 && !autoSubmitted.current) { autoSubmitted.current = true; submit(true); }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [attempt]);

  async function selectAnswer(optionIndex) {
    const question = attempt.questions[currentIndex];
    setAnswers((current) => ({ ...current, [String(question.id)]: optionIndex }));
    try { await attemptsApi.answer(attemptId, { questionId: question.id, selectedOption: optionIndex }); }
    catch (answerError) { setActionError(getErrorMessage(answerError)); }
  }

  async function submit(isAuto = false) {
    setSubmitLoading(true); setActionError(''); setConfirmOpen(false);
    try { const response = await attemptsApi.submit(attemptId); navigate(`/results/${response.data.attemptId}`, { replace: true, state: { autoSubmitted: isAuto || response.data.autoSubmitted } }); }
    catch (submitError) { setActionError(getErrorMessage(submitError)); setSubmitLoading(false); }
  }

  if (loading || !attempt) return <LoadingState label="Preparing your test session…" />;
  if (error) return <ErrorState message={error} onRetry={() => execute()} />;
  const question = attempt.questions[currentIndex];
  const answeredCount = Object.values(answers).filter((value) => value !== null && value !== undefined).length;
  const progress = Math.round(((currentIndex + 1) / attempt.questions.length) * 100);
  return <div className="session-page"><header className="session-header"><div className="session-brand"><span className="session-mark">{attempt.examType.slice(0, 1)}</span><div><strong>{attempt.examType} {attempt.level}</strong><small>{data.test?.title}</small></div></div><div className="session-header-meta"><span>{question.section}</span><span>Question {currentIndex + 1} / {attempt.questions.length}</span><Timer seconds={remaining} /></div></header><div className="session-progress"><span style={{ width: `${progress}%` }} /></div><main className="session-main"><aside className="session-navigator"><div className="navigator-header"><span>Question navigator</span><strong>{answeredCount}/{attempt.questions.length}</strong></div><div className="navigator-grid">{attempt.questions.map((item, index) => <button key={item.id} className={`${index === currentIndex ? 'current' : ''} ${answers[String(item.id)] !== undefined && answers[String(item.id)] !== null ? 'answered' : ''}`} onClick={() => setCurrentIndex(index)}>{index + 1}</button>)}</div><div className="navigator-status"><span><i className="legend-dot current-dot" />Current</span><span><i className="legend-dot answered-dot" />Answered</span><span><i className="legend-dot" />Unanswered</span></div><Button variant="danger" className="submit-sidebar" onClick={() => setConfirmOpen(true)}>Submit test</Button></aside><section className="session-question"><div className="session-question-top"><div><span className="eyebrow">{question.section}</span><h1>Question {currentIndex + 1}</h1></div><span className="muted-text">{answeredCount} answered</span></div><div className="session-question-card"><h2>{question.prompt}</h2>{question.imageUrl && <img className="question-media" src={question.imageUrl} alt="Question reference" />}{question.audioUrl && <audio controls src={question.audioUrl} className="question-audio" />}<div className="answer-list">{question.options.map((option, index) => <button key={option.text} className={`answer-option ${answers[String(question.id)] === index ? 'selected' : ''}`} onClick={() => selectAnswer(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option.text}</span><span className="answer-check">{answers[String(question.id)] === index ? '✓' : ''}</span></button>)}</div><FormMessage>{actionError}</FormMessage></div><div className="session-actions"><Button variant="secondary" onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} disabled={currentIndex === 0}>← Previous</Button>{currentIndex === attempt.questions.length - 1 ? <Button variant="danger" onClick={() => setConfirmOpen(true)}>Review & submit</Button> : <Button onClick={() => setCurrentIndex((index) => Math.min(attempt.questions.length - 1, index + 1))}>Next question →</Button>}</div></section></main>{confirmOpen && <ConfirmDialog title="Ready to submit?" onCancel={() => setConfirmOpen(false)} onConfirm={() => submit(false)} loading={submitLoading}><p>You have answered <strong>{answeredCount}</strong> of <strong>{attempt.questions.length}</strong> questions.</p><p>There are <strong>{Math.max(0, attempt.questions.length - answeredCount)}</strong> unanswered questions and <strong>{formatTime(remaining)}</strong> remaining.</p></ConfirmDialog>}</div>;
}

function formatTime(seconds) { return `${Math.floor(seconds / 60)}m ${seconds % 60}s`; }

