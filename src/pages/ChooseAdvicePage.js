import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles, Feather, Dumbbell, Crown, ArrowLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import WellnessResultRenderer from "../components/WellnessResultRenderer";

const ADVICE_TYPES = [
  {
    key: "SKIN",
    label: "Skin Care",
    sub: "Cleansers · Serums · Sunscreen",
    Icon: Sparkles,
    grad: "from-rose-500/[0.18] via-fuchsia-500/[0.10] to-cyan-500/[0.06]",
    border: "border-white/[0.08]",
    accent: "#f9a8d4",
    accentRgb: "249,168,212",
    glow: "rgba(249,168,212,0.18)",
    activeBorder: "border-rose-300/50",
    activeBg: "from-rose-500/[0.22] via-fuchsia-500/[0.14] to-cyan-500/[0.08]",
    tag: "Luminosity Focus",
  },
  {
    key: "HAIR",
    label: "Hair Care",
    sub: "Growth · Thickness · Shine",
    Icon: Feather,
    grad: "from-violet-500/[0.18] via-indigo-500/[0.10] to-sky-500/[0.06]",
    border: "border-white/[0.08]",
    accent: "#c4b5fd",
    accentRgb: "196,181,253",
    glow: "rgba(196,181,253,0.18)",
    activeBorder: "border-violet-300/50",
    activeBg: "from-violet-500/[0.22] via-indigo-500/[0.14] to-sky-500/[0.08]",
    tag: "Vitality Focus",
  },
  {
    key: "BODY",
    label: "Body & Fitness",
    sub: "Nutrition · Workouts · Recovery",
    Icon: Dumbbell,
    grad: "from-emerald-500/[0.16] via-teal-500/[0.10] to-cyan-500/[0.06]",
    border: "border-white/[0.08]",
    accent: "#5eead4",
    accentRgb: "94,234,212",
    glow: "rgba(94,234,212,0.18)",
    activeBorder: "border-emerald-300/50",
    activeBg: "from-emerald-500/[0.22] via-teal-500/[0.14] to-cyan-500/[0.08]",
    tag: "Strength Focus",
  },
  {
    key: "ALL",
    label: "Full Wellness",
    sub: "Skin + Hair + Body combined",
    Icon: Crown,
    grad: "from-amber-500/[0.16] via-orange-500/[0.10] to-fuchsia-500/[0.06]",
    border: "border-white/[0.08]",
    accent: "#fbbf24",
    accentRgb: "251,191,36",
    glow: "rgba(251,191,36,0.16)",
    activeBorder: "border-amber-300/50",
    activeBg: "from-amber-500/[0.22] via-orange-500/[0.14] to-fuchsia-500/[0.08]",
    tag: "Complete Spectrum",
  },
];

