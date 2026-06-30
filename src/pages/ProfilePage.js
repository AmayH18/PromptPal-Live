import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

let cachedProfile = null;
let profileRequestInFlight = null;

export function clearProfileCache() {
  cachedProfile = null;
  profileRequestInFlight = null;
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wellnessScore, setWellnessScore] = useState(null);
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/dashboard");
  };

  useEffect(() => {
    const token = localStorage.getItem("promptpal_token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (cachedProfile) {
      setUser(cachedProfile);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        if (!profileRequestInFlight) {
          profileRequestInFlight = API.get("/api/auth/profile")
            .then((res) => {
              cachedProfile = res.data;
              return res.data;
            })
            .finally(() => {
              profileRequestInFlight = null;
            });
        }

        const profile = await profileRequestInFlight;
        setUser(profile);

        try {
          const scoreRes = await API.get(`/dashboard/score/${profile.id}`);
          setWellnessScore(scoreRes.data);
        } catch (err) {
          console.error("Score fetch failed", err);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const Bg = () => (
    <>
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-25">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.92) 50%, rgba(7,34,55,0.97) 100%)" }} />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(56,189,248,0.06)" }} />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.06)" }} />
    </>
  );

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <Bg />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
            <span className="animate-spin text-xl">⏳</span>
            <span className="text-sm font-medium text-slate-300">Loading your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <Bg />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-6 py-4 text-rose-300 backdrop-blur-xl">
            Failed to load profile.
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Username", val: user.username, icon: "👤" },
    { label: "Email", val: user.email, icon: "📧" },
    { label: "Phone", val: user.phone || "Not set", icon: "📱" },
    { label: "Age", val: user.age ? `${user.age} yrs` : "Not set", icon: "🎂" },
    { label: "Height", val: user.height != null ? `${user.height} cm` : "Not set", icon: "📏" },
    { label: "Weight", val: user.weight != null ? `${user.weight} kg` : "Not set", icon: "⚖️" },
  ];

  const formatWellnessValue = (value) => {
    if (value == null || value === "") {
      return "Not set";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "string") {
      return value.replace(/_/g, " ").replace(/,(?!\s)/g, ", ");
    }

    return String(value);
  };

  const wellnessFields = [
    { label: "Skin Type", val: formatWellnessValue(user.skinType), icon: "🌸" },
    { label: "Hair Type", val: formatWellnessValue(user.hairType), icon: "✨" },
    { label: "Hair Goal", val: formatWellnessValue(user.hairGoals), icon: "🎯" },
    { label: "Hair Concerns", val: formatWellnessValue(user.hairConcerns), icon: "💭" },
    { label: "Skin Concerns", val: formatWellnessValue(user.skinConcerns), icon: "💭" },
    { label: "Body Goal", val: formatWellnessValue(user.bodyGoal), icon: "💪" },
    { label: "Allergies", val: formatWellnessValue(user.allergies || "None"), icon: "⚕️" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Bg />

        <div className="relative z-10 min-h-screen px-4 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="fade-up flex items-center justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "white", letterSpacing: "-0.02em" }}>
                  Your Profile
                </h1>
                <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 14, marginTop: 4 }}>
                  Manage your wellness details and preferences
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 sm:gap-3">
                <button
                  onClick={() => { clearProfileCache(); navigate("/edit-profile"); }}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", boxShadow: "0 6px 20px rgba(139,92,246,0.3)" }}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => navigate("/promptpal")}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #10b981, #0d9488)", boxShadow: "0 6px 20px rgba(16,185,129,0.3)" }}
                >
                  🤖 Generate Advice
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => {
                    clearProfileCache();
                    localStorage.removeItem("promptpal_token");
                    localStorage.removeItem("promptpal_userId");
                    navigate("/login");
                  }}
                  className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 sm:px-4"
                >
                  Logout
                </button>
                <button
                  onClick={goBack}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                >
                  ← Back
                </button>
              </div>
            </div>

            <div className="fade-up rounded-3xl border border-white/10 p-6 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)", animationDelay: "0.1s" }}>
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", boxShadow: "0 8px 24px rgba(139,92,246,0.4)" }}>
                  {user.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 20, color: "white" }}>{user.username}</p>
                  <p style={{ fontSize: 13, color: "rgba(148,163,184,0.7)" }}>{user.email}</p>
                </div>
              </div>
            </div>

            <div className="fade-up rounded-2xl border border-white/10 p-6 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)", animationDelay: "0.15s" }}>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(148,163,184,0.8)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>
                Basic Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {fields.map((f, i) => (
                  <div key={i} className="rounded-xl border border-white/8 bg-white/5 p-4">
                      <p style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginBottom: 4 }}>{f.icon} {f.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "white", overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'normal' }}>{f.val}</p>
                    </div>
                ))}
              </div>
            </div>

            <div className="fade-up rounded-2xl border border-white/10 p-6 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)", animationDelay: "0.2s" }}>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(148,163,184,0.8)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>
                Wellness Profile
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {wellnessFields.map((f, i) => (
                  <div key={i} className="flex h-full flex-col rounded-xl border border-white/8 bg-white/5 p-4">
                    <p style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginBottom: 4 }}>{f.icon} {f.label}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "white", overflowWrap: "anywhere", wordBreak: "break-word", whiteSpace: "normal", lineHeight: 1.5 }}>{f.val}</p>
                  </div>
                ))}
              </div>
              {user.dailyRoutine && (
                <div className="mt-4 rounded-xl border border-white/8 bg-white/5 p-4">
                  <p style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginBottom: 4 }}>📅 Daily Routine</p>
                  <p style={{ fontSize: 13, color: "rgba(226,232,240,0.85)", lineHeight: 1.6 }}>{user.dailyRoutine}</p>
                </div>
              )}
            </div>

            <div className="fade-up rounded-3xl border border-white/10 p-8 backdrop-blur-sm" style={{ background: "linear-gradient(135deg,#0f0f0f,#1a1a1a)", animationDelay: "0.25s" }}>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, color: "white", textAlign: "center", marginBottom: 30 }}>
                Wellness Score
              </h2>

              <div style={{ width: 150, height: 150, borderRadius: "50%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 900, color: "white", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", boxShadow: "0 0 40px rgba(168,85,247,0.4)" }}>
                {wellnessScore?.totalScore || 0}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8">
                <div className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Skin</p>
                  <h3 className="text-2xl font-bold text-white">{wellnessScore?.skinScore || 0}</h3>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Hair</p>
                  <h3 className="text-2xl font-bold text-white">{wellnessScore?.hairScore || 0}</h3>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Sleep</p>
                  <h3 className="text-2xl font-bold text-white">{wellnessScore?.sleepScore || 0}</h3>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Diet</p>
                  <h3 className="text-2xl font-bold text-white">{wellnessScore?.dietScore || 0}</h3>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-sm text-slate-400">Exercise</p>
                  <h3 className="text-2xl font-bold text-white">{wellnessScore?.exerciseScore || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
