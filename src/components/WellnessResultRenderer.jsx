import { useState } from "react";

// ── Colour palettes per advice type ──────────────────────────────────────────
const THEME = {
  SKIN: {
    accent:   "#f472b6",   // rose-400
    accent2:  "#fb7185",
    glow:     "rgba(244,114,182,0.18)",
    badge:    "bg-rose-500/20 text-rose-300 border-rose-500/30",
    btn:      "from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700",
    section:  "border-rose-500/20 bg-rose-500/5",
    tag:      "bg-rose-500/10 text-rose-300",
    icon:     "🌸",
  },
  HAIR: {
    accent:   "#818cf8",   // indigo-400
    accent2:  "#a78bfa",
    glow:     "rgba(129,140,248,0.18)",
    badge:    "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    btn:      "from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700",
    section:  "border-indigo-500/20 bg-indigo-500/5",
    tag:      "bg-indigo-500/10 text-indigo-300",
    icon:     "✨",
  },
  BODY: {
    accent:   "#34d399",   // emerald-400
    accent2:  "#6ee7b7",
    glow:     "rgba(52,211,153,0.18)",
    badge:    "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    btn:      "from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
    section:  "border-emerald-500/20 bg-emerald-500/5",
    tag:      "bg-emerald-500/10 text-emerald-300",
    icon:     "💪",
  },
  ALL: {
    accent:   "#fbbf24",   // amber-400
    accent2:  "#f59e0b",
    glow:     "rgba(251,191,36,0.15)",
    badge:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
    btn:      "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
    section:  "border-amber-500/20 bg-amber-500/5",
    tag:      "bg-amber-500/10 text-amber-300",
    icon:     "🌿",
  },
};

// ── Product Image via Unsplash (free, no key required) ───────────────────────
function ProductImage({ query, name }) {
  const [errored, setErrored] = useState(false);
  const seed   = encodeURIComponent(query || name);
  const src    = `https://source.unsplash.com/200x200/?${seed}`;

  if (errored) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-3xl bg-white/5 text-4xl">
        🛍️
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErrored(true)}
      className="h-40 w-full rounded-3xl object-contain p-3"
      loading="lazy"
    />
  );
}

// ── Single Product Card ───────────────────────────────────────────────────────
function ProductCard({ product, theme }) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
      style={{ boxShadow: `0 0 0 0 ${theme.glow}` }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${theme.glow}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <ProductImage query={product.imageQuery} name={product.name} />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(to top, ${theme.glow}, transparent)` }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
            <p className="text-base font-semibold leading-tight text-white">{product.name}</p>
            <p className="flex-1 text-xs leading-relaxed text-slate-400">{product.use}</p>

            {/* AI Reason */}
            {product.reason && (
              <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <h5 className="mb-1 text-xs font-semibold text-white/90">🧠 Why PromptPal Recommended This</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{product.reason}</p>
              </div>
            )}

        {/* Buy button — opens in new tab */}
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-3 py-2 text-xs font-semibold text-white transition-all duration-200 ${theme.btn}`}
          style={{ backgroundSize: "200% auto" }}
        >
          <span>🛒</span>
          <span>Buy Now</span>
          <span className="ml-auto opacity-60">↗</span>
        </a>
      </div>
    </div>
  );
}

// ── Routine Section Card ──────────────────────────────────────────────────────
// ── Fallback Icons for Routine Sections ──────────────────────────────────────
function getSectionIcon(heading = "") {
  const h = heading.toLowerCase();

  if (h.includes("morning")) return "☀️";
  if (h.includes("night")) return "🌙";
  if (h.includes("weekly")) return "🗓️";
  if (h.includes("meal")) return "🍽️";
  if (h.includes("workout")) return "🏋️";
  if (h.includes("recovery")) return "🛌";
  if (h.includes("hair")) return "✨";
  if (h.includes("skin")) return "🌸";

  return "📋";
}

function cleanRoutineHeading(heading = "") {
  if (typeof heading !== "string") return heading;

  const trimmed = heading.trim();
  if (!trimmed) return heading;

  const normalized = trimmed.toLowerCase();
  if (normalized === "skin" || normalized === "skin care routine" || normalized.startsWith("skin ")) {
    return "SKIN CARE ROUTINE";
  }
  if (normalized === "hair" || normalized === "hair care routine" || normalized.startsWith("hair ")) {
    return "HAIR CARE ROUTINE";
  }
  if (normalized === "meal" || normalized === "meal plan" || normalized.startsWith("meal ")) {
    return "MEAL PLAN";
  }
  if (normalized === "workout" || normalized === "workout routine" || normalized.startsWith("workout ")) {
    return "WORKOUT ROUTINE";
  }
  if (normalized === "recovery" || normalized === "recovery tips" || normalized.startsWith("recovery ")) {
    return "RECOVERY TIPS";
  }

  const cleaned = trimmed
    .replace(/^(skin|hair|body|meal|workout|recovery)\s*/i, "")
    .trim();

  return cleaned || trimmed;
}

