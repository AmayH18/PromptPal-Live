import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/login", {
        username,
        password,
      });
      if (!res.data.token) {
        setMessage("❌ No token received from backend");
        return;
      }
      localStorage.setItem("promptpal_token", res.data.token);
      localStorage.setItem("promptpal_userId", res.data.userId);
      navigate("/profile");
    } catch (err) {
      console.error("Login failed:", err);
      setMessage("❌ Invalid username or password.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(65,18,208,0.72) 0%, rgba(28,26,36,0.60) 50%, rgba(90,59,231,0.65) 100%)' }} />
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(200,191,255,0.18)' }} />
      <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(90,59,231,0.22)' }} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid w-full max-w-[1100px] items-center gap-8 lg:grid-cols-2 lg:gap-12">

          {/* Left: Brand copy */}
          <section className="hidden lg:flex flex-col text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-black/25 bg-gradient-to-br from-white/30 via-white/15 to-white/5 p-[2px] shadow-[0_18px_45px_rgba(19,10,63,0.35)] backdrop-blur-sm">
                <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-[#f7f1ff]/95">
                  <img
                    src="/promptpal_logo.png"
                    alt="Promptpal logo"
                    className="h-10 w-10 rounded-[0.85rem] object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.01em' }}>
                Promptpal:Personalized Skin,Hair and Body Wellness
              </span>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm mb-6">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure & Private Login
            </div>

            <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 48, lineHeight: '56px', letterSpacing: '-0.02em' }}>
              Welcome Back To Your Wellness Hub
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/80 leading-relaxed">
              Log in to continue tracking your progress and get AI-powered recommendations tailored to your goals.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {["Secure Login", "Instant Insights", "Personalized Plans"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            
          </section>

          {/* Right: Login card */}
          <section className="w-full">
            <div
              className="overflow-hidden rounded-[1.5rem] border border-white/70 shadow-[0_24px_70px_rgba(17,24,39,0.16)]"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(233,229,255,0.8)',
                boxShadow: '0px 8px 40px rgba(90,59,231,0.14)',
              }}
            >
              {/* Card top band */}
              <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #4112d0, #5a3be7, #818cf8)' }} />

              <div className="px-6 py-6 sm:px-8 sm:py-8">
                {/* Logo on mobile */}
                <div className="flex items-center gap-2.5 mb-6 lg:hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/20 bg-gradient-to-br from-[#4112d0] via-[#5a3be7] to-[#818cf8] p-[2px] shadow-[0_10px_24px_rgba(90,59,231,0.28)]">
                    <div className="flex h-full w-full items-center justify-center rounded-[0.7rem] bg-white">
                      <img
                        src="/promptpal_logo.png"
                        alt="Promptpal logo"
                        className="h-6 w-6 rounded-lg object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: '#4112d0' }}>
                    Promptpal:Personalized Skin,Hair and Body Wellness
                  </span>
                </div>

                <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 28, color: '#1c1a24', letterSpacing: '-0.01em' }}>
                  Welcome back
                </h2>
                <p className="mt-1 text-sm text-[#787587]">
                  Sign in to continue your personalized wellness journey.
                </p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4 sm:space-y-5">
                  <div>
                    <label
                      className="block mb-1.5 uppercase tracking-wider text-[#787587]"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}
                    >
                      Username
                    </label>
                    <input
                      className="w-full h-12 rounded-xl border border-[#c9c4d8] bg-[#f7f1ff] px-4 text-[#1c1a24] outline-none transition placeholder:text-[#c9c4d8] focus:border-[#5a3be7] focus:ring-2 focus:ring-[#5a3be7]/20 focus:bg-white"
                      style={{ fontSize: 15 }}
                      type="text"
                      placeholder="your_username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block mb-1.5 uppercase tracking-wider text-[#787587]"
                      style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}
                    >
                      Password
                    </label>
                    <input
                      className="w-full h-12 rounded-xl border border-[#c9c4d8] bg-[#f7f1ff] px-4 text-[#1c1a24] outline-none transition placeholder:text-[#c9c4d8] focus:border-[#5a3be7] focus:ring-2 focus:ring-[#5a3be7]/20 focus:bg-white"
                      style={{ fontSize: 15 }}
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="w-full min-h-[3rem] rounded-[0.95rem] px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #4112d0, #5a3be7)', fontSize: 15, boxShadow: '0 4px 16px rgba(90,59,231,0.35)' }}
                    type="submit"
                  >
                    Log In
                  </button>
                </form>

                {message && (
                  <div
                    className="mt-4 rounded-xl px-4 py-3 text-sm text-center"
                    style={{
                      background: message.includes("❌") ? '#fff1f0' : '#f0fdf4',
                      color: message.includes("❌") ? '#ba1a1a' : '#166534',
                      border: `1px solid ${message.includes("❌") ? '#ffdad6' : '#bbf7d0'}`,
                    }}
                  >
                    {message}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[#474555]">
                    New here?{" "}
                    <Link
                      to="/signup"
                      className="font-semibold text-[#4112d0] underline underline-offset-4 hover:text-[#5a3be7]"
                    >
                      Create an account
                    </Link>
                  </p>
                  <Link
                    to="/forgot-password"
                    className="font-medium text-[#4112d0] underline underline-offset-4 hover:text-[#5a3be7]"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
