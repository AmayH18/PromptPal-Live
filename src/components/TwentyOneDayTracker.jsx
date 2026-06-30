import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Parse plain-text routine into sections with steps ─────────────────────────
function parseRoutine(text) {
  if (!text) return [];
  const sections = [];
  const lines = text.split("\n");
  let current = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.endsWith(":") && !/^\d+\./.test(line) && line.length < 70) {
      if (current) sections.push(current);
      current = { heading: line.replace(/:$/, "").trim(), steps: [] };
      continue;
    }
    const nm = line.match(/^(\d+)\.\s+(.+)/);
    if (nm && current) { current.steps.push(nm[2]); continue; }
    const bm = line.match(/^[-•]\s+(.+)/);
    if (bm && current) current.steps.push(bm[1]);
  }
  if (current) sections.push(current);
  return sections.filter(s => s.steps.length > 0);
}

function getAllSteps(routineText) {
  const out = [];
  for (const sec of parseRoutine(routineText))
    for (const step of sec.steps)
      out.push({ section: sec.heading, text: step });
  return out;
}

const SECTION_ICONS = {
  morning: "🌅", night: "🌙", evening: "🌇", weekly: "📆",
  tips: "💡", key: "💡", avoid: "⚠️", workout: "💪",
  meal: "🥗", pre: "⚡", post: "✅", hair: "✨", skin: "🧴",
};

function sectionIcon(heading = "") {
  const l = heading.toLowerCase();
  for (const [k, v] of Object.entries(SECTION_ICONS))
    if (l.includes(k)) return v;
  return "📌";
}

// ── Sub-components ────────────────────────────────────────────────────────────
function DayDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {Array.from({ length: total }, (_, i) => {
        const day = i + 1;
        const done = day < current;
        const active = day === current;
        return (
          <div
            key={day}
            style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700,
              background: active
                ? "linear-gradient(135deg, #0ea5e9, #8b5cf6)"
                : done ? "rgba(34,197,94,0.25)" : "rgba(148,163,184,0.1)",
              border: active
                ? "2px solid rgba(139,92,246,0.6)"
                : done ? "2px solid rgba(34,197,94,0.4)" : "2px solid rgba(148,163,184,0.15)",
              color: active ? "white" : done ? "#4ade80" : "#475569",
            }}
          >
            {done ? "✓" : day}
          </div>
        );
      })}
    </div>
  );
}

// ── Live Countdown Timer ──────────────────────────────────────────────────────
function CountdownTimer({ nextDayUnlocksAt }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const unlockTime = new Date(nextDayUnlocksAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = unlockTime - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds, total: diff });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextDayUnlocksAt]);

  const pad = (n) => String(n).padStart(2, "0");

  if (timeLeft.total <= 0) return null;

  return (
    <div style={{
      background: "rgba(15,23,42,0.9)",
      border: "1px solid rgba(56,189,248,0.2)",
      borderRadius: 16, padding: "1.25rem 1.5rem",
      marginTop: 20, textAlign: "center",
    }}>
      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        ⏰ Next Day Unlocks In
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
        {[
          { label: "Hours", value: pad(timeLeft.hours) },
          { label: "Min", value: pad(timeLeft.minutes) },
          { label: "Sec", value: pad(timeLeft.seconds) },
        ].map(({ label, value }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <span style={{ color: "#38bdf8", fontSize: 22, fontWeight: 700, marginTop: -8 }}>:</span>}
            <div style={{ textAlign: "center" }}>
              <div style={{
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.25)",
                borderRadius: 10, padding: "8px 14px",
                fontSize: 26, fontWeight: 700, color: "#38bdf8",
                fontVariantNumeric: "tabular-nums", minWidth: 54,
              }}>
                {value}
              </div>
              <p style={{ fontSize: 10, color: "#475569", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "#475569", margin: "12px 0 0" }}>
        Complete today's routine above, then come back tomorrow
      </p>
    </div>
  );
}

