import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingState from "../../components/LoadingState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AuthCallbackPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    refreshUser()
      .then((user) =>
        navigate(
          user?.levelDeterminationStatus === "completed"
            ? "/dashboard"
            : "/assessment",
          { replace: true },
        ),
      )
      .catch(() => navigate("/login?error=google_failed", { replace: true }));
  }, [navigate, refreshUser]);
  return <LoadingState label="Completing Google sign-in…" />;
}