/* ─── Advice Selection Card ─── */
function AdviceCard({ type, isSelected, isDisabled, isGenerating, onClick }) {
  const { Icon } = type;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`group relative isolate flex min-h-[210px] flex-col justify-between overflow-hidden rounded-[1.75rem] border text-left transition-all duration-300 focus:outline-none ${
        isSelected
          ? `bg-gradient-to-br ${type.activeBg} ${type.activeBorder} shadow-[0_28px_80px_-36px_var(--card-glow)]`
          : `bg-gradient-to-br ${type.grad} ${type.border} hover:-translate-y-[3px] hover:border-white/[0.18] hover:shadow-[0_28px_80px_-36px_var(--card-glow)]`
      } ${isDisabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
      style={{ "--card-glow": type.glow }}
    >
      {/* Sheen overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.09)_0%,transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_32%)] pointer-events-none" />
      {/* Accent glow orb */}
      <div
        className="absolute -right-4 -top-4 h-28 w-28 rounded-full blur-3xl opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-90"
        style={{ background: type.glow }}
      />

      {/* Top content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3">
          {/* Icon container */}
          <div
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[1.1rem] border transition-transform duration-300 group-hover:scale-[1.06]"
            style={{
              borderColor: `rgba(${type.accentRgb},0.22)`,
              background: `linear-gradient(135deg, rgba(${type.accentRgb},0.16), rgba(255,255,255,0.04))`,
            }}
          >
            {isGenerating ? (
              <Loader2 size={20} className="animate-spin" style={{ color: type.accent }} />
            ) : (
              <Icon size={20} strokeWidth={1.6} style={{ color: type.accent }} />
            )}
          </div>

          {/* Selected badge */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
              isSelected
                ? "border-white/30 bg-white/[0.14] text-white"
                : "border-white/[0.08] bg-black/[0.12] text-white/50"
            }`}
          >
            {isSelected && <CheckCircle2 size={10} strokeWidth={2.5} />}
            {isSelected ? "Selected" : "Select"}
          </div>
        </div>

        {/* Label & sub */}
        <div className="mt-7">
          <p
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: 15.5,
              color: "white",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {type.label}
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.6] text-white/55 max-w-[20ch]">
            {type.sub}
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="relative flex items-center justify-between border-t px-6 py-3.5"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: `rgba(${type.accentRgb},0.55)` }}
        >
          {type.tag}
        </span>
        <ChevronRight
          size={15}
          strokeWidth={2}
          className="transition-transform duration-300 group-hover:translate-x-1"
          style={{ color: type.accent, opacity: 0.7 }}
        />
      </div>

      {/* Generating overlay */}
      {isGenerating && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[1.75rem] backdrop-blur-sm"
          style={{ background: "rgba(5,10,18,0.76)" }}
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((d) => (
              <div
                key={d}
                className="h-1.5 w-1.5 rounded-full animate-bounce"
                style={{ backgroundColor: type.accent, animationDelay: `${d * 0.14}s` }}
              />
            ))}
          </div>
          <span className="text-[13px] font-medium" style={{ color: type.accent }}>
            Generating…
          </span>
        </div>
      )}
    </button>
  );
}

