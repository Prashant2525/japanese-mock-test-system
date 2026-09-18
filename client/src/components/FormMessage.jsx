export default function FormMessage({ children, tone = 'error' }) {
  if (!children) return null;
  return <div className={`form-message form-message-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>;
}

