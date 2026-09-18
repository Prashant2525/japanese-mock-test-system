import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import LoadingState from "./components/LoadingState.jsx";
import {
  CompletedLevelRoute,
  ProtectedRoute,
} from "./components/ProtectedRoute.jsx";
import AppShell from "./components/AppShell.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage.jsx";
import AssessmentPage from "./pages/assessment/AssessmentPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CoursesPage from "./pages/courses/CoursesPage.jsx";
import CourseDetailPage from "./pages/courses/CourseDetailPage.jsx";
import LessonDetailPage from "./pages/courses/LessonDetailPage.jsx";
import MockTestsPage from "./pages/mocks/MockTestsPage.jsx";
import MockTestDetailPage from "./pages/mocks/MockTestDetailPage.jsx";
import MockTestSessionPage from "./pages/mocks/MockTestSessionPage.jsx";
import ResultsPage from "./pages/results/ResultsPage.jsx";
import ResultDetailPage from "./pages/results/ResultDetailPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={
        user.levelDeterminationStatus === "completed"
          ? "/dashboard"
          : "/assessment"
      }
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route element={<CompletedLevelRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route
              path="/courses/:courseId/lessons/:lessonId"
              element={<LessonDetailPage />}
            />
            <Route path="/mock-tests" element={<MockTestsPage />} />
            <Route
              path="/mock-tests/:testId"
              element={<MockTestDetailPage />}
            />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/results/:attemptId" element={<ResultDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route
            path="/mock-tests/session/:attemptId"
            element={<MockTestSessionPage />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
