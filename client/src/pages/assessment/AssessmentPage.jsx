import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi, getErrorMessage } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import FormMessage from '../../components/FormMessage.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function AssessmentPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [screen, setScreen] = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function loadStatus() {
    setLoading(true); setError('');
    try {
      const response = await assessmentApi.status();
      const data = response.data;
      setStatus(data);
      if (data.completed) { setScreen('final'); setResult(data.latestResult ? { assignedLevel: data.assignedLevel, passedLevels: data.passedLevels, score: data.latestResult.percentage, correctAnswers: data.latestResult.correctAnswers, totalQuestions: data.latestResult.totalQuestions, passingThreshold: 90, phase: 'final' } : null); }
      else if (data.attempt) { setAttempt(data.attempt); setAnswers(Object.fromEntries(data.attempt.answers.map((answer) => [String(answer.questionId), answer.selectedOption]))); setScreen('question'); }
      else setScreen('intro');
    } catch (loadError) { setError(getErrorMessage(loadError)); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadStatus(); }, []);

  async function start() {
    setActionLoading(true); setError('');
    try {
      const response = await assessmentApi.start();
      const nextAttempt = response.data.attempt;
      setAttempt(nextAttempt); setAnswers(Object.fromEntries(nextAttempt.answers.map((answer) => [String(answer.questionId), answer.selectedOption]))); setCurrentIndex(0); setScreen('question');
    } catch (startError) { setError(getErrorMessage(startError)); }
    finally { setActionLoading(false); }
  }

  async function chooseAnswer(optionIndex) {
    if (!attempt) return;
    const question = attempt.questions[currentIndex];
    setAnswers((current) => ({ ...current, [String(question.id)]: optionIndex }));
    try { await assessmentApi.answer(attempt.id, { questionId: question.id, selectedOption: optionIndex }); }
    catch (answerError) { setError(getErrorMessage(answerError)); }
  }

  async function submitLevel() {
    setActionLoading(true); setError(''); setConfirmOpen(false);
    try {
      const response = await assessmentApi.submit(attempt.id);
      setResult(response.data); setScreen(response.data.phase === 'passed' ? 'passed' : response.data.phase === 'failed' ? 'failed' : 'final');
      if (response.data.phase !== 'passed') await refreshUser();
    } catch (submitError) { setError(getErrorMessage(submitError)); }
    finally { setActionLoading(false); }
  }

  async function continueAfterPassed() {
    await start();
  }

  async function continueToDashboard() {
    await refreshUser();
    navigate('/dashboard', { replace: true });
  }

  if (loading) return <LoadingState label="Preparing your assessment…" />;
  if (error && !status) return <ErrorState message={error} onRetry={loadStatus} />;

  return <div className="assessment-page page-stack">
    {screen === 'intro' && <AssessmentIntro level={status?.currentLevel || 'N5'} questionCount={status?.questionCount || 'Level-based'} loading={actionLoading} onStart={start} error={error} />}
    {screen === 'question' && attempt && <AssessmentQuestionView attempt={attempt} currentIndex={currentIndex} answers={answers} onChoose={chooseAnswer} onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))} onNext={() => setCurrentIndex((index) => Math.min(attempt.questions.length - 1, index + 1))} onJump={setCurrentIndex} onSubmit={() => setConfirmOpen(true)} error={error} />}
    {screen === 'passed' && <AssessmentPassed result={result} loading={actionLoading} onContinue={continueAfterPassed} />}
    {screen === 'failed' && <AssessmentFailed result={result} onContinue={continueToDashboard} />}
    {screen === 'final' && <AssessmentFinal result={result} onContinue={continueToDashboard} />}
    {confirmOpen && <ConfirmDialog title="Review before you submit" confirmLabel="Submit assessment" onCancel={() => setConfirmOpen(false)} onConfirm={submitLevel} loading={actionLoading}><p>You have answered <strong>{Object.values(answers).filter((value) => value !== null && value !== undefined).length}</strong> of <strong>{attempt?.questions.length}</strong> questions.</p><p>Once submitted, this level will be scored and the assessment will either continue or finish.</p></ConfirmDialog>}
  </div>;
}

function AssessmentIntro({ level, questionCount, loading, onStart, error }) {
  return <div className="assessment-intro page-narrow"><div className="eyebrow">Level determination</div><h1>Find your starting point with confidence.</h1><p className="lead">A short assessment will guide you through the appropriate Japanese level. The system always begins at N5 and moves forward only when you pass.</p><div className="intro-grid"><div className="intro-fact"><span>Starting level</span><strong>{level}</strong><small>Begin here</small></div><div className="intro-fact"><span>Questions</span><strong>{questionCount}</strong><small>For this level</small></div><div className="intro-fact"><span>Estimated time</span><strong>20 min</strong><small>Take your time</small></div></div><div className="instruction-panel"><h3>Before you begin</h3><ul><li>Answer each question as carefully as you can.</li><li>You cannot manually skip to a higher level.</li><li>Your assigned level is controlled by your assessment performance.</li></ul></div><FormMessage>{error}</FormMessage><Button onClick={onStart} disabled={loading}>{loading ? 'Preparing assessment…' : 'Start assessment'} <span>→</span></Button></div>;
}

