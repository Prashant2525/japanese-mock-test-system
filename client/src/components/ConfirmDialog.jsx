import Button from './Button.jsx';

export default function ConfirmDialog({ title, children, confirmLabel = 'Submit test', onConfirm, onCancel, loading = false }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="modal-topline" /><h2 id="confirm-title">{title}</h2><div className="modal-copy">{children}</div><div className="modal-actions"><Button variant="secondary" onClick={onCancel} disabled={loading}>Continue test</Button><Button variant="danger" onClick={onConfirm} disabled={loading}>{loading ? 'Submitting…' : confirmLabel}</Button></div></div></div>;
}

