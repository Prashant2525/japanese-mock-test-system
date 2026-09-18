import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout, { GoogleButton } from "./AuthLayout.jsx";
import FormMessage from "../../components/FormMessage.jsx";
import Button from "../../components/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function nextPath(user) {
  return user.levelDeterminationStatus === "completed"
    ? "/dashboard"
    : "/assessment";
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(
    location.search.includes("google_")
      ? "Google sign-in could not be completed."
      : "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login(form);
      navigate(nextPath(response.user), { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      footer={
        <p className="auth-footer">
          New to Dream Mock? <Link to="/register">Create account</Link>
        </p>
      }
    >
      <div className="auth-heading">
        <p className="eyebrow">Welcome back</p>
        <h1>
          Sign in to <span>Dream Mock.</span>
        </h1>
        <p>Pick up your Japanese learning journey where you left off.</p>
      </div>
      <FormMessage>{error}</FormMessage>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            placeholder="e.g example@gmail.com"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Please use your password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            autoComplete="current-password"
            required
          />
        </label>
        <div className="form-row-end">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
      <div className="auth-divider">
        <span>OR</span>
      </div>
      <GoogleButton />
    </AuthLayout>
  );
}