/* ─── History Card ─── */
function HistoryCard({ item, onOpen }) {
  const typeConf = ADVICE_TYPES.find((t) => t.key === item.adviceType) || ADVICE_TYPES[3];
  const { Icon } = typeConf;

  const formattedDate = item.generationTime
    ? new Date(item.generationTime).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.6rem] border bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[2px] hover:bg-white/[0.05] hover:border-white/[0.16] ${typeConf.border}`}
      style={{ boxShadow: `0 20px 60px -40px ${typeConf.glow}` }}
    >
      {/* Gradient wash */}
      <div className={`absolute inset-0 bg-gradient-to-br ${typeConf.grad} opacity-70 pointer-events-none`} />
      {/* Accent left stripe */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-full pointer-events-none"
        style={{ background: `linear-gradient(180deg, ${typeConf.accent}88, transparent 80%)` }}
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Icon + meta */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[0.95rem] border"
              style={{
                borderColor: `rgba(${typeConf.accentRgb},0.25)`,
                background: `linear-gradient(135deg, rgba(${typeConf.accentRgb},0.18), rgba(255,255,255,0.04))`,
              }}
            >
              <Icon size={17} strokeWidth={1.6} style={{ color: typeConf.accent }} />
            </div>
            <div className="min-w-0">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  borderColor: `rgba(${typeConf.accentRgb},0.28)`,
                  background: `rgba(${typeConf.accentRgb},0.10)`,
                  color: typeConf.accent,
                }}
              >
                {item.adviceType || "Wellness"}
              </span>
              {formattedDate && (
                <p className="mt-1.5 text-[11px] text-slate-400/60">{formattedDate}</p>
              )}
            </div>
          </div>

          {/* Open button */}
          <button
            onClick={onOpen}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.06] px-4 py-1.5 text-[12px] font-semibold text-white/75 transition duration-300 hover:border-white/25 hover:bg-white/[0.12] hover:text-white"
          >
            Open
            <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* Snippet preview */}
        <div
          className="mt-4 overflow-hidden rounded-[1.1rem] border bg-slate-950/25 p-4"
          style={{ borderColor: "rgba(255,255,255,0.06)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
        >
          <WellnessResultRenderer rawJson={item.aiResponse} adviceType={item.adviceType || "ALL"} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ChooseAdvicePage() {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };
  const { state } = useLocation();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generatingType, setGeneratingType] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("promptpal_token");

  const sessionResult = state?.advice
    ? {
        advice: state.advice,
        accuracy: Number.isFinite(state?.accuracy) ? state.accuracy : 85,
        adviceType: state.adviceType || "ALL",
      }
    : null;

  const loadHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`http://localhost:8080/api/wellness/history`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch history.");
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSelectType = (adviceKey) => {
    setSelectedType(selectedType === adviceKey ? null : adviceKey);
  };

  const handleGenerate = async () => {
    if (!token || !selectedType) return;
    setGeneratingType(selectedType);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:8080/api/wellness/generate?adviceType=${selectedType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      navigate("/promptpal/result", {
        state: {
          advice: data?.aiResponse || "No advice generated.",
          accuracy: data?.accuracyScore || 85,
          adviceType: selectedType,
          resultId: data?.id || null,
        },
      });
    } catch (err) {
      setError("Failed to generate advice. Please try again.");
    } finally {
      setGeneratingType(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slowFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%       { transform: translate3d(0, -12px, 0); }
        }
        .fade-up { animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* Subtle scanline texture on glass panels */
        .glass-panel {
          background: rgba(255,255,255,0.036);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
      `}</style>

      <div
        className="relative min-h-screen overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── Background Video ── */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
        >
          <source src="/background.mp4" type="video/mp4" />
        </video>

        {/* ── Dark overlay ── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(7,11,20,0.98) 0%, rgba(11,17,31,0.96) 42%, rgba(10,24,34,0.95) 100%)",
          }}
        />

        {/* ── Radial colour accents ── */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.07),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.07),transparent_30%),radial-gradient(circle_at_bottom_center,rgba(14,165,233,0.04),transparent_30%)]" />

        {/* ── Floating orbs ── */}
        <div
          className="absolute -left-44 top-20 h-[420px] w-[420px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(56,189,248,0.065)", animation: "slowFloat 13s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-40 bottom-8 h-[420px] w-[420px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(168,85,247,0.065)", animation: "slowFloat 16s ease-in-out infinite 2s" }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 min-h-screen px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:gap-12">

            <div className="fade-up flex justify-start" style={{ animationDelay: "0.01s" }}>
              <button
                onClick={handleBack}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12 hover:text-white"
              >
                ← Back
              </button>
            </div>

            {/* ── Hero Header ── */}
            <div
              className="fade-up grid place-items-center text-center"
              style={{ animationDelay: "0.02s" }}
            >
              <div className="relative inline-flex flex-col items-center">
                {/* Logo halo */}
                <div className="absolute inset-0 -z-10 translate-y-5 scale-125 rounded-full bg-cyan-400/[0.09] blur-3xl" />

                {/* Logo mark */}
                <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[1.4rem] border border-white/[0.10] bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950 p-[2px] shadow-[0_20px_56px_rgba(15,23,42,0.5)]">
                  <div className="flex h-full w-full items-center justify-center rounded-[1.2rem] bg-white/[0.97]">
                    <img
                      src="/promptpal_logo.png"
                      alt="PromptPal"
                      className="h-9 w-9 rounded-lg object-contain"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="mt-6 space-y-3.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.38em] text-slate-300/50">
                    PromptPal Advice Hub
                  </p>
                  <h1
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(28px, 4vw, 36px)",
                      color: "white",
                      letterSpacing: "-0.04em",
                      lineHeight: 1.07,
                    }}
                  >
                    Curated wellness,{" "}
                    <span
                      style={{
                        background: "linear-gradient(90deg, #c4b5fd, #f9a8d4)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      elegantly chosen.
                    </span>
                  </h1>
                  <p className="mx-auto max-w-xl text-[13.5px] leading-[1.75] text-slate-300/60">
                    Select your wellness focus, then generate a personalized plan. Choose one
                    category for a focused, in-depth result.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Selection Panel ── */}
            <div
              className="fade-up glass-panel rounded-[2rem] border border-white/[0.08] px-5 py-5 shadow-[0_32px_100px_-60px_rgba(0,0,0,0.85)] sm:px-7 sm:py-6"
              style={{ animationDelay: "0.09s" }}
            >
              {/* Panel header row */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-lg">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.3em] text-slate-300/45">
                    Generate a new plan
                  </p>
                  <p className="mt-2 text-[13.5px] leading-[1.65] text-slate-300/60">
                    Click a card to select it, then hit{" "}
                    <span className="font-semibold text-white/80">Generate Advice</span> to create
                    your personalised wellness plan.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() =>
                      navigate(sessionResult ? "/promptpal/result" : "/dashboard", {
                        state: sessionResult || undefined,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.05] px-4 py-2.5 text-[13px] font-semibold text-slate-300 transition duration-300 hover:border-white/[0.20] hover:bg-white/[0.10] hover:text-white"
                  >
                    <ArrowLeft size={14} strokeWidth={2.2} />
                    Back
                  </button>

                  <button
                    onClick={handleGenerate}
                    disabled={!selectedType || generatingType !== null}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.09] px-5 py-2.5 text-[13px] font-semibold text-white transition duration-300 hover:border-white/30 hover:bg-white/[0.15] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {generatingType ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Generating…
                      </>
                    ) : (
                      "Generate Advice"
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.09] px-4 py-3 text-[13px] text-rose-200">
                  {error}
                </div>
              )}

              {/* ── Cards grid ── */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {ADVICE_TYPES.map((type, i) => (
                  <div
                    key={type.key}
                    className="fade-up"
                    style={{ animationDelay: `${0.13 + i * 0.07}s` }}
                  >
                    <AdviceCard
                      type={type}
                      isSelected={selectedType === type.key}
                      isDisabled={generatingType !== null}
                      isGenerating={generatingType === type.key}
                      onClick={() => handleSelectType(type.key)}
                    />
                  </div>
                ))}
              </div>

              {/* ── Selection status strip ── */}
              <div
                className="mt-6 flex items-center justify-between rounded-[1.4rem] border px-5 py-3.5"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full transition-colors duration-300"
                    style={{
                      background: selectedType
                        ? (ADVICE_TYPES.find((t) => t.key === selectedType)?.accent ?? "#fff")
                        : "rgba(255,255,255,0.2)",
                    }}
                  />
                  <p className="text-[12.5px] text-slate-300/65">
                    {selectedType
                      ? `${ADVICE_TYPES.find((t) => t.key === selectedType)?.label} selected`
                      : "No category selected"}
                  </p>
                </div>
                <p className="hidden text-[11px] text-slate-300/40 sm:block">
                  One category · Focused deep-dive result
                </p>
              </div>
            </div>

            {/* ── History Section ── */}
            <div className="fade-up" style={{ animationDelay: "0.26s" }}>
              {/* Section divider */}
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "rgba(148,163,184,0.48)",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                  }}
                >
                  Your History
                </span>
                {!loadingHistory && history.length > 0 && (
                  <span className="rounded-full border border-white/[0.10] bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-slate-200/70">
                    {history.length} {history.length === 1 ? "session" : "sessions"}
                  </span>
                )}
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
              </div>

              {/* States */}
              {loadingHistory ? (
                <div className="flex items-center justify-center gap-3 rounded-[1.7rem] border border-white/[0.07] glass-panel py-20">
                  <Loader2 size={18} className="animate-spin text-slate-400/60" />
                  <span style={{ color: "rgba(148,163,184,0.58)", fontSize: 14 }}>
                    Loading history…
                  </span>
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-[1.9rem] border border-white/[0.07] glass-panel py-24 text-center">
                  <div
                    className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.1rem] border"
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <Sparkles size={22} strokeWidth={1.5} className="text-slate-400/50" />
                  </div>
                  <p
                    style={{
                      fontSize: 15.5,
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 600,
                      color: "rgba(226,232,240,0.65)",
                      marginBottom: 8,
                    }}
                  >
                    No advice generated yet
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(148,163,184,0.48)" }}>
                    Pick a category above to create your first wellness plan.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {history.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="fade-up"
                      style={{ animationDelay: `${0.32 + i * 0.07}s` }}
                    >
                      <HistoryCard
                        item={item}
                        onOpen={() =>
                          navigate("/promptpal/result", {
                            state: {
                              advice: item.aiResponse || "",
                              accuracy: Number.isFinite(item?.accuracyScore)
                                ? item.accuracyScore
                                : 85,
                              adviceType: item.adviceType || "ALL",
                              resultId: item.id || null,
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