// ── Routine Section ───────────────────────────────────────────────────────────
function RoutineSection({ section, allSteps, checkedSteps, onToggle }) {
  const isAiSection = section.heading === "Hair Type & Concerns Advice"
    || section.heading.toLowerCase().includes("type") && section.heading.toLowerCase().includes("advice");
  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${isAiSection ? "rgba(139,92,246,0.3)" : "rgba(148,163,184,0.12)"}`,
      background: isAiSection ? "rgba(139,92,246,0.07)" : "rgba(148,163,184,0.03)",
      padding: "14px 16px", marginBottom: 10,
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: isAiSection ? "#a78bfa" : "#818cf8",
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, margin: "0 0 10px",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span>{sectionIcon(section.heading)}</span>
        {section.heading}
      </p>
      {section.steps.map((step, idx) => {
        const globalIdx = allSteps.findIndex(s => s.section === section.heading && s.text === step);
        const checked = !!checkedSteps[globalIdx];
        return (
          <label key={idx} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "9px 0",
            borderBottom: idx < section.steps.length - 1 ? "1px solid rgba(148,163,184,0.07)" : "none",
            cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={e => onToggle(globalIdx, e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, cursor: "pointer", flexShrink: 0, accentColor: "#22c55e" }}
            />
            <span style={{ fontSize: 14, color: checked ? "#4ade80" : "#cbd5e1", lineHeight: 1.5, textDecoration: checked ? "line-through" : "none", transition: "color 0.2s" }}>
              {step}
            </span>
          </label>
        );
      })}
    </div>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ prevDay, checkedSteps, onToggle, onConfirm, onClose, generating, nextDayNum }) {
  const allSteps = getAllSteps(prevDay?.routineText || "");
  const sections = parseRoutine(prevDay?.routineText || "");
  const completedCount = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 520,
        maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h3 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, margin: 0 }}>
            📋 Day {prevDay?.dayNumber} Review
          </h3>
          <button onClick={onClose} style={{
            background: "transparent", border: "none", color: "#64748b",
            fontSize: 22, cursor: "pointer", lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Steps completed notice */}
        <div style={{
          background: completedCount === 0 ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
          border: `1px solid ${completedCount === 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
          borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13,
          color: completedCount === 0 ? "#f87171" : "#4ade80",
        }}>
          {completedCount === 0
            ? "⚠️ No steps checked — AI will simplify Day " + nextDayNum + " for you."
            : `✅ ${completedCount} step${completedCount > 1 ? "s" : ""} completed — AI will adapt Day ${nextDayNum} accordingly.`}
        </div>

        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
          Tick what you actually did. The AI will use this to make Day {nextDayNum} harder if you
          completed steps, or easier if you skipped them. <strong style={{ color: "#e2e8f0" }}>You can proceed even with 0 steps.</strong>
        </p>

        {sections.map((sec, si) => (
          <div key={si} style={{ marginBottom: 16 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: "#818cf8",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
            }}>
              {sectionIcon(sec.heading)} {sec.heading}
            </p>
            {sec.steps.map((step, idx) => {
              const globalIdx = allSteps.findIndex(s => s.section === sec.heading && s.text === step);
              const checked = !!checkedSteps[globalIdx];
              return (
                <label key={idx} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "9px 0",
                  borderBottom: "1px solid rgba(148,163,184,0.08)",
                  cursor: "pointer",
                }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onToggle(globalIdx, e.target.checked)}
                    style={{ marginTop: 2, width: 16, height: 16, cursor: "pointer", flexShrink: 0, accentColor: "#22c55e" }}
                  />
                  <span style={{ fontSize: 14, color: checked ? "#4ade80" : "#cbd5e1", lineHeight: 1.5 }}>
                    {step}
                  </span>
                </label>
              );
            })}
          </div>
        ))}

        <button
          onClick={onConfirm}
          disabled={generating}
          style={{
            marginTop: 24, width: "100%",
            background: generating ? "rgba(14,165,233,0.4)"
              : "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
            border: "none", borderRadius: 12, padding: "14px",
            color: "white", fontSize: 15, fontWeight: 700,
            cursor: generating ? "not-allowed" : "pointer",
          }}
        >
          {generating ? `🤖 Generating Day ${nextDayNum}...` : `✨ Generate Day ${nextDayNum} Routine`}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TwentyOneDayTracker({ resultId, adviceType, token }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const HEADERS = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const BASE = "http://localhost:8080";

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `${BASE}/api/tracking/status?adviceType=${adviceType}`,
        {
          headers: HEADERS,
        }
      );
      const data = await res.json();
      setStatus(data.hasActiveSession ? data : false);
    } catch {
      setStatus(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Restore checkbox state when day changes
  useEffect(() => {
    if (!status?.hasActiveSession) return;
    const key = `promptpal_steps_day${status.currentDayNumber}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setCheckedSteps(JSON.parse(saved)); return; } catch {}
    }
    const cur = status.days?.[status.days.length - 1];
    if (cur?.completedSteps?.length) {
      const allSteps = getAllSteps(cur.routineText);
      const restored = {};
      allSteps.forEach((s, i) => { if (cur.completedSteps.includes(s.text)) restored[i] = true; });
      setCheckedSteps(restored);
    } else {
      setCheckedSteps({});
    }
  }, [status?.currentDayNumber]);

  // Poll status every 30s to auto-detect unlock
  useEffect(() => {
    if (!status?.hasActiveSession || status?.canUnlockNextDay) return;
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [status, loadStatus]);

  const toggleStep = (idx, val) => {
    const updated = { ...checkedSteps, [idx]: val };
    setCheckedSteps(updated);
    if (status?.hasActiveSession) {
      const key = `promptpal_steps_day${status.currentDayNumber}`;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  };

  const getCompletedTexts = (routineText) => {
    const allSteps = getAllSteps(routineText);
    // Always return an array — even if empty (so AI receives 0-step info)
    return allSteps
      .filter((_, i) => checkedSteps[i])
      .map(s => s.text);
  };

  const handleSaveProgress = async () => {
    if (!status?.hasActiveSession) return;
    const cur = status.days?.[status.days.length - 1];
    const steps = getCompletedTexts(cur.routineText);
    try {
      await fetch(`${BASE}/api/tracking/save-steps`, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({
          dayNumber: status.currentDayNumber,
          adviceType,
          completedSteps: steps,
        }),
      });
    } catch {}
  };

  const handleStart = async () => {
    if (!resultId) { setError("No result ID. Please generate advice first."); return; }
    setGenerating(true); setError("");
    try {
      const res = await fetch(`${BASE}/api/tracking/start`, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({
          userResultId: resultId,
          adviceType,
        }),
      });
      const data = await res.json();
      if (data.hasActiveSession) setStatus(data);
      else setError("Could not start tracking. Please try again.");
    } catch { setError("Failed to start tracking."); }
    finally { setGenerating(false); }
  };

  // Always sends completedSteps to AI — even if empty array
  const handleGenerateNextDay = async () => {
    setGenerating(true); setError("");
    const cur = status.days?.[status.days.length - 1];
    const completedSteps = getCompletedTexts(cur?.routineText || ""); // [] if none checked
    try {
      const res = await fetch(`${BASE}/api/tracking/next-day`, {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({
          adviceType,
          completedSteps,
        }), // always sent, even if []
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setCheckedSteps({});
      setShowReview(false);
      setStatus(data);
      document.getElementById("twentyone-day-tracker")?.scrollIntoView({ behavior: "smooth" });
    } catch { setError("Failed to generate next day. Please try again."); }
    finally { setGenerating(false); }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ textAlign: "center", padding: "2.5rem", color: "#64748b", fontSize: 14 }}>
      ⏳ Loading your journey status...
    </div>
  );

  // ── NOT STARTED ───────────────────────────────────────────────────────────
  if (!status) return (
    <div style={{
      background: "rgba(15,23,42,0.85)", border: "1px solid rgba(148,163,184,0.15)",
      borderRadius: 24, padding: "2.5rem", textAlign: "center",
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🗓️</div>
      <h3 style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>
        Start Your 21-Day Journey
      </h3>
      <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: "0 auto 20px" }}>
        Track your daily wellness routine for 21 days. Your products stay <strong style={{ color: "#e2e8f0" }}>fixed</strong> —
        only the routine evolves each day, guided by AI based on your progress the day before.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {["Same products every day", "AI-adapted daily routine", "Unlocks every 24 hrs", "Progress checkboxes"].map(tag => (
          <span key={tag} style={{
            background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 99, padding: "4px 12px", fontSize: 12, color: "#7dd3fc",
          }}>{tag}</span>
        ))}
      </div>
      {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 14 }}>{error}</p>}
      <button
        onClick={handleStart}
        disabled={generating || !resultId}
        style={{
          background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
          border: "none", borderRadius: 14, padding: "13px 36px",
          color: "white", fontSize: 16, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer",
          opacity: generating || !resultId ? 0.6 : 1,
        }}
      >
        {generating ? "Starting..." : "🚀 Start 21-Day Tracking"}
      </button>
      {!resultId && (
        <p style={{ fontSize: 12, color: "#475569", marginTop: 10 }}>
          Generate your wellness advice first to enable tracking.
        </p>
      )}
    </div>
  );

  // ── ACTIVE SESSION ────────────────────────────────────────────────────────
  const curDayData = status.days?.[status.days.length - 1];
  const allSteps = getAllSteps(curDayData?.routineText || "");
  const sections = parseRoutine(curDayData?.routineText || "");
  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const progressPct = Math.round((status.currentDayNumber / 21) * 100);

  return (
    <div id="twentyone-day-tracker">
      {/* Review modal */}
      {showReview && (
        <ReviewModal
          prevDay={curDayData}
          checkedSteps={checkedSteps}
          onToggle={toggleStep}
          onConfirm={handleGenerateNextDay}
          onClose={() => { setShowReview(false); setError(""); }}
          generating={generating}
          nextDayNum={status.currentDayNumber + 1}
        />
      )}

      {/* ── Header card ── */}
      <div style={{
        background: "rgba(15,23,42,0.85)", border: "1px solid rgba(148,163,184,0.15)",
        borderRadius: 20, padding: "1.5rem 1.75rem", marginBottom: 14,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", margin: "0 0 4px" }}>
              🗓️ 21-Day {status.adviceType} Journey
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              {status.isJourneyComplete
                ? "🏆 All 21 days complete!"
                : `Day ${status.currentDayNumber} of 21 · ${progressPct}% done`}
            </p>
          </div>
          <div style={{
            background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: 12, padding: "8px 16px", textAlign: "center", flexShrink: 0,
          }}>
            <p style={{ fontSize: 26, fontWeight: 700, color: "#38bdf8", margin: 0, lineHeight: 1 }}>
              {status.currentDayNumber}
            </p>
            <p style={{ fontSize: 10, color: "#64748b", margin: "2px 0 0" }}>of 21</p>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: "rgba(148,163,184,0.1)", borderRadius: 99, height: 5, marginBottom: 14 }}>
          <div style={{
            background: "linear-gradient(90deg, #0ea5e9, #8b5cf6)",
            borderRadius: 99, height: 5, width: `${progressPct}%`,
            transition: "width 0.6s ease",
          }} />
        </div>
        <DayDots total={21} current={status.currentDayNumber} />
      </div>

      {/* ── Current day routine card ── */}
      <div style={{
        background: "rgba(15,23,42,0.85)", border: "1px solid rgba(148,163,184,0.15)",
        borderRadius: 20, padding: "1.5rem 1.75rem",
      }}>
        {/* Day title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>
              Day {status.currentDayNumber} Routine
            </h4>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              {completedCount} / {allSteps.length} steps completed today
            </p>
          </div>
          {status.currentDayNumber < 21 && !status.isJourneyComplete && (
            <button
              onClick={handleSaveProgress}
              style={{
                background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
                borderRadius: 8, padding: "6px 14px", color: "#7dd3fc",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              💾 Save Progress
            </button>
          )}
        </div>

        {/* Routine sections with checkboxes */}
        <div style={{ marginTop: 14 }}>
          {sections.length > 0 ? (
            sections.map((sec, i) => (
              <RoutineSection
                key={i}
                section={sec}
                allSteps={allSteps}
                checkedSteps={checkedSteps}
                onToggle={toggleStep}
              />
            ))
          ) : (
            <p style={{ color: "#64748b", fontSize: 14, fontStyle: "italic" }}>
              Loading routine for Day {status.currentDayNumber}...
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10, padding: "10px 14px", marginTop: 14, fontSize: 13, color: "#f87171",
          }}>
            {error}
          </div>
        )}

        {/* ── Bottom action area ── */}
        <div style={{ marginTop: 22 }}>
          {status.isJourneyComplete ? (
            <div style={{
              background: "linear-gradient(135deg, rgba(14,165,233,0.16), rgba(139,92,246,0.14))",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 24,
              padding: "1.75rem",
              boxShadow: "0 20px 45px rgba(2, 8, 23, 0.28)",
            }}>
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 42, marginBottom: 8 }}>🏆</div>
                <h4 style={{ color: "#f8fafc", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>
                  Congratulations!
                </h4>
                <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  You have successfully completed your personalized 21-Day Wellness Journey.
                </p>
                <p style={{ color: "#7dd3fc", fontSize: 14, margin: "8px 0 0" }}>
                  Continue your wellness transformation with PromptPal Premium.
                </p>
              </div>

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 20 }}>
                {[
                  "🤖 AI Wellness Coach",
                  "📈 AI Progress Analysis",
                  "🥗 AI Meal Planner",
                  "🏋️ AI Workout Planner",
                  "🔔 Smart AI Reminders",
                  "📊 Premium Analytics Dashboard",
                ].map((feature) => (
                  <div key={feature} style={{
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(148,163,184,0.16)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    color: "#e2e8f0",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "center",
                  }}>
                    {feature}
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 18 }}>
                <div style={{
                  background: "rgba(15,23,42,0.7)", border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: 16, padding: "16px", textAlign: "center"
                }}>
                  <p style={{ color: "#7dd3fc", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                    Monthly Plan
                  </p>
                  <div style={{ color: "#f8fafc", fontSize: 28, fontWeight: 800 }}>₹199/month</div>
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "8px 0 0" }}>Coming Soon</p>
                </div>
                <div style={{
                  background: "rgba(15,23,42,0.7)", border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 16, padding: "16px", textAlign: "center"
                }}>
                  <p style={{ color: "#c4b5fd", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                    Yearly Plan
                  </p>
                  <div style={{ color: "#f8fafc", fontSize: 28, fontWeight: 800 }}>₹1499/year</div>
                  <p style={{ color: "#4ade80", fontSize: 13, margin: "8px 0 0" }}>Save 37%</p>
                  <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0 0" }}>Coming Soon</p>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 16 }}>
                <button
                  disabled
                  style={{
                    background: "rgba(148,163,184,0.2)",
                    border: "1px solid rgba(148,163,184,0.25)",
                    borderRadius: 14,
                    padding: "12px 20px",
                    color: "#cbd5e1",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "not-allowed",
                    minWidth: 170,
                  }}
                >
                  🚀 Unlock Premium
                </button>
                <div style={{ textAlign: "center", alignSelf: "center" }}>
                  <span style={{
                    display: "inline-block",
                    background: "rgba(56,189,248,0.12)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    color: "#7dd3fc",
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    Coming Soon
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 16 }}>
                <button
                  onClick={() => navigate("/promptpal")}
                  style={{
                    background: "rgba(15,23,42,0.55)",
                    border: "1px solid rgba(148,163,184,0.22)",
                    borderRadius: 14,
                    padding: "12px 20px",
                    color: "#f8fafc",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    minWidth: 170,
                  }}
                >
                  Maybe Later
                </button>
              </div>

              <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", margin: 0 }}>
                PromptPal Premium and payment integration will be available after the official launch.
              </p>
            </div>
          ) : status.canUnlockNextDay ? (
            <>
              <div style={{
                background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.2)",
                borderRadius: 12, padding: "10px 16px", marginBottom: 12, textAlign: "center",
              }}>
                <p style={{ color: "#38bdf8", fontSize: 13, margin: 0 }}>
                  🎉 Day {status.currentDayNumber + 1} is ready — review yesterday and unlock it!
                </p>
              </div>
              <button
                onClick={() => { setError(""); setShowReview(true); }}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                  border: "none", borderRadius: 14, padding: "14px",
                  color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}
              >
                Continue to Day {status.currentDayNumber + 1} →
              </button>
            </>
          ) : (
            // ── Live countdown timer shown when locked ──
            <CountdownTimer nextDayUnlocksAt={curDayData?.nextDayUnlocksAt} />
          )}
        </div>
      </div>
    </div>
  );
}