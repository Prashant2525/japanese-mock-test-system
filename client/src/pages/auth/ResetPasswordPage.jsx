import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import Button from "../../components/Button.jsx";
import FormMessage from "../../components/FormMessage.jsx";
import { authApi, getErrorMessage } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ResetPasswordPage() {
  const token = new URLSearchParams(useLocation().search).get("token") || "";
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      await refreshUser();
      navigate("/dashboard", { replace: true });
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
          Choose a new <span>password.</span>
        </h1>
        <p>Use at least 8 characters for your new password.</p>
      </div>
      <FormMessage>{error}</FormMessage>
      <form className="auth-form" onSubmit={submit}>
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <Button
          type="submit"
          className="auth-submit"
          disabled={loading || !token}
        >
          {loading ? "Saving…" : "Reset password"}
        </Button>
      </form>
      {!token && <FormMessage>No reset token was provided.</FormMessage>}
      <p className="auth-footer">
        <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
