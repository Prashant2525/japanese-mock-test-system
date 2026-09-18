import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import Button from "../../components/Button.jsx";
import FormMessage from "../../components/FormMessage.jsx";
import { authApi, getErrorMessage } from "../../services/api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await authApi.forgotPassword({ email });
      setMessage(response.data.message);
      setResetToken(response.data.resetToken || "");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-heading">
        <p className="eyebrow">Account recovery</p>
        <h1>
          Reset your <span>password.</span>
        </h1>
        <p>Enter your email and we’ll prepare a secure reset link.</p>
      </div>
      <FormMessage>{error}</FormMessage>
      <FormMessage tone="success">{message}</FormMessage>
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            placeholder="e.g example@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <Button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Preparing…" : "Send reset link"}
        </Button>
      </form>
      {resetToken && (
        <div className="dev-reset-note">
          Development reset token ready.{" "}
          <Link to={`/reset-password?token=${resetToken}`}>
            Open reset page
          </Link>
        </div>
      )}
      <p className="auth-footer">
        <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
