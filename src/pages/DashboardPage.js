import React, { useEffect, useState } from "react";
import API, { getWellnessProgress, getWellnessScore } from "../api";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

export default function DashboardPage() {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(null);
  const [progress, setProgress] = useState([]);
  const [generating, setGenerating] = useState(null);

  const token = localStorage.getItem("promptpal_token");
  const userId = localStorage.getItem("promptpal_userId");

  const latestProgress = progress.length > 0 ? progress[progress.length - 1] : null;
  const previousProgress = progress.length > 1 ? progress[progress.length - 2] : null;

  const chartData = progress.map((entry) => ({
    ...entry,
    dateLabel: entry?.createdAt
      ? new Date(entry.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      : "",
  }));

  const radarData = latestProgress
    ? [
        { subject: "Skin", value: latestProgress?.skinScore ?? 0 },
        { subject: "Hair", value: latestProgress?.hairScore ?? 0 },
        { subject: "Sleep", value: latestProgress?.sleepScore ?? 0 },
        { subject: "Diet", value: latestProgress?.dietScore ?? 0 },
        { subject: "Exercise", value: latestProgress?.exerciseScore ?? 0 },
      ]
    : [];

  const improvement =
    latestProgress && previousProgress
      ? (Number(latestProgress?.totalScore) || 0) - (Number(previousProgress?.totalScore) || 0)
      : null;

  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

  useEffect(() => {
    if (!userId) return;
    async function loadData() {
      try {
        const scoreRes = await getWellnessScore(userId);
        setScore(scoreRes.data);
        const progressRes = await getWellnessProgress(userId);
        setProgress(progressRes.data);
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      }
    }
    loadData();
  }, [userId]);

  useEffect(() => {
    if (!token) return;
    API.get("/api/wellness/history", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setResults(Array.isArray(res.data) ? res.data : []);
        setMessage("");
      })
      .catch((err) => {
        console.error("Error loading advice history:", err);
        setMessage("Error loading advice history.");
      });
  }, [token]);

  const generateAdvice = async (adviceType) => {
    setGenerating(adviceType);
    setMessage("");
    try {
      const response = await fetch(
        `http://localhost:8080/api/wellness/generate?adviceType=${adviceType}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      navigate("/promptpal/result", {
        state: {
          advice: data?.aiResponse || "No advice generated.",
          accuracy: 90,
          adviceType: adviceType.toUpperCase(),
          resultId: data?.id || null,
        },
      });
    } catch (err) {
      setMessage("Failed to generate advice.");
    } finally {
      setGenerating(null);
    }
  };

  const scoreColor = (s) => {
    if (!s) return "#38bdf8";
    if (s >= 75) return "#4ade80";
    if (s >= 50) return "#facc15";
    return "#f87171";
  };

  const adviceCards = [
    {
      key: "skin",
      label: "Skin Advice",
      icon: "🌸",
      desc: "Personalized skincare routine",
      grad: "from-rose-500 to-pink-600",
      glow: "shadow-rose-500/30",
      bg: "from-rose-500/10 to-pink-500/5",
      border: "border-rose-400/20",
    },
    {
      key: "hair",
      label: "Hair Advice",
      icon: "✨",
      desc: "Hair health & growth plan",
      grad: "from-violet-500 to-indigo-600",
      glow: "shadow-violet-500/30",
      bg: "from-violet-500/10 to-indigo-500/5",
      border: "border-violet-400/20",
    },
    {
      key: "body",
      label: "Body Advice",
      icon: "💪",
      desc: "Fitness & nutrition plan",
      grad: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/30",
      bg: "from-emerald-500/10 to-teal-500/5",
      border: "border-emerald-400/20",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Background video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-30">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.92) 50%, rgba(7,34,55,0.97) 100%)" }} />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(56,189,248,0.07)" }} />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.07)" }} />

        <div className="relative z-10 min-h-screen px-4 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="fade-up" style={{ animationDelay: "0.01s" }}>
              <button
                onClick={handleBack}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12 hover:text-white"
              >
                ← Back
              </button>
            </div>

            {/* ── Header ── */}
            <div className="fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "white", letterSpacing: "-0.02em" }}>
                  Wellness Dashboard
                </h1>
                <p style={{ color: "rgba(148,163,184,0.9)", fontSize: 14, marginTop: 4 }}>
                  Your AI-powered health command center
                </p>
              </div>
              <button
                onClick={() => navigate("/choose-advice")}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", boxShadow: "0 8px 24px rgba(139,92,246,0.3)" }}
              >
                🎯 Advice Hub
              </button>
            </div>

            {/* ── Score Cards ── */}
            <div className="fade-up grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ animationDelay: "0.1s" }}>
              {[
                { label: "Wellness Score", val: score?.totalScore != null ? `${score.totalScore}/100` : "--", icon: "🏆", sub: "Overall health", color: "#4ade80" },
                { label: "Skin Score", val: score?.skinScore != null ? score.skinScore : "--", icon: "🌸", sub: "Skin health", color: "#f472b6" },
                { label: "Hair Score", val: score?.hairScore != null ? score.hairScore : "--", icon: "✨", sub: "Hair health", color: "#818cf8" },
                { label: "Sleep Score", val: score?.sleepScore != null ? score.sleepScore : "--", icon: "🌙", sub: "Rest quality", color: "#38bdf8" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-xs font-semibold rounded-full px-2 py-0.5" style={{ background: `${s.color}20`, color: s.color }}>
                      {s.sub}
                    </span>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Manrope', sans-serif" }}>{s.val}</p>
                  <p style={{ fontSize: 12, color: "rgba(148,163,184,0.7)", marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── Generate Advice Cards ── */}
            <div className="fade-up" style={{ animationDelay: "0.2s" }}>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "rgba(226,232,240,0.9)", marginBottom: 16 }}>
                Generate Personalized Advice
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {adviceCards.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => generateAdvice(c.key)}
                    disabled={!!generating}
                    className={`group relative rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 ${c.border} bg-gradient-to-br ${c.bg}`}
                    style={{ backdropFilter: "blur(8px)", opacity: generating && generating !== c.key ? 0.6 : 1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{c.icon}</span>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-r ${c.grad} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <span className="text-white text-xs font-bold">→</span>
                      </div>
                    </div>
                    <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15, color: "white" }}>{c.label}</h3>
                    <p style={{ fontSize: 12, color: "rgba(148,163,184,0.7)", marginTop: 4 }}>{c.desc}</p>
                    {generating === c.key && (
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(15,23,42,0.7)" }}>
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <span className="animate-spin">⏳</span> Generating...
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Full wellness */}
              <div className="mt-4">
                <button
                  onClick={() => generateAdvice("all")}
                  disabled={!!generating}
                  className="relative w-full rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 text-left transition-all hover:-translate-y-1"
                >
                  <span className="text-2xl">🌿</span>
                  <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14, color: "white", marginTop: 8 }}>Full Wellness Plan</h3>
                  <p style={{ fontSize: 12, color: "rgba(148,163,184,0.7)", marginTop: 2 }}>Skin + Hair + Body combined</p>
                  {generating === "all" && (
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(15,23,42,0.7)" }}>
                      <span className="text-sm font-semibold text-white animate-pulse">Generating...</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* ── Progress Chart ── */}
            <div className="fade-up rounded-2xl border border-white/10 p-6 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)", animationDelay: "0.3s" }}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "rgba(226,232,240,0.9)" }}>
                    📊 Wellness Progress
                  </h2>
                  <p style={{ fontSize: 12, color: "rgba(148,163,184,0.7)", marginTop: 4 }}>
                    Track your latest wellness trends across core metrics.
                  </p>
                </div>
                {improvement !== null && (
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold" style={{ color: improvement >= 0 ? "#4ade80" : "#f87171" }}>
                    {improvement >= 0 ? "📈" : "📉"} {improvement >= 0 ? "+" : ""}{improvement} points {improvement >= 0 ? "improvement" : "decline"}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4">
                {[
                  { label: "Overall Wellness", icon: "💪", value: latestProgress?.totalScore ?? 0, color: "#38bdf8" },
                  { label: "Skin", icon: "🌸", value: latestProgress?.skinScore ?? 0, color: "#f472b6" },
                  { label: "Hair", icon: "✨", value: latestProgress?.hairScore ?? 0, color: "#a78bfa" },
                  { label: "Sleep", icon: "🌙", value: latestProgress?.sleepScore ?? 0, color: "#34d399" },
                ].map((card) => (
                  <div key={card.label} className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xl">{card.icon}</span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `${card.color}20`, color: card.color }}>
                        Latest
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: card.color }}>
                      {Number(card.value) || 0}/100
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(148,163,184,0.75)", marginTop: 2 }}>{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 p-4 sm:p-5" style={{ background: "rgba(15,23,42,0.55)" }}>
                {progress.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="dateLabel"
                          stroke="rgba(148,163,184,0.55)"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke="rgba(148,163,184,0.55)"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                        />
                        <Tooltip
                          contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, fontSize: 12 }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value, name) => [`${Number(value) || 0}/100`, name]}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="totalScore" name="Total" stroke="#38bdf8" strokeWidth={4} activeDot={{ r: 8 }} dot={{ fill: "#38bdf8", r: 4 }} />
                        <Line type="monotone" dataKey="skinScore" name="Skin" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="hairScore" name="Hair" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="sleepScore" name="Sleep" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="dietScore" name="Diet" stroke="#facc15" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="exerciseScore" name="Exercise" stroke="#fb923c" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">
                    No wellness data available yet.
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 p-4 sm:p-5" style={{ background: "rgba(15,23,42,0.55)" }}>
                <div className="mb-4">
                  <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15, color: "rgba(226,232,240,0.9)" }}>
                    Wellness Balance
                  </h3>
                  <p style={{ fontSize: 12, color: "rgba(148,163,184,0.7)", marginTop: 4 }}>
                    Balanced view of your latest wellness areas.
                  </p>
                </div>
                {radarData.length > 0 ? (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(148,163,184,0.15)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(226,232,240,0.85)", fontSize: 12 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 10 }} axisLine={false} />
                        <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.5} strokeWidth={2} />
                        <Tooltip
                          contentStyle={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, fontSize: 12 }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value) => [`${Number(value) || 0}/100`, "Score"]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[320px] items-center justify-center text-sm text-slate-400">
                    No wellness data available yet.
                  </div>
                )}
              </div>
            </div>

            {/* ── Error ── */}
            {message && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {message}
              </div>
            )}

            {/* ── Recent History ── */}
            {results.length > 0 && (
              <div className="fade-up" style={{ animationDelay: "0.4s" }}>
                <div className="mb-4">
                  <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: "rgba(226,232,240,0.9)" }}>
                    🕒 Recent AI Wellness Plans
                  </h2>
                </div>
                <div className="space-y-3">
                  {results.slice(0, 3).map((r, i) => (
                    <div
                      key={r.id || i}
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4 backdrop-blur-sm"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {r.adviceType === "SKIN" ? "🌸" : r.adviceType === "HAIR" ? "✨" : r.adviceType === "BODY" ? "💪" : "🌿"}
                        </span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{r.adviceType} Advice</p>
                          <p style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>
                            {r.generationTime ? new Date(r.generationTime).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/promptpal/result", { state: { advice: r.aiResponse, accuracy: r.accuracyScore || 85, adviceType: r.adviceType, resultId: r.id } })}
                        className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                      >
                        Open →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
