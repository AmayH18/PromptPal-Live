import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfilePage from "./pages/EditProfilePage";
import ChooseAdvicePage from "./pages/ChooseAdvicePage";
import PromptPal from "./pages/PromptPal";
import PromptPalResultPage from "./pages/PromptPalResultPage";
import LandingPage from "./pages/LandingPage";
import { clearProfileCache } from "./pages/ProfilePage";

// ✅ Decode JWT and check expiry without any library
function isTokenValid() {
  const token = localStorage.getItem("promptpal_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
}

// ✅ Clear ALL auth data on app startup (development mode)
// This ensures a fresh state when restarting the app
localStorage.removeItem("promptpal_token");
localStorage.removeItem("promptpal_userId");
clearProfileCache();

function getToken() {
  return localStorage.getItem("promptpal_token");
}

function logout() {
  clearProfileCache();
  localStorage.removeItem("promptpal_token");
  localStorage.removeItem("promptpal_userId");
  window.location.href = "/login";
}

export default function App() {
  const isAuthenticated = !!getToken();

  return (
    <Router>
      <div className="min-h-screen bg-[#fcf8ff] text-[#1c1a24]" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* Google Fonts */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

        {/* Header - Only show for authenticated users */}
        {isAuthenticated && (
          <header className="sticky top-0 z-40 border-b border-[#e9e5ff] bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-[1rem] border border-black/20 bg-gradient-to-br from-[#4112d0] via-[#5a3be7] to-[#818cf8] p-[2px] shadow-[0_12px_28px_rgba(90,59,231,0.24)]">
                  <div className="flex h-full w-full items-center justify-center rounded-[0.8rem] bg-white">
                    <img
                      src="/promptpal_logo.png"
                      alt="Promptpal logo"
                      className="h-6 w-6 rounded-lg object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, color: '#4112d0', letterSpacing: '-0.01em' }}>
                  Promptpal:Personalized Skin,Hair and Body Wellness
                </span>
              </Link>

              {/* Nav */}
              <nav className="flex items-center gap-1">
                <Link
                  to="/profile"
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#474555] transition hover:bg-[#f1ecfa] hover:text-[#4112d0]"
                >
                  Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#474555] transition hover:bg-[#f1ecfa] hover:text-[#4112d0]"
                >
                  Dashboard
                </Link>
                <Link
                  to="/choose-advice"
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#474555] transition hover:bg-[#f1ecfa] hover:text-[#4112d0]"
                >
                  Get Advice
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full border border-[#e9e5ff] px-4 py-2 text-sm font-medium text-[#474555] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Logout
                </button>
              </nav>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="p-0">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />
              }
            />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/choose-advice"
              element={
                <ProtectedRoute>
                  <ChooseAdvicePage />
                </ProtectedRoute>
              }
            />
            <Route path="/promptpal" element={<PromptPal />} />
            <Route
              path="/promptpal/result"
              element={
                <ProtectedRoute>
                  <PromptPalResultPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Footer - Only show for authenticated users */}
        {isAuthenticated && (
          <footer className="border-t border-[#e9e5ff] py-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-md border border-black/20 bg-gradient-to-br from-[#4112d0] to-[#818cf8] p-[1px] shadow-[0_8px_16px_rgba(90,59,231,0.18)]">
                <div className="flex h-full w-full items-center justify-center rounded-[0.45rem] bg-white">
                  <img
                    src="/promptpal_logo.png"
                    alt="Promptpal logo"
                    className="h-4 w-4 rounded-md object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: '#4112d0' }}>
                Promptpal:Personalized Skin,Hair and Body Wellness
              </span>
            </div>
            <p className="text-xs text-[#787587]">
              © {new Date().getFullYear()} PromptPal — Personalized Skin, Hair & Body Wellness
            </p>
          </footer>
        )}
      </div>
    </Router>
  );
}