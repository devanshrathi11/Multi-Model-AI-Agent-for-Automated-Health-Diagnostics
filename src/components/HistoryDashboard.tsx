import { useEffect, useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  GitCompareArrows,
  FileText,
  Clock,
  Shield,
  AlertCircle,
  Loader2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { getReports, deleteReport, getReport } from "../lib/api";

interface HistoryDashboardProps {
  isDarkMode: boolean;
  onBack: () => void;
  onCompare: (oldUid: string, newUid: string) => void;
  onViewReport: (report: any) => void;
}

interface ReportSnapshot {
  report_uid: string;
  filename: string;
  created_at: string;
  health_score: number;
  overall_risk: string;
  file_type: string;
}

export default function HistoryDashboard({
  isDarkMode,
  onBack,
  onCompare,
  onViewReport,
}: HistoryDashboardProps) {
  const [reports, setReports] = useState<ReportSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);
  const [viewingUid, setViewingUid] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    setDeletingUid(uid);
    try {
      await deleteReport(uid);
      setReports((prev) => prev.filter((r) => r.report_uid !== uid));
      setSelectedForCompare((prev) => prev.filter((id) => id !== uid));
    } catch (err: any) {
      alert(err.message || "Failed to delete report");
    } finally {
      setDeletingUid(null);
    }
  };

  const handleViewReport = async (uid: string) => {
    setViewingUid(uid);
    try {
      const report = await getReport(uid);
      onViewReport(report);
    } catch (err: any) {
      alert(err.message || "Failed to load report");
    } finally {
      setViewingUid(null);
    }
  };

  const toggleCompare = (uid: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(uid)) return prev.filter((id) => id !== uid);
      if (prev.length >= 2) return [prev[1], uid]; // Keep last 2
      return [...prev, uid];
    });
  };

  const canCompare = selectedForCompare.length === 2;

  const handleCompare = () => {
    if (canCompare) {
      // Older first, newer second
      const idx1 = reports.findIndex((r) => r.report_uid === selectedForCompare[0]);
      const idx2 = reports.findIndex((r) => r.report_uid === selectedForCompare[1]);

      const older = idx1 > idx2 ? selectedForCompare[0] : selectedForCompare[1];
      const newer = idx1 > idx2 ? selectedForCompare[1] : selectedForCompare[0];

      onCompare(older, newer);
    }
  };

  const getTrendIcon = (index: number) => {
    if (index >= reports.length - 1) return <Minus size={16} className="text-slate-400" />;
    const prev = reports[index + 1].health_score; // +1 because sorted desc
    const curr = reports[index].health_score;
    if (curr > prev) return <TrendingUp size={16} className="text-emerald-500" />;
    if (curr < prev) return <TrendingDown size={16} className="text-rose-500" />;
    return <Minus size={16} className="text-slate-400" />;
  };

  const getRiskColor = (risk: string) => {
    if (risk.includes("high")) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    if (risk.includes("moderate")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  };

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
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-70 transition ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {canCompare && (
            <button
              onClick={handleCompare}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 transition-all flex items-center gap-2"
            >
              <GitCompareArrows className="w-4 h-4" />
              Compare Selected
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Report History</h1>
          <p className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            {reports.length > 0
              ? `${reports.length} report${reports.length > 1 ? "s" : ""} on file • Select 2 to compare`
              : "No reports yet. Upload a medical document to get started."}
          </p>
        </div>

        {/* COMPARE HINT */}
        {selectedForCompare.length > 0 && selectedForCompare.length < 2 && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 ${
              isDarkMode ? "bg-blue-500/5 border-blue-500/20 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <GitCompareArrows className="w-4 h-4" />
            <p className="text-xs font-bold">Select one more report to compare</p>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <p className="font-bold text-rose-500">{error}</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">No reports yet</p>
            <p className="text-sm mt-2">Upload a medical document to see your history here.</p>
          </div>
        ) : (
          /* REPORTS LIST */
          <div className="space-y-4">
            {reports.map((report, index) => {
              const isSelected = selectedForCompare.includes(report.report_uid);

              return (
                <div
                  key={report.report_uid}
                  className={`rounded-3xl border p-6 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 ${
                    isSelected
                      ? isDarkMode
                        ? "bg-blue-500/10 border-blue-500/30 ring-2 ring-blue-500/20"
                        : "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                      : isDarkMode
                      ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Compare Checkbox */}
                  <button
                    onClick={() => toggleCompare(report.report_uid)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : isDarkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <GitCompareArrows className="w-4 h-4" />}
                  </button>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg truncate">{report.filename}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{report.file_type}</span>
                    </div>
                  </div>

                  {/* Score & Risk */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-black">{report.health_score}</div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Score</span>
                    </div>
                    {getTrendIcon(index)}
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border ${getRiskColor(report.overall_risk)}`}>
                      {report.overall_risk}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewReport(report.report_uid)}
                      disabled={viewingUid === report.report_uid}
                      className={`p-2.5 rounded-xl transition-all ${
                        isDarkMode ? "hover:bg-slate-800 text-blue-400" : "hover:bg-blue-50 text-blue-500"
                      }`}
                    >
                      {viewingUid === report.report_uid ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(report.report_uid)}
                      disabled={deletingUid === report.report_uid}
                      className={`p-2.5 rounded-xl transition-all ${
                        isDarkMode ? "hover:bg-rose-500/10 text-slate-400 hover:text-rose-400" : "hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                      }`}
                    >
                      {deletingUid === report.report_uid ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DISCLAIMER */}
        <div className={`mt-10 p-4 rounded-2xl border flex items-start gap-3 ${
          isDarkMode ? "bg-amber-500/5 border-amber-500/15 text-amber-200/60" : "bg-amber-50 border-amber-200 text-amber-700"
        }`}>
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold leading-relaxed">
            Past reports are stored securely on your local device. MediQ uses AI for analysis which may contain errors.
            This is not a substitute for professional medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}