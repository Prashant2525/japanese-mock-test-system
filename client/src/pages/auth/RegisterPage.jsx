import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout, { GoogleButton } from "./AuthLayout.jsx";
import FormMessage from "../../components/FormMessage.jsx";
import Button from "../../components/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/assessment", { replace: true });
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
          Already have an account? <Link to="/login">Login</Link>
        </p>
      }
    >
      <div className="auth-heading registration-heading">
        <h1>
          <span>Create</span> Account
        </h1>
      </div>
      <FormMessage>{error}</FormMessage>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Fullname
          <input
            type="text"
            placeholder="e.g Balen Shah"
            value={form.fullName}
            onChange={(event) =>
              setForm({ ...form, fullName: event.target.value })
            }
            autoComplete="name"
            required
          />
        </label>
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
            placeholder="Please use strong password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <Button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Creating account…" : "Sign Up"}
        </Button>
      </form>
      <div className="auth-divider">
        <span>OR</span>
      </div>
      <GoogleButton />
    </AuthLayout>
  );
}
