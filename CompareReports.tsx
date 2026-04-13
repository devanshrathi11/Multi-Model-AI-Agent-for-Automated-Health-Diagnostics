import { useState, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Heart,
  Sparkles,
} from "lucide-react";
import { compareReports } from "../lib/api";

interface CompareReportsProps {
  reportOldUid: string;
  reportNewUid: string;
  isDarkMode: boolean;
  onBack: () => void;
}

export default function CompareReports({
  reportOldUid,
  reportNewUid,
  isDarkMode,
  onBack,
}: CompareReportsProps) {
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const data = await compareReports(reportOldUid, reportNewUid);
        setComparison(data.comparison);
      } catch (err: any) {
        setError(err.message || "Failed to compare reports");
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [reportOldUid, reportNewUid]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-[#F8FAFF] text-slate-900"
        }`}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold opacity-60">Comparing reports...</p>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-[#F8FAFF] text-slate-900"
        }`}
      >
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <p className="font-bold text-rose-500">{error || "Comparison failed"}</p>
          <button onClick={onBack} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { parameters, health_score, organ_scores, report_old, report_new } = comparison;
  const scoreDiff = health_score.change;

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-[#F8FAFF] text-slate-900"
      }`}
    >
      {/* NAV */}
      <nav
        className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
          isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 font-bold text-sm uppercase tracking-widest hover:opacity-70 transition ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-lg font-black tracking-tight">
            <Sparkles className="w-4 h-4 inline mr-2 text-blue-500" />
            Report Comparison
          </h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* HEALTH SCORE COMPARISON */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Old Report */}
          <div
            className={`rounded-3xl border p-8 text-center ${
              isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Previous Report
            </span>
            <h3 className="font-bold truncate mb-3 text-sm">{report_old?.filename}</h3>
            <div className="text-5xl font-black text-blue-500">{health_score.old}</div>
            <span className="text-xs font-bold text-slate-400 uppercase">{report_old?.risk}</span>
          </div>

          {/* Change */}
          <div
            className={`rounded-3xl border p-8 text-center flex flex-col items-center justify-center ${
              scoreDiff > 0
                ? "bg-emerald-500/5 border-emerald-500/20"
                : scoreDiff < 0
                ? "bg-rose-500/5 border-rose-500/20"
                : isDarkMode
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="mb-3">
              {scoreDiff > 0 ? (
                <TrendingUp className="w-12 h-12 text-emerald-500" />
              ) : scoreDiff < 0 ? (
                <TrendingDown className="w-12 h-12 text-rose-500" />
              ) : (
                <Minus className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div
              className={`text-4xl font-black ${
                scoreDiff > 0 ? "text-emerald-500" : scoreDiff < 0 ? "text-rose-500" : "text-slate-400"
              }`}
            >
              {scoreDiff > 0 ? "+" : ""}
              {scoreDiff}
            </div>
            <span className="text-xs font-black uppercase tracking-widest mt-1">
              {health_score.trend === "improved"
                ? "Improvement"
                : health_score.trend === "declined"
                ? "Decline"
                : "No Change"}
            </span>
          </div>

          {/* New Report */}
          <div
            className={`rounded-3xl border p-8 text-center ${
              isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              Latest Report
            </span>
            <h3 className="font-bold truncate mb-3 text-sm">{report_new?.filename}</h3>
            <div className="text-5xl font-black text-indigo-500">{health_score.new}</div>
            <span className="text-xs font-bold text-slate-400 uppercase">{report_new?.risk}</span>
          </div>
        </div>

        {/* ORGAN SCORE COMPARISON */}
        {organ_scores && (
          <div
            className={`rounded-3xl border p-8 ${
              isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="font-black text-xl">Organ System Changes</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(organ_scores).map(([organ, data]: [string, any]) => (
                <div
                  key={organ}
                  className={`p-4 rounded-2xl border text-center ${
                    data.change > 0
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : data.change < 0
                      ? "bg-rose-500/5 border-rose-500/20"
                      : isDarkMode
                      ? "bg-slate-800/50 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60 block mb-2">
                    {organ}
                  </span>
                  <div className="flex items-center justify-center gap-1 text-lg font-black">
                    <span className="opacity-40">{data.old}</span>
                    <span className="text-xs opacity-30">→</span>
                    <span>{data.new}</span>
                  </div>
                  <div
                    className={`text-xs font-black mt-1 ${
                      data.change > 0 ? "text-emerald-500" : data.change < 0 ? "text-rose-500" : "text-slate-400"
                    }`}
                  >
                    {data.change > 0 ? (
                      <ArrowUpRight className="w-3 h-3 inline" />
                    ) : data.change < 0 ? (
                      <ArrowDownRight className="w-3 h-3 inline" />
                    ) : null}
                    {data.change > 0 ? "+" : ""}
                    {data.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARAMETER COMPARISON TABLE */}
        <div
          className={`rounded-3xl border overflow-hidden ${
            isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          <div
            className={`px-8 py-6 border-b flex items-center gap-3 ${
              isDarkMode ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-black text-xl">Biomarker Changes</h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {parameters?.map((p: any, i: number) => (
              <div
                key={i}
                className={`flex items-center px-8 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition ${
                  p.trend === "new" ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1">
                  <h4 className="font-bold">{p.name}</h4>
                  <span className="text-xs opacity-40">{p.unit}</span>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <span className="opacity-40 font-mono w-20 text-right">{p.old_value}</span>

                  <span className="text-xs opacity-20">→</span>

                  <span className="font-black font-mono w-20">{p.new_value}</span>

                  <div
                    className={`w-24 text-center px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                      p.trend === "improved"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : p.trend === "declined"
                        ? "bg-rose-500/10 text-rose-500"
                        : p.trend === "new"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {p.trend}
                  </div>

                  {p.change_percent !== 0 && (
                    <span
                      className={`text-xs font-black ${
                        p.change > 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {p.change_percent > 0 ? "+" : ""}
                      {p.change_percent}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISCLAIMER */}
        <div
          className={`p-8 rounded-3xl border ${
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-900 text-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">
                AI Comparison Disclaimer
              </p>
              <p className="text-xs font-semibold opacity-60 leading-relaxed">
                This comparison is generated by an AI system and is for informational purposes only.
                Differences in values may be due to varying lab methods, timing, or report formats.
                This does NOT constitute medical advice. Always consult a healthcare professional
                for interpretation of trends and clinical decisions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