// ── Routine Section Card ──────────────────────────────────────────────────────
function RoutineSection({ section, theme }) {
  const cleanedHeading = cleanRoutineHeading(section.heading);
  const isAiSection = cleanedHeading === "Hair Type & Concerns Advice";
  const icon = getSectionIcon(cleanedHeading);

  return (
    <div
      className={`rounded-3xl border p-6 ${
        isAiSection ? "border-violet-400/30 bg-violet-500/10" : theme.section
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <div>
          {isAiSection && (
            <span className="mb-1 block text-xs text-violet-300">✨ AI Personalized</span>
          )}
          <h4 className="text-base font-semibold uppercase tracking-widest text-white/80">
          {cleanedHeading}
          </h4>
        </div>
      </div>
      <ol className="space-y-3">
        {(section.steps || []).map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: theme.accent }}
            >
              {i + 1}
            </span>
            <span className="text-sm leading-7 text-slate-200">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── 21-Day Plan ───────────────────────────────────────────────────────────────
function Plan21({ plan, theme }) {
  if (!Array.isArray(plan) || plan.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <span>📅</span> 21-Day Personalized Journey
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Your routine gradually adapts over 21 days while keeping the same recommended products.
        </p>
      </div>
      <div className="space-y-3">
        {plan.map((phase, i) => {
          if (typeof phase === "string") {
            const [label, ...rest] = phase.split(":");
            return (
              <div key={i} className="flex items-start gap-4">
                <span
                  className="mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ background: theme.accent }}
                >
                  {label}
                </span>
                <p className="text-sm leading-relaxed text-slate-300">{rest.join(":").trim()}</p>
              </div>
            );
          }

          const label = phase.dayRange || phase.days || phase.title || `Phase ${i + 1}`;
          const content = phase.description || phase.routine || phase.plan || phase.details || "";

          return (
            <div key={i} className="flex items-start gap-4">
              <span
                className="mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: theme.accent }}
              >
                {label}
              </span>
              <div className="text-sm leading-relaxed text-slate-300">
                {Array.isArray(content) ? (
                  <ul className="list-disc pl-5">
                    {content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  content
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Avoid List ────────────────────────────────────────────────────────────────
function AvoidList({ avoid, theme }) {
  if (!avoid || avoid.length === 0) return null;
  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 sm:p-7">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-red-300">
        <span>⚠️</span> What to Avoid
      </h3>
      <div className="flex flex-wrap gap-2">
        {avoid.map((item, i) => (
          <span
            key={i}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Plain-text Fallback ───────────────────────────────────────────────────────
function PlainTextFallback({ text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">{text}</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WellnessResultRenderer({ rawJson, adviceType }) {
  const theme = THEME[adviceType?.toUpperCase()] || THEME.ALL;
  const adviceTypeKey = adviceType?.toUpperCase();
  const fixedTitle =
    adviceTypeKey === "SKIN"
      ? "Personalized Skin Wellness Blueprint"
      : adviceTypeKey === "HAIR"
      ? "Personalized Hair Wellness Blueprint"
      : adviceTypeKey === "BODY"
      ? "Personalized Body Wellness Blueprint"
      : "Complete Wellness Blueprint";

  if (!rawJson || rawJson.trim() === "") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
        <p className="text-4xl">✨</p>
        <p className="mt-2 text-sm">Your personalized wellness plan will appear here.</p>
      </div>
    );
  }

  // ── Parse JSON ──────────────────────────────────────────────────────────────
  let plan = null;
  try {
    // Strip potential markdown code fences if any
    const cleaned = rawJson
      .replace(/```json/g, "")
      .replace(/```JSON/g, "")
      .replace(/```/g, "")
      .trim();
    plan = JSON.parse(cleaned);
  } catch {
    // AI didn't output valid JSON — fall back gracefully
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <p className="text-red-300 text-sm">
          Failed to load wellness plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Routine Sections ─────────────────────────────────────────────── */}
      {plan.sections && plan.sections.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>📋</span> Your Daily Routine
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {plan.sections.map((sec, i) => (
              <RoutineSection key={i} section={sec} theme={theme} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recommended Products ─────────────────────────────────────────── */}
      {plan.products && plan.products.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>🛍️</span> Recommended Products
            <span
              className={`ml-2 rounded-full border px-2 py-0.5 text-xs font-semibold ${theme.badge}`}
            >
              {plan.products.length} products
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {plan.products.map((p, i) => (
              <ProductCard key={i} product={p} theme={theme} />
            ))}
          </div>
        </div>
      )}

      {/* ── 21-Day Plan ──────────────────────────────────────────────────── */}
      <Plan21 plan={plan.plan21} theme={theme} />

      {/* ── Avoid ────────────────────────────────────────────────────────── */}
      <AvoidList avoid={plan.avoid} theme={theme} />

    </div>
  );
}
