import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const inputCls = "w-full rounded-xl border border-white/35 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-400";
const labelCls = "block mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider";
const selectCls = "w-full rounded-xl border border-white/35 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400";
const HAIR_CONCERN_OPTIONS = [
  "HAIR_FALL",
  "HAIR_THINNING",
  "DANDRUFF",
  "DRYNESS",
  "FRIZZ",
  "SPLIT_ENDS",
  "SCALP_ACNE",
  "OILY_SCALP",
  "DRY_SCALP",
];

const HAIR_CONCERN_LABELS = {
  HAIR_FALL: "Hair Fall",
  HAIR_THINNING: "Hair Thinning",
  DANDRUFF: "Dandruff",
  DRYNESS: "Dryness",
  FRIZZ: "Frizz",
  SPLIT_ENDS: "Split Ends",
  SCALP_ACNE: "Scalp Acne",
  OILY_SCALP: "Oily Scalp",
  DRY_SCALP: "Dry Scalp",
};

const HAIR_GOAL_OPTIONS = [
  "HAIR_GROWTH",
  "HAIR_THICKNESS",
  "HAIR_FALL",
  "HAIR_DANDRUFF",
  "HAIR_FRIZZ",
  "HAIR_SHINE",
  "HAIR_REPAIR",
];

const HAIR_GOAL_LABELS = {
  HAIR_GROWTH: "Hair Growth",
  HAIR_THICKNESS: "Hair Thickness",
  HAIR_FALL: "Hair Fall Control",
  HAIR_DANDRUFF: "Dandruff Control",
  HAIR_FRIZZ: "Frizz Control",
  HAIR_SHINE: "Hair Shine",
  HAIR_REPAIR: "Hair Repair",
};

const ALLERGY_OPTIONS = [
  "MILK",
  "EGGS",
  "GLUTEN",
  "NUTS",
  "SEAFOOD",
  "SOY",
  "DUST",
  "POLLEN",
  "NONE",
];

const ALLERGY_LABELS = {
  MILK: "Milk",
  EGGS: "Eggs",
  GLUTEN: "Gluten",
  NUTS: "Nuts",
  SEAFOOD: "Seafood",
  SOY: "Soy",
  DUST: "Dust",
  POLLEN: "Pollen",
  NONE: "None",
};

const SKIN_CONCERN_OPTIONS = [
  "ACNE",
  "ACNE_MARKS",
  "PIGMENTATION",
  "DARK_SPOTS",
  "DARK_CIRCLES",
  "DRYNESS",
  "FINE_LINES",
  "SENSITIVITY",
];

const SKIN_CONCERN_LABELS = {
  ACNE: "Acne",
  ACNE_MARKS: "Acne Marks",
  PIGMENTATION: "Pigmentation",
  DARK_SPOTS: "Dark Spots",
  DARK_CIRCLES: "Dark Circles",
  DRYNESS: "Dryness",
  FINE_LINES: "Fine Lines",
  SENSITIVITY: "Sensitivity",
};

function parseConcerns(value) {
  return Array.from(new Set((value || "").split(",").map((s) => s.trim()).filter(Boolean)));
}

function parseAllergies(value) {
  const parsed = Array.from(new Set((value || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)));
  return parsed.includes("NONE") ? ["NONE"] : parsed;
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
      <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(148,163,184,0.8)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}



