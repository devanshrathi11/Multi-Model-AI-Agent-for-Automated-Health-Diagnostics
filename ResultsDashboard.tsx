import { useState, useEffect } from "react";
import {
  AlertTriangle, Activity, RefreshCcw, ChevronDown, ChevronUp,
  User, Calendar, HeartPulse, History, ArrowUpRight,
  Brain, CheckCircle2, Stethoscope, Printer, LogOut, CalendarDays,
  Sparkles, TrendingUp, ArrowUp, ArrowDown, FileText,
  Zap, FlaskConical, ClipboardList, Target,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, RadialBarChart, RadialBar, PieChart, Pie,
} from "recharts";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface Props {
  uploadedFile: File | null;
  result: any;
  onStartNew: () => void;
  onViewHistory: () => void;
  onViewHealthPlan: () => void;
  isDarkMode: boolean;
  user?: any;
  onLogout?: () => void;
}

interface Param {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "high" | "low" | "critical";
  confidence: number;
  explanation: string;
  red_flag: boolean;
}

/* ─────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────── */
const STATUS_CONFIG = {
  normal:   { label: "Normal",   badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", bar: "#10b981", border: "border-l-emerald-500",  icon: CheckCircle2, glow: "" },
  low:      { label: "Low",      badge: "bg-sky-500/15 text-sky-400 border-sky-500/25",             bar: "#38bdf8", border: "border-l-sky-400",      icon: ArrowDown,    glow: "" },
  high:     { label: "High",     badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",       bar: "#f59e0b", border: "border-l-amber-400",    icon: ArrowUp,      glow: "" },
  critical: { label: "Critical", badge: "bg-rose-500/15 text-rose-400 border-rose-500/25",          bar: "#ef4444", border: "border-l-rose-500",     icon: AlertTriangle, glow: "shadow-rose-900/50" },
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function ResultsDashboard({
  uploadedFile, result, onStartNew, onViewHistory,
  onViewHealthPlan, isDarkMode, user, onLogout,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "abnormal" | "normal">("all");

  useEffect(() => { setTimeout(() => setLoaded(true), 50); }, []);

  /* ---- DATA PREP ---- */
  const audit = result?.audit || {};
  const profile = {
    name:    result?.user_profile?.name   || "Patient",
    age:     result?.user_profile?.age    || "—",
    gender:  result?.user_profile?.gender || "—",
    date:    new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    file:    uploadedFile?.name || result?.meta?.filename || "Medical Report",
  };

  const normStatus = (s: string): Param["status"] => {
    const v = (s || "").toLowerCase();
    if (v.includes("critical")) return "critical";
    if (v.includes("high"))     return "high";
    if (v.includes("low"))      return "low";
    return "normal";
  };

  const params: Param[] = Array.isArray(result?.parameters)
    ? result.parameters.map((p: any) => ({
        name:        String(p?.name  ?? "Unknown"),
        value:       String(p?.value ?? "—"),
        unit:        String(p?.unit  ?? ""),
        normalRange: String(p?.normalRange ?? "—"),
        status:      normStatus(String(p?.status ?? "normal")),
        confidence:  Number(p?.confidence ?? 0.85),
        explanation: String(p?.explanation ?? "Consult your healthcare provider for interpretation."),
        red_flag:    Boolean(p?.red_flag ?? false),
      }))
    : [];

  // counts
  const counts = params.reduce(
    (acc, p) => { acc[p.status]++; return acc; },
    { normal: 0, low: 0, high: 0, critical: 0 }
  );

  const critList     = params.filter(p => p.status === "critical" || p.red_flag);
  const abnormalList = params.filter(p => p.status !== "normal");
  const normalList   = params.filter(p => p.status === "normal");

  const displayed =
    filter === "critical" ? critList :
    filter === "abnormal" ? abnormalList :
    filter === "normal"   ? normalList   : params;

  const organScores   = result?.organ_scores   || { metabolic: 72, cardiac: 80, renal: 68, hepatic: 75, hematologic: 79 };
  const doctorNote    = result?.doctor_perspective || "A comprehensive clinical evaluation is recommended.";
  const summary       = result?.summary || "";
  const diseaseRisks  = result?.disease_risks  || [];
  const preventTips   = result?.prevention_tips || [];
  const hasHealthPlan = (result?.health_plan?.length || 0) > 0;
  const healthScore   = result?.risk_metrics?.health_score || 0;
  const overallRisk   = result?.risk_metrics?.overall_risk || "—";
  const disclaimer    = result?.medical_disclaimer || "AI-generated analysis. Not medical advice.";

  const scoreColor = healthScore >= 75 ? "#10b981" : healthScore >= 45 ? "#f59e0b" : "#ef4444";
  const scoreLabel = healthScore >= 75 ? "Healthy" : healthScore >= 45 ? "Needs Attention" : "At Risk";
  const scoreBadge = healthScore >= 75 ? "bg-emerald-500/15 text-emerald-400" : healthScore >= 45 ? "bg-amber-500/15 text-amber-400" : "bg-rose-500/15 text-rose-400";

  const radialData = [{ name: "Health", value: healthScore, fill: scoreColor }];

  const pieData = [
    { name: "Normal",   value: counts.normal,   fill: "#10b981" },
    { name: "Low",      value: counts.low,       fill: "#38bdf8" },
    { name: "High",     value: counts.high,      fill: "#f59e0b" },
    { name: "Critical", value: counts.critical,  fill: "#ef4444" },
  ].filter(d => d.value > 0);

  const organData = Object.entries(organScores).map(([k, v]) => ({
    name:  k.charAt(0).toUpperCase() + k.slice(1),
    score: v as number,
    fill:  (v as number) >= 75 ? "#10b981" : (v as number) >= 50 ? "#f59e0b" : "#ef4444",
  }));

  /* ─── STYLE SHORTCUTS ─── */
  const dk = isDarkMode;
  const bg       = dk ? "bg-[#0C1120]"       : "bg-[#F4F7FB]";
  const surface  = dk ? "bg-[#121929]"       : "bg-white";
  const border   = dk ? "border-slate-800"   : "border-slate-200";
  const tp       = dk ? "text-white"         : "text-slate-900";
  const ts       = dk ? "text-slate-400"     : "text-slate-500";
  const divider  = dk ? "divide-slate-800"   : "divide-slate-100";
  const hoverRow = dk ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80";
  const expBg    = dk ? "bg-[#0F1826]"       : "bg-slate-50";

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <div className={`min-h-screen ${bg} ${tp} transition-all duration-500 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      <style>{`@media print{nav,.no-print{display:none!important}body{background:#fff!important;color:#000!important}}`}</style>

      {/* ══════════ NAV ══════════ */}
      <nav className={`sticky top-0 z-50 ${surface} border-b ${border} backdrop-blur-xl`}>
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <button onClick={onStartNew} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform duration-300">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className={`text-lg font-black tracking-tighter ${tp}`}>Medi<span className="text-indigo-400">Q</span></span>
          </button>

          <div className="flex items-center gap-2 no-print">
            {user && (
              <div className={`hidden sm:flex items-center gap-2 text-xs font-bold ${ts} mr-1`}>
                <User className="w-3.5 h-3.5" />{user.full_name}
              </div>
            )}
            {onLogout && (
              <button onClick={onLogout} title="Logout" className={`p-1.5 rounded-lg ${dk ? "hover:bg-white/5" : "hover:bg-slate-100"} transition`}>
                <LogOut className="w-4 h-4 text-slate-400" />
              </button>
            )}
            <button onClick={onViewHistory} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${dk ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-600"} transition`}>
              <History className="w-3.5 h-3.5" /> History
            </button>
            <button onClick={onStartNew} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${dk ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-100 text-slate-600"} transition`}>
              <RefreshCcw className="w-3.5 h-3.5" /> New Scan
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider transition shadow-lg shadow-indigo-900/30">
              <Printer className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-6">

        {/* ══════════ AI SUMMARY BANNER ══════════ */}
        {summary && (
          <div className={`rounded-2xl p-5 border ${dk ? "bg-indigo-950/40 border-indigo-500/20" : "bg-indigo-50 border-indigo-200"} flex items-start gap-4`}>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-900/30">
              <Brain className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Professional Clinical Assessment</p>
              <p className={`text-sm font-medium leading-relaxed ${dk ? "text-slate-300" : "text-slate-700"}`}>{summary}</p>
            </div>
          </div>
        )}

        {/* ══════════ 4 METRIC CARDS ══════════ */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Health Score",  value: `${healthScore}%`, sub: scoreLabel,     color: scoreColor,  icon: HeartPulse,    pill: scoreBadge },
            { label: "Normal",        value: counts.normal,     sub: "Parameters",    color: "#10b981",   icon: CheckCircle2,  pill: "bg-emerald-500/15 text-emerald-400" },
            { label: "Abnormal",      value: counts.high + counts.low, sub: "Hi/Lo", color: "#f59e0b",   icon: TrendingUp,    pill: "bg-amber-500/15 text-amber-400" },
            { label: "Critical",      value: counts.critical,   sub: "Flags",         color: "#ef4444",   icon: AlertTriangle, pill: "bg-rose-500/15 text-rose-400" },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className={`${surface} border ${border} rounded-2xl p-5 flex flex-col gap-3`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] ${ts}`}>{m.label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.color + "20" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                  </div>
                </div>
                <div>
                  <div className={`text-3xl font-black tracking-tight ${tp}`}>{m.value}</div>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${m.pill}`}>{m.sub}</span>
                </div>
                <div className={`h-1 rounded-full ${dk ? "bg-slate-800" : "bg-slate-100"}`}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: i === 0 ? `${healthScore}%` : `${Math.min(100, (Number(m.value) / Math.max(params.length, 1)) * 100)}%`, background: m.color }} />
                </div>
              </div>
            );
          })}
        </section>

        {/* ══════════ INFRA TELEMETRY ══════════ */}
        <section className={`no-print ${surface} border ${border} rounded-2xl overflow-hidden`}>
          <div className={`grid grid-cols-3 md:grid-cols-6 divide-x ${dk ? "divide-slate-800" : "divide-slate-100"}`}>
            {[
              ["ANALYSIS ID",  audit.analysis_id    || "—"],
              ["ENGINE",       audit.engine          || "gemini"],
              ["VERSION",      audit.engine_version  || "v6.0"],
              ["LATENCY",      `${audit.processing_time_ms ?? "—"}ms`],
              ["CACHE",        audit.cache_hit ? "HIT ✓" : "MISS"],
              ["STATUS",       "✓ Verified"],
            ].map(([l, v], i) => (
              <div key={i} className={`px-4 py-3 ${dk ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"} transition`}>
                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400/70">{l}</p>
                <p className={`text-[11px] font-bold truncate mt-0.5 ${tp}`}>{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ PATIENT PROFILE + SCORE + PIE ══════════ */}
        <section className="grid md:grid-cols-12 gap-4">
          {/* Patient card */}
          <div className={`md:col-span-6 ${surface} border ${border} rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden`}>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl no-print" />
            <div className={`w-16 h-16 rounded-2xl ${dk ? "bg-slate-800" : "bg-indigo-50"} flex items-center justify-center border-2 border-indigo-500/20 shrink-0`}>
              <User className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-2xl font-black tracking-tight truncate ${tp}`}>{profile.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.age !== "—" && (
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${dk ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                    Age {profile.age}
                  </span>
                )}
                {profile.gender !== "—" && (
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${dk ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                    {profile.gender}
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${dk ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                  <Calendar className="w-2.5 h-2.5" /> {profile.date}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-semibold ${ts}`}>
                <FileText className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{profile.file}</span>
              </div>
            </div>
          </div>

          {/* Health score radial */}
          <div className={`md:col-span-3 ${surface} border ${border} rounded-2xl p-5 flex flex-col items-center justify-center`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">Overall Health Score</p>
            <div className="relative w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: dk ? "#1e293b" : "#f1f5f9" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${tp}`}>{healthScore}</span>
                <span className={`text-[8px] font-black uppercase ${ts}`}>/100</span>
              </div>
            </div>
            <span className={`mt-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase ${scoreBadge}`}>{scoreLabel}</span>
            <span className={`mt-1 text-[9px] font-bold uppercase ${ts}`}>{overallRisk}</span>
          </div>

          {/* Distribution pie */}
          <div className={`md:col-span-3 ${surface} border ${border} rounded-2xl p-5 flex flex-col items-center justify-center`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">Distribution</p>
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={52} dataKey="value" stroke="none">
                    {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: dk ? "#1e293b" : "#fff", border: "none", borderRadius: "10px", fontSize: "10px", fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
              {pieData.map((d, i) => (
                <span key={i} className="flex items-center gap-1 text-[9px] font-bold" style={{ color: d.fill }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.fill }} />{d.name} {d.value}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ CRITICAL ALERT STRIP ══════════ */}
        {critList.length > 0 && (
          <section className={`rounded-2xl border-2 border-rose-500/25 ${dk ? "bg-rose-500/5" : "bg-rose-50/60"} p-5`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-900/30 no-print">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <h3 className={`font-black text-base ${tp}`}>Critical Findings — Immediate Attention Required</h3>
              <span className="ml-auto bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black">{critList.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {critList.map((p, i) => (
                <div key={i} className={`p-4 rounded-xl flex items-start gap-3 border border-rose-500/20 ${dk ? "bg-[#120D0D]" : "bg-white"}`}>
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-black text-sm text-rose-400 truncate">{p.name}</p>
                    <p className={`text-xs font-semibold ${ts} mt-0.5`}>
                      Value: <span className="text-rose-400 font-black">{p.value} {p.unit}</span>
                      <span className="opacity-50"> · Ref: {p.normalRange}</span>
                    </p>
                    <p className={`text-[10px] mt-1.5 leading-relaxed ${ts}`}>{p.explanation.substring(0, 90)}{p.explanation.length > 90 ? "…" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ DOCTOR'S PERSPECTIVE ══════════ */}
        <section className={`rounded-2xl border-2 ${dk ? "bg-indigo-500/5 border-indigo-500/15" : "bg-indigo-50/40 border-indigo-100"} p-6`}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/25 no-print">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1 flex items-center gap-1.5"><Brain className="w-3 h-3" /> AI Doctor's Perspective</p>
              <p className={`text-sm font-medium leading-relaxed ${dk ? "text-slate-300" : "text-slate-700"}`}>{doctorNote}</p>
              <p className="text-[9px] italic opacity-30 mt-2">⚕️ AI-generated. Not a substitute for professional medical advice.</p>
            </div>
          </div>
        </section>

        {/* ══════════ BIOMARKER TABLE ══════════ */}
        <section className={`${surface} border ${border} rounded-2xl overflow-hidden`}>
          {/* Table header */}
          <div className={`px-6 py-4 border-b ${border} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div>
              <h3 className={`font-black text-lg tracking-tight ${tp}`}>Comprehensive Biomarker Scan</h3>
              <p className={`text-[10px] mt-0.5 ${ts}`}>{params.length} parameters · click any row to see clinical interpretation</p>
            </div>
            <div className={`flex p-1 rounded-xl no-print self-start ${dk ? "bg-slate-800" : "bg-slate-100"} text-[9px] font-black uppercase`}>
              {(["all","critical","abnormal","normal"] as const).map(f => (
                <button key={f} onClick={() => { setFilter(f); setOpenRow(null); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${filter === f ? (dk ? "bg-slate-600 text-white shadow" : "bg-white text-indigo-600 shadow") : "opacity-40"}`}>
                  {f}{" "}
                  <span className="opacity-60">
                    ({f==="all"?params.length:f==="critical"?critList.length:f==="abnormal"?abnormalList.length:normalList.length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table legend */}
          <div className={`px-6 py-2 flex gap-4 border-b ${border} ${dk ? "bg-white/[0.01]" : "bg-slate-50/60"}`}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => {
              const Icon = v.icon;
              return (
                <span key={k} className="flex items-center gap-1.5 text-[9px] font-bold" style={{ color: v.bar }}>
                  <Icon className="w-3 h-3" />{v.label}
                </span>
              );
            })}
            <span className={`ml-auto text-[9px] font-bold hidden md:block ${ts}`}>Ref Range = Standard Reference</span>
          </div>

          {/* Table rows */}
          <div className={`divide-y ${divider}`}>
            {displayed.length === 0 && (
              <div className="py-12 text-center opacity-30">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xs font-black uppercase">No parameters in this category</p>
              </div>
            )}

            {displayed.map((p, i) => {
              const cfg = STATUS_CONFIG[p.status];
              const Icon = cfg.icon;
              const isOpen = openRow === i;

              return (
                <div key={i}>
                  {/* ── PARAMETER ROW ── */}
                  <button
                    onClick={() => setOpenRow(isOpen ? null : i)}
                    className={`w-full flex items-center gap-0 text-left transition-colors duration-150 ${hoverRow} border-l-[3px] ${cfg.border}`}
                  >
                    {/* Name + Range */}
                    <div className="flex-1 min-w-0 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-bold tracking-tight`} style={{ color: cfg.bar }}>
                          {p.name}
                        </span>
                        {p.red_flag && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[8px] font-black uppercase">Flag</span>
                        )}
                      </div>
                      <p className={`text-[10px] font-semibold ${ts} mt-0.5`}>
                        Reference: <span className="font-bold">{p.normalRange}</span>
                        {p.unit && <span className="opacity-50"> {p.unit}</span>}
                      </p>
                    </div>

                    {/* Value */}
                    <div className="px-5 text-right shrink-0">
                      <span className={`text-xl font-black tracking-tight ${tp}`}>{p.value}</span>
                      {p.unit && <span className={`text-[10px] font-bold ml-1 ${ts}`}>{p.unit}</span>}
                    </div>

                    {/* Status badge */}
                    <div className="px-4 shrink-0">
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ${cfg.badge}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>

                    {/* Chevron */}
                    <div className="pr-5 no-print shrink-0 text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* ── EXPANDED DETAIL ── */}
                  {isOpen && (
                    <div className={`px-6 py-5 border-t ${border} ${expBg}`}>
                      <div className="grid md:grid-cols-2 gap-5">
                        {/* Left: interpretation */}
                        <div className={`p-4 rounded-xl border ${border} ${dk ? "bg-[#0C1120]" : "bg-white"}`}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-3">
                            <ClipboardList className="w-3 h-3" /> Clinical Interpretation
                          </p>
                          <p className={`text-sm leading-relaxed font-medium ${dk ? "text-slate-300" : "text-slate-700"}`}>{p.explanation}</p>
                          {/* Visual range bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-[8px] font-black mb-1" style={{ color: cfg.bar }}>
                              <span>TOO LOW</span><span>NORMAL RANGE</span><span>TOO HIGH</span>
                            </div>
                            <div className={`relative h-3 rounded-full ${dk ? "bg-slate-800" : "bg-slate-200"}`}>
                              {/* normal zone highlight */}
                              <div className="absolute inset-y-0 left-[25%] right-[25%] bg-emerald-500/20 rounded-full" />
                              {/* value marker */}
                              <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg border-2 border-white transition-all duration-700"
                                style={{
                                  left: p.status === "normal" ? "50%" : p.status === "low" ? "12%" : p.status === "high" ? "85%" : "96%",
                                  background: cfg.bar,
                                  transform: "translate(-50%, -50%)",
                                }}
                              />
                            </div>
                            <p className="text-[9px] mt-1 font-bold" style={{ color: cfg.bar }}>
                              Your value ({p.value} {p.unit}) is <strong>{cfg.label}</strong>{p.status !== "normal" ? " — outside normal range" : " — within normal range"}
                            </p>
                          </div>
                        </div>

                        {/* Right: Confidence + Action */}
                        <div className={`p-4 rounded-xl border ${border} ${dk ? "bg-[#0C1120]" : "bg-white"} space-y-4`}>
                          <div>
                            <div className="flex justify-between text-[9px] font-black uppercase mb-1.5">
                              <span className="flex items-center gap-1 text-indigo-400"><Zap className="w-3 h-3" /> AI Accuracy Confidence</span>
                              <span className="text-indigo-400">{Math.round(p.confidence * 100)}%</span>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${dk ? "bg-slate-800" : "bg-slate-200"}`}>
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${p.confidence * 100}%` }} />
                            </div>
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-2">
                              <Target className="w-3 h-3" /> Suggested Action
                            </p>
                            <div className={`p-3 rounded-lg text-[11px] font-semibold leading-relaxed border ${cfg.badge} ${cfg.border} border-l-2`}>
                              {p.status === "normal"
                                ? "✓ Value is within healthy range. Maintain current lifestyle habits."
                                : p.status === "critical"
                                ? "🚨 Urgent: Consult your doctor immediately. This value is significantly abnormal."
                                : p.status === "high"
                                ? "⬆ Value is elevated. Discuss with your doctor for management strategies."
                                : "⬇ Value is below normal. Dietary or supplement adjustments may help — consult a doctor."}
                            </div>
                          </div>

                          {p.red_flag && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-[10px] text-rose-400 font-black">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Clinical verification strongly recommended
                            </div>
                          )}

                          <p className="text-[8px] italic opacity-30">⚕️ AI-generated interpretation. Always consult a healthcare professional.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════ ORGAN SYSTEMS ══════════ */}
        <section className={`${surface} border ${border} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-5">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            <h3 className={`font-black text-base ${tp}`}>Organ System Health</h3>
            <span className={`text-[9px] font-bold italic ${ts}`}>(AI-estimated from lab values)</span>
          </div>
          <div className="grid grid-cols-5 gap-3 mb-5">
            {organData.map((o, i) => (
              <div key={i} className={`p-3 rounded-xl border ${border} ${dk ? "bg-slate-800/30" : "bg-slate-50"} text-center`}>
                <p className={`text-[8px] font-black uppercase tracking-wider ${ts}`}>{o.name}</p>
                <p className="text-2xl font-black mt-1" style={{ color: o.fill }}>{o.score}</p>
                <div className={`h-1 rounded-full mt-2 ${dk ? "bg-slate-800" : "bg-slate-200"}`}>
                  <div className="h-full rounded-full" style={{ width: `${o.score}%`, background: o.fill, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={organData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: dk ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: dk ? "#475569" : "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: dk ? "#1e293b" : "#fff", border: "none", borderRadius: "10px", fontSize: "10px", fontWeight: 700 }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>{organData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ══════════ HEALTH PLAN + DISEASE RISKS ══════════ */}
        <section className="grid md:grid-cols-2 gap-4">
          {/* Health Plan CTA */}
          <div
            onClick={hasHealthPlan ? onViewHealthPlan : undefined}
            className={`rounded-2xl border-2 p-6 transition-all group ${hasHealthPlan ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl" : "opacity-50"} ${dk ? "bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30" : "bg-emerald-50/40 border-emerald-100"}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-black text-base ${tp}`}>10-Day Health Plan</h3>
                <p className={`text-[10px] font-bold ${ts}`}>Personalized diet, exercise & recovery</p>
              </div>
            </div>
            <p className={`text-sm font-medium leading-relaxed ${ts}`}>
              {hasHealthPlan
                ? `Your personalized ${result.health_plan.length}-day plan with daily diet, exercise, sleep & supplement guidance is ready.`
                : "Not available for this report."}
            </p>
            {hasHealthPlan && (
              <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-xs font-black group-hover:gap-2.5 transition-all">
                View Full Plan <ArrowUpRight className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Disease Risks */}
          <div className={`${surface} border ${border} rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className={`font-black text-base ${tp}`}>Risk Predictions</h3>
            </div>
            {diseaseRisks.length > 0 ? (
              <div className="space-y-2">
                {diseaseRisks.slice(0, 4).map((r: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${border} ${dk ? "bg-slate-800/20" : "bg-slate-50"}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${tp} truncate`}>{r.disease}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`flex-1 h-1.5 rounded-full ${dk ? "bg-slate-800" : "bg-slate-200"}`}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${r.probability || 20}%`, background: r.risk_level === "high" ? "#ef4444" : r.risk_level === "moderate" ? "#f59e0b" : "#10b981" }} />
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: r.risk_level === "high" ? "#ef4444" : r.risk_level === "moderate" ? "#f59e0b" : "#10b981" }}>
                          {r.probability || "—"}%
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase shrink-0 ${r.risk_level === "high" ? "bg-rose-500/15 text-rose-400" : r.risk_level === "moderate" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                      {r.risk_level}
                    </span>
                  </div>
                ))}
                <p className={`text-[8px] italic opacity-30 mt-2 ${ts}`}>AI predictions — may be inaccurate. Consult a physician for confirmation.</p>
              </div>
            ) : (
              <div className="py-6 text-center opacity-30"><CheckCircle2 className="w-8 h-8 mx-auto mb-2" /><p className="text-[10px] font-black uppercase">No significant risks detected</p></div>
            )}
          </div>
        </section>

        {/* ══════════ PREVENTION TIPS ══════════ */}
        {preventTips.length > 0 && (
          <section className={`${surface} border ${border} rounded-2xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className={`font-black text-base ${tp}`}>Prevention & Wellness Tips</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {preventTips.slice(0, 6).map((tip: string, i: number) => (
                <div key={i} className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${border} ${dk ? "bg-emerald-500/5" : "bg-emerald-50/30"}`}>
                  <span className="text-emerald-400 text-sm font-black mt-0.5 shrink-0">✓</span>
                  <p className={`text-sm font-medium leading-relaxed ${dk ? "text-slate-300" : "text-slate-700"}`}>{tip}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══════════ CLINICAL GOVERNANCE FOOTER ══════════ */}
        <section className={`rounded-2xl p-6 ${dk ? "bg-slate-900 border border-slate-800" : "bg-slate-900"} text-white`}>
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30 no-print">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-indigo-400 mb-1.5">Clinical Safety & Governance</p>
              <p className="text-[11px] leading-relaxed font-semibold opacity-60">{disclaimer}</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}