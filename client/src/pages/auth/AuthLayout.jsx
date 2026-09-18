import { Link } from "react-router-dom";

export default function AuthLayout({ children, footer }) {
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-scene-wrap">
          <img
            className="auth-scene"
            src="/images/login_page_image_of_boy.png"
            alt="Student studying Japanese at a desk"
          />
        </div>
        <div className="auth-slogan-wrap">
          <img
            className="auth-slogan"
            src="/images/login_page_master_japanese_image.png"
            alt="Master Japanese. One Mock at a Time."
          />
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <Link className="auth-logo-link" to="/">
            <img 
              className="auth-logo"
              src="/images/dream-education-logo-DnWAcGmn.png"
              alt="Dream Education Nepal"
            />
          </Link>
          {children}
          {footer}
        </div>
      </section>
    </div>
  );
}

export function GoogleButton() {
  const apiRoot = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return (
    <a className="google-button" href={`${apiRoot}/auth/google`}>
      <span className="google-mark">G</span>
      <span>Continue with Google</span>
    </a>
  );
}
