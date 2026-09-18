import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="not-found-page"><span className="eyebrow">404</span><h1>That page is not part of this path.</h1><p>Return to your learning space and continue from there.</p><Link className="button button-primary" to="/dashboard">Back to dashboard</Link></div>;
}