function AssessmentQuestionView({ attempt, currentIndex, answers, onChoose, onPrevious, onNext, onJump, onSubmit, error }) {
  const question = attempt.questions[currentIndex];
  const answeredCount = Object.values(answers).filter((value) => value !== null && value !== undefined).length;
  const progress = Math.round(((currentIndex + 1) / attempt.questions.length) * 100);
  return <div className="test-page page-narrow"><div className="test-topline"><div><span className="eyebrow">Level determination</span><h1>{attempt.level} assessment</h1></div><StatusBadge tone="blue">Sequential assessment</StatusBadge></div><div className="test-progress"><div><span>Question {currentIndex + 1} of {attempt.questions.length}</span><span>{progress}% complete</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div><div className="question-layout"><aside className="question-sidebar"><div className="question-sidebar-title"><span>Questions</span><strong>{answeredCount}/{attempt.questions.length}</strong></div><div className="question-nav-grid">{attempt.questions.map((item, index) => <button key={item.id} className={`${index === currentIndex ? 'current' : ''} ${answers[String(item.id)] !== undefined && answers[String(item.id)] !== null ? 'answered' : ''}`} onClick={() => onJump(index)}>{index + 1}</button>)}</div><div className="question-legend"><span><i className="legend-dot current-dot" />Current</span><span><i className="legend-dot answered-dot" />Answered</span><span><i className="legend-dot" />Unanswered</span></div></aside><section className="question-card"><div className="question-meta"><span>{question.section}</span><span>Question {currentIndex + 1}</span></div><h2>{question.prompt}</h2>{question.imageUrl && <img className="question-media" src={question.imageUrl} alt="Question reference" />}{question.audioUrl && <audio controls src={question.audioUrl} className="question-audio" />}{<div className="answer-list">{question.options.map((option, index) => <button key={option.text} className={`answer-option ${answers[String(question.id)] === index ? 'selected' : ''}`} onClick={() => onChoose(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option.text}</span><span className="answer-check">{answers[String(question.id)] === index ? '✓' : ''}</span></button>)}</div>}<FormMessage>{error}</FormMessage><div className="question-actions"><Button variant="secondary" onClick={onPrevious} disabled={currentIndex === 0}>← Previous</Button>{currentIndex === attempt.questions.length - 1 ? <Button variant="danger" onClick={onSubmit}>Review & submit</Button> : <Button onClick={onNext}>Next question →</Button>}</div></section></div></div>;
}

function ResultSummary({ result, label }) {
  return <div className="result-summary"><div className="result-orbit"><span>{result?.score ?? 0}<small>%</small></span></div><div><span className="eyebrow">{label}</span><h2>{result?.level || result?.assignedLevel} {result?.phase === 'passed' ? 'passed' : 'complete'}</h2><p>Passing threshold: <strong>{result?.passingThreshold ?? 90}%</strong></p></div></div>;
}

function AssessmentPassed({ result, loading, onContinue }) {
  return <div className="result-page page-narrow"><div className="result-panel result-success"><div className="result-mark">✓</div><ResultSummary result={result} label="Level passed" /><p className="result-description">You passed {result?.level} and can continue to the next level. Keep the same steady rhythm.</p><div className="next-level-callout"><span>Next level</span><strong>{result?.nextLevel}</strong></div><Button onClick={onContinue} disabled={loading}>{loading ? 'Loading next level…' : `Continue to ${result?.nextLevel}`} <span>→</span></Button></div></div>;
}

function AssessmentFailed({ result, onContinue }) {
  return <div className="result-page page-narrow"><div className="result-panel result-neutral"><div className="result-mark result-mark-muted">—</div><ResultSummary result={result} label="Assessment complete" /><p className="result-description">Your assigned level is based on the highest level successfully passed. Your learning space is ready.</p><div className="next-level-callout"><span>Assigned level</span><strong>{result?.assignedLevel}</strong></div><Button onClick={onContinue}>Continue to application <span>→</span></Button></div></div>;
}

function AssessmentFinal({ result, onContinue }) {
  return <div className="result-page page-narrow"><div className="result-panel result-success"><div className="result-mark">✓</div><ResultSummary result={result} label="Level determination complete" /><p className="result-description">Your learning space is now unlocked. Use your assigned level as your guide and build from there.</p><div className="final-details"><div><span>Passed levels</span><strong>{result?.passedLevels?.join(' · ') || '—'}</strong></div><div><span>Recommendation</span><strong>{result?.recommendation || 'Begin with your assigned level materials.'}</strong></div></div><Button onClick={onContinue}>Continue to dashboard <span>→</span></Button></div></div>;
}