export default function EditProfilePage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [skinType, setSkinType] = useState("");
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [hairType, setHairType] = useState("");
  const [hairConcerns, setHairConcerns] = useState([]);
  const [hairGoals, setHairGoals] = useState([]);
  const [bodyGoal, setBodyGoal] = useState("");
  const [skinConcernLevel, setSkinConcernLevel] = useState(5);
  const [hairConcernLevel, setHairConcernLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(8);
  const [dietScore, setDietScore] = useState(3);
  const [exerciseScore, setExerciseScore] = useState(4);
  const [allergies, setAllergies] = useState("");
  const [dailyRoutine, setDailyRoutine] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const hairConcernsText = hairConcerns.join(", ");
  const hairGoalsText = hairGoals.join(", ");
  const skinConcernsText = skinConcerns.join(", ");
  const selectedAllergies = parseAllergies(allergies);

  const token = localStorage.getItem("promptpal_token");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data;
        setPhone(u.phone || "");
        setAge(u.age || "");
        setHeight(u.height || "");
        setWeight(u.weight || "");
        setSkinType(u.skinType || "");
        if (Array.isArray(u.skinConcerns)) {
          setSkinConcerns((u.skinConcerns || []).filter(Boolean));
        } else if (typeof u.skinConcerns === "string") {
          setSkinConcerns(parseConcerns(u.skinConcerns));
        } else {
          setSkinConcerns([]);
        }
        setHairType(u.hairType || "");
        if (Array.isArray(u.hairConcerns)) {
          setHairConcerns((u.hairConcerns || []).filter(Boolean));
        } else if (typeof u.hairConcerns === "string") {
          setHairConcerns(parseConcerns(u.hairConcerns));
        } else {
          setHairConcerns([]);
        }
        if (Array.isArray(u.hairGoals)) {
          setHairGoals((u.hairGoals || []).filter(Boolean));
        } else if (typeof u.hairGoals === "string") {
          setHairGoals(parseConcerns(u.hairGoals));
        } else {
          setHairGoals([]);
        }
        setBodyGoal(u.bodyGoal || "");
        setSkinConcernLevel(u.skinConcernLevel ?? 5);
        setHairConcernLevel(u.hairConcernLevel ?? 5);
        setSleepHours(u.sleepHours ?? 8);
        setDietScore(u.dietScore ?? 3);
        setExerciseScore(u.exerciseScore ?? 4);
        setAllergies(u.allergies || "");
        setDailyRoutine(u.dailyRoutine || "");
      } catch (err) {
        setMessage("Failed to load profile.");
      }
    };
    loadProfile();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!phone || phone.length < 10) return setMessage("Enter a valid phone number.");
    if (!hairGoals.length) return setMessage("Select at least one hair goal.");
    if (age < 10 || age > 100) return setMessage("Enter a valid age (10–100).");
    if (height < 50 || height > 250) return setMessage("Enter valid height (50–250 cm).");
    if (weight < 20 || weight > 300) return setMessage("Enter valid weight (20–300 kg).");
    if (skinConcernLevel < 1 || skinConcernLevel > 10) return setMessage("Skin concern level must be 1–10.");
    if (hairConcernLevel < 1 || hairConcernLevel > 10) return setMessage("Hair concern level must be 1–10.");
    if (sleepHours < 0 || sleepHours > 24) return setMessage("Sleep hours must be 0–24.");
    if (dietScore < 1 || dietScore > 3) return setMessage("Select valid diet type.");
    if (exerciseScore < 1 || exerciseScore > 4) return setMessage("Select valid exercise frequency.");

    setSaving(true);
    setMessage("⏳ Saving...");
    try {
      const hairConcernsPayload = hairConcerns.join(",");
      const skinConcernsPayload = skinConcerns.join(",");
      const hairGoalsPayload = hairGoals.join(",");
      const allergiesPayload = selectedAllergies.join(",") || "NONE";
      const userId = localStorage.getItem("promptpal_userId");

await API.put(
  `/api/profile/${userId}`,
        {
          phone,
          age,
          height,
          weight,
          skinType,
          skinConcerns: skinConcernsPayload,
          hairType,
          hairConcerns: hairConcernsPayload,
          hairGoals: hairGoalsPayload,
          bodyGoal,
          skinConcernLevel,
          hairConcernLevel,
          sleepHours,
          dietScore,
          exerciseScore,
          allergies: allergiesPayload,
          dailyRoutine,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✓ Profile Updated Successfully");
    } catch (err) {
      setMessage("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; }
      `}</style>

      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-25">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.93) 60%, rgba(7,34,55,0.97) 100%)" }} />
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(56,189,248,0.06)" }} />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.06)" }} />

        <div className="relative z-10 min-h-screen px-4 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-3xl">

            {/* ── Header ── */}
            <div className="fade-up flex items-center justify-between mb-8">
              <div>
                <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "white", letterSpacing: "-0.02em" }}>
                  Edit Profile
                </h1>
                <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 13, marginTop: 4 }}>
                  Fields marked <span style={{ color: "#38bdf8" }}>*</span> are required for best AI results
                </p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                ← Back
              </button>
            </div>

            {/* ── Message ── */}
            {message && (
              <div
                className="fade-up mb-6 rounded-xl border px-4 py-3 text-sm font-medium"
                style={{
                  background: message.includes("✅") ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                  borderColor: message.includes("✅") ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)",
                  color: message.includes("✅") ? "#4ade80" : "#f87171",
                }}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">

              {/* ── Basic Info ── */}
              <div className="fade-up" style={{ animationDelay: "0.1s" }}>
                <Section title="Basic Information" icon="👤">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input className={inputCls} type="text" placeholder="10-digit phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div>
                      <label className={labelCls}>Age *</label>
                      <input className={inputCls} type="number" placeholder="Your age" value={age} onChange={(e) => setAge(Number(e.target.value))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Height (cm) *</label>
                      <input className={inputCls} type="number" placeholder="e.g. 170" value={height} onChange={(e) => setHeight(Number(e.target.value))} required />
                    </div>
                    <div>
                      <label className={labelCls}>Weight (kg) *</label>
                      <input className={inputCls} type="number" placeholder="e.g. 65" value={weight} onChange={(e) => setWeight(Number(e.target.value))} required />
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Skin ── */}
              <div className="fade-up" style={{ animationDelay: "0.15s" }}>
                <Section title="Skin Profile" icon="🌸">
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Skin Type *</label>
                      <select className={selectCls} value={skinType} onChange={(e) => setSkinType(e.target.value)} required>
                        <option value="">Select Skin Type</option>
                        <option value="OILY">Oily</option>
                        <option value="DRY">Dry</option>
                        <option value="NORMAL">Normal</option>
                        <option value="COMBINATION">Combination</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Skin Concerns (optional)</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {SKIN_CONCERN_OPTIONS.map((concern) => {
                          const selected = skinConcerns.includes(concern);
                          return (
                            <button
                              key={concern}
                              type="button"
                              onClick={() =>
                                setSkinConcerns((prev) =>
                                  prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
                                )
                              }
                              className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                                selected
                                  ? "border-cyan-400 bg-cyan-400/20 text-white"
                                  : "border-white/10 bg-transparent text-slate-300 hover:bg-white/4"
                              }`}
                            >
                              {SKIN_CONCERN_LABELS[concern]}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        className={inputCls}
                        type="text"
                        placeholder="Comma separated concerns"
                        value={skinConcernsText}
                        onChange={(e) => setSkinConcerns(parseConcerns(e.target.value))}
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Hair ── */}
              <div className="fade-up" style={{ animationDelay: "0.2s" }}>
                <Section title="Hair Profile" icon="✨">
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Hair Type *</label>
                      <select className={selectCls} value={hairType} onChange={(e) => setHairType(e.target.value)} required>
                        <option value="">Select Hair Type</option>
                        <option value="STRAIGHT">Straight</option>
                        <option value="WAVY">Wavy</option>
                        <option value="CURLY">Curly</option>
                        <option value="COILY">Coily</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Hair Goal *</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {HAIR_GOAL_OPTIONS.map((goal) => {
                          const selected = hairGoals.includes(goal);
                          return (
                            <button
                              key={goal}
                              type="button"
                              onClick={() =>
                                setHairGoals((prev) =>
                                  prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
                                )
                              }
                              className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                                selected
                                  ? "border-cyan-400 bg-cyan-400/20 text-white"
                                  : "border-white/10 bg-transparent text-slate-300 hover:bg-white/4"
                              }`}
                            >
                              {HAIR_GOAL_LABELS[goal]}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        className={inputCls}
                        type="text"
                        placeholder="Comma separated goals"
                        value={hairGoalsText}
                        onChange={(e) => setHairGoals(parseConcerns(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Hair Concerns (optional)</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {HAIR_CONCERN_OPTIONS.map((concern) => {
                          const selected = hairConcerns.includes(concern);
                          return (
                            <button
                              key={concern}
                              type="button"
                              onClick={() =>
                                setHairConcerns((prev) =>
                                  prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
                                )
                              }
                              className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                                selected
                                  ? "border-cyan-400 bg-cyan-400/20 text-white"
                                  : "border-white/10 bg-transparent text-slate-300 hover:bg-white/4"
                              }`}
                            >
                              {HAIR_CONCERN_LABELS[concern]}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        className={inputCls}
                        type="text"
                        placeholder="Comma separated concerns"
                        value={hairConcernsText}
                        onChange={(e) => setHairConcerns(parseConcerns(e.target.value))}
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Body ── */}
              <div className="fade-up" style={{ animationDelay: "0.25s" }}>
                <Section title="Body Goal" icon="💪">
                  <div>
                    <label className={labelCls}>Body Goal *</label>
                    <select className={selectCls} value={bodyGoal} onChange={(e) => setBodyGoal(e.target.value)} required>
                      <option value="">Select Body Goal</option>
                      <option value="WEIGHT_LOSS">Weight Loss</option>
                      <option value="WEIGHT_GAIN">Weight Gain</option>
                      <option value="FITNESS">Fitness</option>
                      <option value="MUSCLE_GAIN">Muscle Gain</option>
                    </select>
                  </div>
                </Section>
              </div>

              {/* ── Lifestyle ── */}
              <div className="fade-up" style={{ animationDelay: "0.3s" }}>
                <Section title="Lifestyle" icon="📋">
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Sleep Hours *</label>
                      <input
                        className={inputCls}
                        type="number"
                        min="1"
                        max="24"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(Number(e.target.value))}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Diet Type *</label>
                      <select
                        className={selectCls}
                        value={dietScore}
                        onChange={(e) => setDietScore(Number(e.target.value))}
                        required
                      >
                        <option value="">Select Diet</option>
                        <option value={3}>Healthy</option>
                        <option value={2}>Average</option>
                        <option value={1}>Junk Heavy</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Exercise Frequency *</label>
                      <select
                        className={selectCls}
                        value={exerciseScore}
                        onChange={(e) => setExerciseScore(Number(e.target.value))}
                        required
                      >
                        <option value="">Select Exercise</option>
                        <option value={4}>5+ Days/Week</option>
                        <option value={3}>3-4 Days/Week</option>
                        <option value={2}>1-2 Days/Week</option>
                        <option value={1}>Never</option>
                      </select>
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Extras ── */}
              <div className="fade-up" style={{ animationDelay: "0.35s" }}>
                <Section title="Additional Details" icon="📝">
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Allergies (optional)</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {ALLERGY_OPTIONS.map((allergy) => {
                          const selected = selectedAllergies.includes(allergy);
                          return (
                            <button
                              key={allergy}
                              type="button"
                              onClick={() => {
                                const current = parseAllergies(allergies);
                                if (allergy === "NONE") {
                                  setAllergies(current.includes("NONE") ? "" : "NONE");
                                  return;
                                }
                                const updated = current.includes("NONE") ? [] : current;
                                const next = updated.includes(allergy)
                                  ? updated.filter((item) => item !== allergy)
                                  : [...updated, allergy];
                                setAllergies(next.length ? next.join(",") : "NONE");
                              }}
                              className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                                selected
                                  ? "border-cyan-400 bg-cyan-400/20 text-white"
                                  : "border-white/10 bg-transparent text-slate-300 hover:bg-white/4"
                              }`}
                            >
                              {ALLERGY_LABELS[allergy]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={labelCls}>Daily Routine (optional)</label>
                        <span style={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>{dailyRoutine.length}/75</span>
                      </div>
                      <textarea
                        className={inputCls}
                        rows={2}
                        maxLength={75}
                        placeholder="Brief description of your daily schedule..."
                        value={dailyRoutine}
                        onChange={(e) => setDailyRoutine(e.target.value)}
                      />
                    </div>
                  </div>
                </Section>
              </div>

              {/* ── Submit ── */}
              <div className="fade-up pb-4" style={{ animationDelay: "0.4s" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl py-4 text-base font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", boxShadow: "0 8px 28px rgba(139,92,246,0.35)" }}
                >
                  {saving ? "⏳ Saving..." : "💾 Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}