import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WellnessResultRenderer from "../components/WellnessResultRenderer";
import TwentyOneDayTracker from "../components/TwentyOneDayTracker";
/* ─────────────────────────────────────────
   UTILITY: extract ASIN from Amazon URL
───────────────────────────────────────── */
function extractAsin(url = "") {
  const m = url.match(/\/dp\/([A-Z0-9]{10})/);
  return m ? m[1] : null;
}

function getProductImage(link = "", category = "skin") {
  const asin = extractAsin(link);
  if (asin) return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
  return null; // non-Amazon links → emoji fallback
}

/* ─────────────────────────────────────────
   UTILITY: parse AI markdown response
───────────────────────────────────────── */
function parseAIResponse(advice = "") {
  const sections = [];
  const lines = advice.split("\n");
  let cur = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      if (cur) sections.push(cur);
      cur = { title: line.replace(/^##\s+/, ""), level: 2, subsections: [], _buf: [] };
    } else if (line.startsWith("### ")) {
      if (cur) {
        if (cur._buf.length) { cur.subsections.push({ title: "", content: cur._buf.join("\n") }); cur._buf = []; }
        cur.subsections.push({ title: line.replace(/^###\s+/, ""), content: "" });
      }
    } else {
      if (cur) {
        const last = cur.subsections[cur.subsections.length - 1];
        if (last && last.content !== undefined) last.content += (last.content ? "\n" : "") + line;
        else cur._buf.push(line);
      }
    }
  }
  if (cur) { if (cur._buf.length) cur.subsections.unshift({ title: "", content: cur._buf.join("\n") }); sections.push(cur); }
  return sections;
}

/* ─────────────────────────────────────────
   UTILITY: parse products from text block
───────────────────────────────────────── */
function parseProducts(text = "") {
  const products = [];
  for (const line of text.split("\n")) {
    const m = line.match(/[-•*]\s*\*\*(.+?)\*\*\s*[—\-–]\s*(.+?)\s*[→>]\s*(https?:\/\/\S+)/);
    if (m) products.push({ name: m[1].trim(), desc: m[2].trim(), link: m[3].trim() });
  }
  return products;
}

/* ─────────────────────────────────────────
   UTILITY: parse bullet list from text
───────────────────────────────────────── */
function parseBullets(text = "") {
  return text.split("\n")
    .map(l => l.replace(/^[-•*]\s*/, "").replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

/* ─────────────────────────────────────────
   SECTION META: icons, colors, timeline order
───────────────────────────────────────── */
const SECTION_META = {
  morning:    { icon: "🌅", grad: "from-amber-400/25 via-orange-400/10 to-transparent", border: "border-amber-400/40", tag: "text-amber-200", badge: "bg-amber-400/20 text-amber-200 border-amber-400/30", dot: "#F59E0B" },
  night:      { icon: "🌙", grad: "from-indigo-500/25 via-violet-500/10 to-transparent", border: "border-indigo-400/40", tag: "text-indigo-200", badge: "bg-indigo-400/20 text-indigo-200 border-indigo-400/30", dot: "#818CF8" },
  "night/weekly": { icon: "🌙", grad: "from-indigo-500/25 via-violet-500/10 to-transparent", border: "border-indigo-400/40", tag: "text-indigo-200", badge: "bg-indigo-400/20 text-indigo-200 border-indigo-400/30", dot: "#818CF8" },
  weekly:     { icon: "📆", grad: "from-violet-400/25 via-fuchsia-400/10 to-transparent", border: "border-violet-400/40", tag: "text-violet-200", badge: "bg-violet-400/20 text-violet-200 border-violet-400/30", dot: "#A78BFA" },
  "key tips": { icon: "💡", grad: "from-yellow-400/25 via-lime-400/10 to-transparent", border: "border-yellow-400/40", tag: "text-yellow-200", badge: "bg-yellow-400/20 text-yellow-200 border-yellow-400/30", dot: "#FACC15" },
  "recommended products": { icon: "🛍️", grad: "from-emerald-400/25 via-teal-400/10 to-transparent", border: "border-emerald-400/40", tag: "text-emerald-200", badge: "bg-emerald-400/20 text-emerald-200 border-emerald-400/30", dot: "#34D399" },
  "15-day plan": { icon: "📅", grad: "from-cyan-400/25 via-sky-400/10 to-transparent", border: "border-cyan-400/40", tag: "text-cyan-200", badge: "bg-cyan-400/20 text-cyan-200 border-cyan-400/30", dot: "#22D3EE" },
  "what to avoid": { icon: "⚠️", grad: "from-rose-400/25 via-red-400/10 to-transparent", border: "border-rose-400/40", tag: "text-rose-200", badge: "bg-rose-400/20 text-rose-200 border-rose-400/30", dot: "#FB7185" },
  "meal plan":    { icon: "🥗", grad: "from-green-400/25 via-emerald-400/10 to-transparent", border: "border-green-400/40", tag: "text-green-200", badge: "bg-green-400/20 text-green-200 border-green-400/30", dot: "#4ADE80" },
  "workout tips": { icon: "💪", grad: "from-orange-400/25 via-red-400/10 to-transparent", border: "border-orange-400/40", tag: "text-orange-200", badge: "bg-orange-400/20 text-orange-200 border-orange-400/30", dot: "#FB923C" },
  default:    { icon: "✦", grad: "from-slate-500/20 via-slate-600/10 to-transparent", border: "border-slate-400/30", tag: "text-slate-300", badge: "bg-slate-500/20 text-slate-300 border-slate-500/30", dot: "#94A3B8" },
};

function getSectionMeta(title = "") {
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(SECTION_META)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  return SECTION_META.default;
}

function detectCategory(advice = "") {
  const l = advice.toLowerCase();
  if (l.includes("skin care advice")) return "skin";
  if (l.includes("hair care advice")) return "hair";
  if (l.includes("body & fitness")) return "body";
  return "skin";
}

const CAT_EMOJI = { skin: "🧴", hair: "💆", body: "💪" };

/* ─────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────── */
function ProductCard({ product, category, idx }) {
  const [imgOk, setImgOk] = useState(true);
  const imgSrc = getProductImage(product.link, category);
  const catEmoji = CAT_EMOJI[category] || "✨";

  const gradients = {
    skin: "from-rose-900/60 to-pink-900/40",
    hair: "from-emerald-900/60 to-teal-900/40",
    body: "from-blue-900/60 to-indigo-900/40",
  };

  const domain = (() => {
    try { return new URL(product.link).hostname.replace("www.", ""); }
    catch { return "shop"; }
  })();

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/15 bg-white/5 transition-all duration-500 hover:border-white/30 hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/40"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      {/* Image zone */}
      <div className={`relative h-44 bg-gradient-to-br ${gradients[category] || gradients.skin} flex items-center justify-center overflow-hidden`}>
        {imgSrc && imgOk ? (
          <img
            src={imgSrc}
            alt={product.name}
            onError={() => setImgOk(false)}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="text-6xl opacity-50 transition-transform duration-500 group-hover:scale-110 select-none">
            {catEmoji}
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-slate-900 shadow-lg">
            Shop Now →
          </span>
        </div>
        {/* Corner badge */}
        <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/70 backdrop-blur-sm border border-white/10">
          {domain}
        </div>
      </div>

      {/* Info zone */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h4 className="font-bold text-white text-sm leading-tight group-hover:text-cyan-200 transition-colors duration-300 line-clamp-2">
          {product.name}
        </h4>
        <p className="text-xs text-white/55 leading-relaxed flex-1 line-clamp-3">{product.desc}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-cyan-300 truncate">View on {domain}</span>
        </div>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────
   ROUTINE TIMELINE CARD
───────────────────────────────────────── */
function RoutineCard({ title, content, meta, isLast }) {
  const bullets = parseBullets(content);
  if (!bullets.length && !content.trim()) return null;

  return (
    <div className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border-2 shadow-lg"
          style={{ borderColor: meta.dot, boxShadow: `0 0 12px ${meta.dot}40`, backgroundColor: `${meta.dot}20` }}
        >
          {meta.icon}
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-2" style={{ background: `linear-gradient(to bottom, ${meta.dot}60, transparent)`, minHeight: "2rem" }} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 mb-6 rounded-2xl border bg-gradient-to-br ${meta.grad} ${meta.border} p-5 backdrop-blur-sm`}>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold mb-3 ${meta.badge}`}>
          {meta.icon} {title}
        </span>
        {bullets.length > 0 ? (
          <ul className="space-y-1.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.dot }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/75 whitespace-pre-line leading-relaxed">{content.trim()}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   15-DAY PLAN STRIP
───────────────────────────────────────── */
function FifteenDayPlan({ content }) {
  const days = content.split("\n").filter(l => l.match(/day\s*\d+/i));
  if (!days.length) {
    return <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">{content.trim()}</p>;
  }
  const colors = ["from-cyan-500/40", "from-teal-500/40", "from-emerald-500/40", "from-sky-500/40", "from-blue-500/40"];
  return (
    <div className="space-y-2">
      {days.map((day, i) => {
        const m = day.match(/day\s*(\d+[–\-]\d+|\d+):?\s*(.*)/i);
        if (!m) return null;
        const [, num, desc] = m;
        return (
          <div key={i} className={`flex items-center gap-3 rounded-xl border border-white/15 bg-gradient-to-r ${colors[i % colors.length]} to-transparent p-3`}>
            <span className="w-14 text-xs font-black text-cyan-300 flex-shrink-0">Day {num}</span>
            <span className="text-sm text-white/80 leading-snug">{desc.trim() || "Continue routine"}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   AVOID SECTION
───────────────────────────────────────── */
function AvoidSection({ content }) {
  const bullets = parseBullets(content);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
          <span className="text-base flex-shrink-0">🚫</span>
          <span>{b}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN SECTION RENDERER
───────────────────────────────────────── */
function MainSection({ section, category, sectionIdx }) {
  const [open, setOpen] = useState(true);
  const meta = getSectionMeta(section.title);
  const isProducts = section.title.toLowerCase().includes("product");
  const is15Day = section.title.toLowerCase().includes("15-day") || section.title.toLowerCase().includes("15 day");
  const isAvoid = section.title.toLowerCase().includes("avoid");

  // Collect products from all subsections
  const allProducts = useMemo(() => {
    const texts = section.subsections.map(s => s.content).join("\n");
    return parseProducts(texts);
  }, [section]);

  const routineSubsections = section.subsections.filter(s => {
    const l = s.title.toLowerCase();
    return l.includes("morning") || l.includes("night") || l.includes("evening") || l.includes("weekly") || l.includes("wash") || l.includes("daily") || l.includes("afternoon") || l.includes("post") || l.includes("pre") || l.includes("mid");
  });

  const otherSubsections = section.subsections.filter(s => !routineSubsections.includes(s));

  return (
    <div
      className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden backdrop-blur-sm"
      style={{ animation: `fadeSlideUp 0.5s ease both`, animationDelay: `${sectionIdx * 120}ms` }}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-3 px-6 py-5 text-left bg-gradient-to-r ${meta.grad} border-b border-white/10 transition-all hover:bg-white/5`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <h2 className={`text-lg font-bold ${meta.tag}`}>{section.title}</h2>
        </div>
        <span className={`text-lg transition-transform duration-300 ${open ? "rotate-180" : ""} ${meta.tag}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div className="px-6 py-6">

          {/* ROUTINE TIMELINE */}
          {routineSubsections.length > 0 && !isProducts && (
            <div className="mb-6">
              {routineSubsections.map((sub, i) => (
                <RoutineCard
                  key={i}
                  title={sub.title}
                  content={sub.content}
                  meta={getSectionMeta(sub.title)}
                  isLast={i === routineSubsections.length - 1}
                />
              ))}
            </div>
          )}

          {/* PRODUCTS GRID */}
          {isProducts && allProducts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Curated Products · Click to Buy
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allProducts.map((p, i) => (
                  <ProductCard key={i} product={p} category={category} idx={i} />
                ))}
              </div>
              {allProducts.length === 0 && (
                <p className="text-sm text-white/50 italic">No products listed for this section.</p>
              )}
            </div>
          )}

          {/* 15-DAY PLAN */}
          {is15Day && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Your Structured Plan
              </p>
              <FifteenDayPlan content={section.subsections.map(s => s.content).join("\n")} />
            </div>
          )}

          {/* AVOID */}
          {isAvoid && (
            <AvoidSection content={section.subsections.map(s => s.content).join("\n")} />
          )}

          {/* OTHER SUBSECTIONS (Key Tips etc.) */}
          {!isProducts && !is15Day && !isAvoid && otherSubsections.map((sub, i) => {
            const subMeta = getSectionMeta(sub.title || section.title);
            const subBullets = parseBullets(sub.content);
            const subProducts = parseProducts(sub.content);
            return (
              <div key={i} className="mb-4 last:mb-0">
                {sub.title && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold mb-3 ${subMeta.badge}`}>
                    {subMeta.icon} {sub.title}
                  </span>
                )}
                {subProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    {subProducts.map((p, pi) => (
                      <ProductCard key={pi} product={p} category={category} idx={pi} />
                    ))}
                  </div>
                ) : subBullets.length > 0 ? (
                  <ul className="space-y-2">
                    {subBullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2 text-sm text-white/75">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: subMeta.dot }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">{sub.content.trim()}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MULTI-DOMAIN RENDERER (for "all" type)
   Splits advice by skin/hair/body domains
───────────────────────────────────────── */
function MultiDomainView({ advice, navigate }) {
  const domains = useMemo(() => {
    const results = [];
    const domainMarkers = [
      { key: "skin", label: "Skin Care", icon: "✨", color: "from-rose-500/20 to-pink-500/5", border: "border-rose-400/30", accent: "text-rose-200" },
      { key: "hair", label: "Hair Care", icon: "💇", color: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-400/30", accent: "text-emerald-200" },
      { key: "body", label: "Body & Fitness", icon: "🏋️", color: "from-blue-500/20 to-indigo-500/5", border: "border-blue-400/30", accent: "text-blue-200" },
    ];
    for (const d of domainMarkers) {
      const regex = new RegExp(`(skin\\s*advice:|hair\\s*advice:|body\\s*advice:)\\s*([\\s\\S]*?)(?=skin\\s*advice:|hair\\s*advice:|body\\s*advice:|$)`, "gi");
      const pattern = new RegExp(`${d.key}\\s*advice:\\s*([\\s\\S]*?)(?=\\n(?:skin|hair|body)\\s*advice:|$)`, "i");
      const match = advice.match(pattern);
      if (match) results.push({ ...d, content: match[1].trim() });
    }
    // If no domain markers found, just return everything as one section
    if (!results.length) results.push({ key: "skin", label: "Wellness Advice", icon: "✨", color: "from-cyan-500/20 to-teal-500/5", border: "border-cyan-400/30", accent: "text-cyan-200", content: advice });
    return results;
  }, [advice]);

  return (
    <div className="space-y-6">
      {domains.map((d, i) => {
        const sections = parseAIResponse(`## ${d.label}\n${d.content}`);
        const products = parseProducts(d.content);
        const bullets = parseBullets(d.content);
        return (
          <div key={i} className={`rounded-3xl border bg-gradient-to-br ${d.color} ${d.border} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className={`text-xl font-bold ${d.accent} flex items-center gap-2`}>
                <span className="text-2xl">{d.icon}</span>{d.label}
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {products.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Recommended Products</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p, pi) => <ProductCard key={pi} product={p} category={d.key} idx={pi} />)}
                  </div>
                </>
              )}
              {bullets.filter(b => !b.startsWith("http")).slice(0, 8).map((b, bi) => (
                <div key={bi} className="flex items-start gap-2 text-sm text-white/75">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white/40" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE HEADER BADGE
───────────────────────────────────────── */
function AdviceTypeBadge({ category }) {
  const configs = {
    skin: { label: "Skin Care Blueprint", color: "from-rose-400 to-pink-500", glow: "shadow-rose-500/30" },
    hair: { label: "Hair Care Blueprint", color: "from-emerald-400 to-teal-500", glow: "shadow-emerald-500/30" },
    body: { label: "Body & Fitness Blueprint", color: "from-blue-400 to-indigo-500", glow: "shadow-blue-500/30" },
    all:  { label: "Complete Wellness Blueprint", color: "from-amber-400 to-orange-500", glow: "shadow-amber-500/30" },
  };
  const c = configs[category] || configs.all;
  return (
    <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${c.color} px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg ${c.glow}`}>
      ✦ {c.label}
    </span>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function PromptPalResultPage() {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };
  const { state } = useLocation();
  const [copied, setCopied] = useState(false);
  const [advice, setAdvice] = useState(state?.advice || "");
  const [adviceType, setAdviceType] = useState(state?.adviceType || "ALL");
  const [resultId, setResultId] = useState(state?.resultId || null);
  const isContinueJourney = Boolean(state?.fromContinueJourney);
  const [loadingHistory, setLoadingHistory] = useState(!state?.advice && !isContinueJourney);

  const token = localStorage.getItem("promptpal_token");
  const accuracy = Number.isFinite(state?.accuracy)
    ? Math.max(0, Math.min(100, Number(state.accuracy)))
    : 85;

  // If no state (e.g. opened via history page back button), load latest saved advice.
  useEffect(() => {
    if (state?.advice || isContinueJourney) {
      if (isContinueJourney) {
        setAdviceType(state?.adviceType || "ALL");
        setResultId(state?.resultId || null);
        setLoadingHistory(false);
      }
      return;
    }

    const fetchLatest = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/wellness/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0]; // data[0] is most recent (DESC order)
          setAdvice(latest.aiResponse || "");
          setAdviceType(latest.adviceType || "ALL");
          setResultId(latest.id || null);  // ← ADD THIS LINE
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchLatest();
  }, [state?.advice, state?.adviceType, state?.resultId, isContinueJourney, token]);

  const copyAdvice = async () => {
    try { await navigator.clipboard.writeText(advice); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const BLUEPRINT_META = {
    SKIN: {
      badge: "🌸 PERSONALIZED SKIN WELLNESS BLUEPRINT",
      badgeClass: "bg-rose-500",
      title: "Personalized Skin Wellness Blueprint",
    },
    HAIR: {
      badge: "✨ PERSONALIZED HAIR WELLNESS BLUEPRINT",
      badgeClass: "bg-indigo-500",
      title: "Personalized Hair Wellness Blueprint",
    },
    BODY: {
      badge: "💪 PERSONALIZED BODY WELLNESS BLUEPRINT",
      badgeClass: "bg-emerald-500",
      title: "Personalized Body Wellness Blueprint",
    },
    ALL: {
      badge: "🌿 COMPLETE WELLNESS BLUEPRINT",
      badgeClass: "bg-amber-500",
      title: "Complete Wellness Blueprint",
    },
  };

  const meta = BLUEPRINT_META[adviceType?.toUpperCase()] || BLUEPRINT_META.ALL;

  if (loadingHistory) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/55 via-slate-900/45 to-rose-900/55" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-6 text-center text-cyan-100 shadow-lg shadow-black/20 backdrop-blur-xl sm:px-8">
            <p className="text-lg font-semibold text-cyan-100">Generating your personalized wellness blueprint...</p>
            <div className="mt-4 space-y-2 text-sm text-cyan-100/80">
              <p>Analyzing profile...</p>
              <p>Selecting products...</p>
              <p>Building your routine...</p>
              <p>Almost ready...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!advice && !isContinueJourney) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/55 via-slate-900/45 to-rose-900/55" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
          <div className="rounded-2xl border border-rose-300/60 bg-rose-500/25 px-6 py-4 text-lg text-white backdrop-blur-xl text-center">
            <p>No advice generated yet.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .page-font { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Cormorant Garamond', serif; }
        .shimmer { animation: shimmer 2.5s ease-in-out infinite; }
      `}</style>

      <div className="page-font relative min-h-screen overflow-hidden">
        {/* BG Video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-40">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-cyan-950/90" />

        {/* Ambient glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-rose-500/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 min-h-screen px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-5xl space-y-8">

            <div className="fade-up flex justify-start" style={{ animationDelay: "0.01s" }}>
              <button
                onClick={handleBack}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12 hover:text-white"
              >
                ← Back
              </button>
            </div>

            {/* ── HERO HEADER ── */}
            <div
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10 backdrop-blur-md overflow-hidden relative"
              style={{ animation: "fadeSlideUp 0.5s ease both" }}
            >
              {/* Decorative line top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="flex-1">
                  <p className={`mb-3 inline-flex rounded-full px-4 py-1 text-xs font-semibold tracking-wider text-white ${meta.badgeClass}`}>
                    {meta.badge}
                  </p>
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    <span className="text-cyan-300">Your Personalized Wellness Blueprint</span>
                  </h1>
                  <p className="mt-3 text-sm text-white/50 max-w-lg leading-relaxed">
                    AI-powered wellness recommendations generated specifically for your profile, lifestyle and goals.
                  </p>

                  {/* Quick stats */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-3xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white/80">
                      <span>📅</span>
                      <span className="font-semibold text-white">21-Day Personalized Journey</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={copyAdvice}
                    className="rounded-3xl border border-white/20 bg-white/8 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
                  >
                    {copied ? "✓ Copied!" : "Copy Wellness Plan"}
                  </button>
                </div>
              </div>

              {/* Bottom line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* ── MAIN CONTENT ── */}
            {/* Replaces raw parsing with the shared card renderer for consistent formatting */}
            <WellnessResultRenderer rawJson={advice} adviceType={adviceType} />

            {/* ── DISCLAIMER ── */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center">
              <p className="text-xs leading-relaxed text-white/30">
                ✦ This plan is AI-generated from curated wellness knowledge. Products are independently sourced and linked for convenience. Always patch-test new products and consult a professional for medical concerns. ✦
              </p>
            </div>

            {/* ── 21-Day Journey Tracker ─────────────────────────────────────── */}
            <div style={{ animation: "fadeSlideUp 0.6s ease 0.5s both" }}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🗓️</span> Your 21-Day Plan
                </h2>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10
                                 px-3 py-0.5 text-xs font-semibold text-cyan-300">
                  Start Tracking
                </span>
              </div>
              <p className="mb-5 text-sm text-slate-400">
                Turn your {adviceType?.toLowerCase()} plan into a 21-day tracked journey.
                
              </p>
              <TwentyOneDayTracker
                resultId={resultId}
                adviceType={adviceType?.toUpperCase() || "ALL"}
                token={token}
              />
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="flex flex-wrap justify-center gap-3 pb-4" style={{ animation: "fadeSlideUp 0.6s ease 0.4s both" }}>
              <button
                onClick={() => navigate("/promptpal")}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
              >
                ↺ Generate Again
              </button>
              <button
                onClick={() =>
                  navigate("/choose-advice", {
                    state: {
                      advice,
                      accuracy,
                      adviceType,
                    },
                  })
                }
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-7 py-3 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-400 hover:to-fuchsia-500 hover:-translate-y-0.5"
              >
                🎯 Advice Hub
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 hover:-translate-y-0.5"
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="rounded-2xl border border-white/20 bg-white/8 px-7 py-3 font-semibold text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                👤 Profile
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
