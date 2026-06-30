import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Sparkles, Feather, Dumbbell, Crown, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

const ADVICE_TYPES = [
  {
    key: "skin",
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
    key: "hair",
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
    key: "body",
    label: "Body Wellness",
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
    key: "all",
    label: "Complete Wellness",
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

function AdviceCard({ item, checked, disabled, loading, hasActiveJourney, activeJourney, onToggle, onContinue }) {
  const { Icon } = item;

  const handleClick = () => {
    if (hasActiveJourney) {
      onContinue();
      return;
    }
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`group relative isolate flex min-h-[210px] flex-col justify-between overflow-hidden rounded-[1.75rem] border text-left transition-all duration-300 focus:outline-none ${
        checked
          ? `bg-gradient-to-br ${item.activeBg} ${item.activeBorder} shadow-[0_28px_80px_-36px_var(--card-glow)]`
          : `bg-gradient-to-br ${item.grad} ${item.border} hover:-translate-y-[3px] hover:border-white/[0.18] hover:shadow-[0_28px_80px_-36px_var(--card-glow)]`
      } ${disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
      style={{ "--card-glow": item.glow }}
    >
      {/* Sheen overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.09)_0%,transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_32%)] pointer-events-none" />
      {/* Accent glow orb */}
      <div
        className="absolute -right-4 -top-4 h-28 w-28 rounded-full blur-3xl opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-90"
        style={{ background: item.glow }}
      />

      {/* Top content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3">
          {/* Icon container */}
          <div
            className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[1.1rem] border transition-transform duration-300 group-hover:scale-[1.06]"
            style={{
              borderColor: `rgba(${item.accentRgb},0.22)`,
              background: `linear-gradient(135deg, rgba(${item.accentRgb},0.16), rgba(255,255,255,0.04))`,
            }}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" style={{ color: item.accent }} />
            ) : (
              <Icon size={20} strokeWidth={1.6} style={{ color: item.accent }} />
            )}
          </div>

          {/* Selected badge */}
          <div className="flex flex-col items-end gap-2">
            {hasActiveJourney && (
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/12 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Active
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                checked
                  ? "border-white/30 bg-white/[0.14] text-white"
                  : "border-white/[0.08] bg-black/[0.12] text-white/50"
              }`}
            >
              {checked && <CheckCircle2 size={10} strokeWidth={2.5} />}
              {hasActiveJourney ? "Continue" : checked ? "Selected" : "Select"}
            </div>
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
            {item.label}
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.6] text-white/55 max-w-[20ch]">
            {item.sub}
          </p>

          {hasActiveJourney && (
            <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/[0.16] p-3 text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-300/80">
                <span>Day {Number(activeJourney?.currentDayNumber ?? activeJourney?.currentDay ?? activeJourney?.dayNumber ?? 1)} of 21</span>
                <span>{Math.min(100, Math.max(0, Math.round(((Number(activeJourney?.currentDayNumber ?? activeJourney?.currentDay ?? activeJourney?.dayNumber ?? 1) / 21) * 100))))}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, (Number(activeJourney?.currentDayNumber ?? activeJourney?.currentDay ?? activeJourney?.dayNumber ?? 1) / 21) * 100))}%`,
                    background: "linear-gradient(90deg, #38bdf8, #a78bfa)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="relative flex items-center justify-between border-t px-6 py-3.5"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: `rgba(${item.accentRgb},0.55)` }}
        >
          {hasActiveJourney ? "Continue" : item.tag}
        </span>
        <ChevronRight
          size={15}
          strokeWidth={2}
          className="transition-transform duration-300 group-hover:translate-x-1"
          style={{ color: item.accent, opacity: 0.7 }}
        />
      </div>

    </button>
  );
}

export default function PromptPal() {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };
  const [selectedType, setSelectedType] = useState("skin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeJourneys, setActiveJourneys] = useState([]);

  const userId = localStorage.getItem("promptpal_userId");
  const token = localStorage.getItem("promptpal_token");

  const isInvalidSelection = !selectedType;

  const normalizeAdviceType = (value = "") => {
    const normalized = String(value).toLowerCase();
    if (["skin", "skincare", "skin care"].includes(normalized)) return "skin";
    if (["hair", "haircare", "hair care"].includes(normalized)) return "hair";
    if (["body", "body wellness", "bodywellness"].includes(normalized)) return "body";
    if (["all", "full", "full wellness", "complete", "complete wellness", "all wellness"].includes(normalized)) return "all";
    return normalized;
  };

  const getActiveJourneyForType = (typeKey) => {
    const normalizedType = normalizeAdviceType(typeKey);
    return activeJourneys.find((journey) => normalizeAdviceType(journey.adviceType || journey.type) === normalizedType) || null;
  };

  useEffect(() => {
    const fetchActiveJourneys = async () => {
      if (!userId || !token) return;

      try {
        const response = await API.get("/api/tracking/active-journeys", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        const journeys = Array.isArray(data)
          ? data
          : Array.isArray(data?.activeJourneys)
          ? data.activeJourneys
          : [];

        setActiveJourneys(journeys);
      } catch (err) {
        console.error(err);
        setActiveJourneys([]);
      }
    };

    fetchActiveJourneys();
  }, [token, userId]);

  const handleChange = (key) => {
    setSelectedType(key);
  };

  const generateAdvice = async () => {
    setLoading(true);
    setError("");

    if (!userId || !token) {
      setError("User session not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const adviceType = selectedType;

      const response = await API.post(
        `/api/wellness/generate?adviceType=${adviceType}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      navigate("/promptpal/result", {
        state: {
          advice: data?.aiResponse || "No advice generated.",
          accuracy: 90,
          adviceType: adviceType.toUpperCase(),
          resultId: data?.id || null,
        },
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI advice.");
    } finally {
      setLoading(false);
    }
  };

  const previewLabel =
    selectedType === "skin"
      ? "Skin Care"
      : selectedType === "hair"
      ? "Hair Care"
      : selectedType === "body"
      ? "Body Wellness"
      : "Complete Wellness";

  const activeAccent =
    selectedType === "skin"
      ? ADVICE_TYPES[0].accent
      : selectedType === "hair"
      ? ADVICE_TYPES[1].accent
      : selectedType === "body"
      ? ADVICE_TYPES[2].accent
      : ADVICE_TYPES[3].accent;

  const getTrackingAdviceType = (value = "") => {
    switch (normalizeAdviceType(value)) {
      case "skin":
        return "SKIN";
      case "hair":
        return "HAIR";
      case "body":
        return "BODY";
      case "all":
      default:
        return "ALL";
    }
  };

  const handleContinueJourney = (cardKeyOrJourney) => {
    const journey = typeof cardKeyOrJourney === "object" ? cardKeyOrJourney : getActiveJourneyForType(cardKeyOrJourney);
    const adviceType = getTrackingAdviceType(
      typeof cardKeyOrJourney === "object"
        ? journey?.adviceType || journey?.type || cardKeyOrJourney?.key || "ALL"
        : cardKeyOrJourney
    );

    navigate("/promptpal/result", {
      state: {
        advice: "",
        adviceType,
        resultId: journey?.userResultId || journey?.resultId || journey?.id || null,
        fromContinueJourney: true,
      },
    });
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
        .glass-panel {
          background: rgba(255,255,255,0.036);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.7; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        @keyframes progressShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .glass-surface {
          background: linear-gradient(135deg, rgba(255,255,255,0.085), rgba(255,255,255,0.03));
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 24px 80px -36px rgba(2, 8, 23, 0.95);
        }
        .card-hover-rise {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .card-hover-rise:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 70px -35px rgba(15, 23, 42, 0.9);
        }
        .loading-pulse {
          animation: loadingPulse 1.2s ease-in-out infinite;
        }
        .progress-fill {
          background-size: 220% 100%;
          animation: progressShimmer 2.3s linear infinite;
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
        <div className="relative z-10 min-h-screen px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
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
              <div className="glass-surface relative inline-flex flex-col items-center rounded-[2rem] border border-white/[0.10] px-6 py-8 shadow-[0_24px_90px_-38px_rgba(0,0,0,0.9)] sm:px-10 sm:py-10">
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
                  <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-200/90">
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    PromptPal Advice Hub
                  </div>
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
                  <p className="mx-auto max-w-xl text-[13.5px] leading-[1.75] text-slate-300/70">
                    Select one wellness area or choose Complete Wellness for all three combined. Your personalised plan awaits.
                  </p>
                </div>
              </div>
            </div>

            {activeJourneys.length > 0 && (
              <div
                className="fade-up glass-surface rounded-[2rem] border border-white/[0.10] px-5 py-6 shadow-[0_32px_100px_-60px_rgba(0,0,0,0.85)] sm:px-7 sm:py-7"
                style={{ animationDelay: "0.07s" }}
              >
                <div className="max-w-2xl">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-slate-300/50">
                    Continue Your Wellness Journey
                  </p>
                  <h2 className="mt-2 text-[20px] font-semibold text-white sm:text-[22px]">
                    Resume your active wellness journey from where you left off.
                  </h2>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {activeJourneys.map((journey, index) => {
                    const adviceType = (journey.adviceType || journey.type || "").toLowerCase();
                    const currentDay = journey.currentDayNumber ?? journey.currentDay ?? journey.dayNumber ?? 1;
                    const progressPercent = Math.min(100, Math.max(0, (Number(currentDay) / 21) * 100));

                    const journeyLabel =
                      adviceType === "skin"
                        ? "Skin"
                        : adviceType === "hair"
                        ? "Hair"
                        : adviceType === "body"
                        ? "Body"
                        : adviceType === "all" || adviceType === "full"
                        ? "Full Wellness"
                        : journey.adviceType || journey.type || "Wellness";

                    const iconMap = {
                      skin: <Sparkles size={18} className="text-rose-200" />,
                      hair: <Feather size={18} className="text-violet-200" />,
                      body: <Dumbbell size={18} className="text-emerald-200" />,
                      all: <Crown size={18} className="text-amber-200" />,
                      full: <Crown size={18} className="text-amber-200" />,
                    };

                    return (
                      <div
                        key={journey.id || `${journey.adviceType || "journey"}-${index}`}
                        className="card-hover-rise rounded-[1.5rem] border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-xl"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.08] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)]">
                              {iconMap[adviceType] || <Sparkles size={18} className="text-cyan-200" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{journeyLabel}</p>
                              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300/45">
                                Active Journey
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                            Active
                          </span>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-300/80">Day {currentDay} of 21</p>
                            <p className="text-[11px] text-slate-300/50">{Math.round(progressPercent)}%</p>
                          </div>
                          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
                            <div
                              className="progress-fill h-full rounded-full"
                              style={{
                                width: `${progressPercent}%`,
                                background: "linear-gradient(90deg, #38bdf8 0%, #8b5cf6 55%, #f472b6 100%)",
                                backgroundSize: "220% 100%",
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-200">Active Journey</p>
                          <button
                            onClick={() => handleContinueJourney(journey)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.08] px-4 py-2.5 text-[12px] font-semibold text-white transition duration-300 hover:border-white/30 hover:bg-white/[0.14]"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Selection Panel ── */}
            <div
              className="fade-up glass-surface rounded-[2rem] border border-white/[0.10] px-5 py-6 shadow-[0_32px_100px_-60px_rgba(0,0,0,0.85)] sm:px-7 sm:py-7"
              style={{ animationDelay: "0.09s" }}
            >
              {/* Panel header row */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-lg">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-slate-300/50">
                    Choose your wellness focus
                  </p>
                  <p className="mt-2 text-[13.5px] leading-[1.7] text-slate-300/70">
                    Select one category for a focused plan, or choose{" "}
                    <span className="font-semibold text-white/75">Complete Wellness</span> for all three combined.
                  </p>
                </div>

                <button
                  onClick={generateAdvice}
                  disabled={isInvalidSelection || loading}
                  className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.09] px-4 py-2.5 text-[13px] font-semibold text-white transition duration-300 hover:border-white/30 hover:bg-white/[0.15] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="loading-pulse animate-spin" />
                      Generating…
                    </>
                  ) : (
                    "Generate Advice"
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.09] px-4 py-3 text-[13px] text-rose-200">
                  {error}
                </div>
              )}

              {/* ── Cards grid ── */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {ADVICE_TYPES.map((item, i) => {
                  const checked = selectedType === item.key;
                  const disabled = loading;
                  const activeJourney = getActiveJourneyForType(item.key);
                  const hasActiveJourney = Boolean(activeJourney);

                  return (
                    <div
                      key={item.key}
                      className="fade-up"
                      style={{ animationDelay: `${0.13 + i * 0.07}s` }}
                    >
                      <AdviceCard
                        item={item}
                        checked={checked}
                        disabled={disabled}
                        loading={loading && checked}
                        hasActiveJourney={hasActiveJourney}
                        activeJourney={activeJourney}
                        onToggle={() => handleChange(item.key)}
                        onContinue={() => handleContinueJourney(item.key)}
                      />
                    </div>
                  );
                })}
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
                      background: activeAccent ?? "rgba(255,255,255,0.2)",
                    }}
                  />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300/40">
                      Current selection
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-slate-200/70">
                      {previewLabel}
                    </p>
                  </div>
                </div>
                <p className="hidden text-[11px] text-slate-300/40 sm:block">
                  Single focus or complete wellness
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
