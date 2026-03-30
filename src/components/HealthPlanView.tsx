import { useState } from "react";
import {
  Calendar,
  Utensils,
  Dumbbell,
  AlertTriangle,
  Moon,
  Pill,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

interface HealthPlanViewProps {
  healthPlan: any[];
  isDarkMode: boolean;
  onBack: () => void;
}

export default function HealthPlanView({
  healthPlan,
  isDarkMode,
  onBack,
}: HealthPlanViewProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const toggleComplete = (day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const progress = (completedDays.size / Math.max(healthPlan.length, 1)) * 100;

  const dayColors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600",
    "from-lime-500 to-green-600",
    "from-fuchsia-500 to-pink-600",
    "from-blue-500 to-cyan-600",
    "from-indigo-500 to-violet-600",
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-[#F8FAFF] text-slate-900"
      }`}
    >
      {/* HEADER */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
          isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-70 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              {completedDays.size}/{healthPlan.length} Days
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* HERO */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">10-Day</span> Health Plan
          </h1>
          <p className={`text-lg max-w-lg mx-auto ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Personalized recovery & prevention plan based on your medical report analysis.
          </p>
        </div>

        {/* DISCLAIMER */}
        <div
          className={`mb-10 p-5 rounded-2xl border flex items-start gap-4 ${
            isDarkMode
              ? "bg-amber-500/5 border-amber-500/20 text-amber-300/80"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">
            <strong>AI-Generated Plan:</strong> This health plan is created by an AI system based on your report analysis. 
            It is for informational purposes only and may contain inaccuracies. Always consult your healthcare provider 
            before making any changes to your diet, exercise, or medication routine.
          </p>
        </div>

        {/* DAYS LIST */}
        <div className="space-y-4">
          {healthPlan.map((day, index) => {
            const isExpanded = expandedDay === index;
            const isCompleted = completedDays.has(index);
            const colorGrad = dayColors[index % dayColors.length];

            return (
              <div
                key={index}
                className={`rounded-3xl border overflow-hidden transition-all duration-500 ${
                  isExpanded ? "shadow-xl" : "shadow-sm"
                } ${
                  isDarkMode
                    ? `bg-slate-900/60 ${isCompleted ? "border-emerald-500/30" : "border-slate-800"}`
                    : `bg-white ${isCompleted ? "border-emerald-300" : "border-slate-200"}`
                }`}
              >
                {/* DAY HEADER */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : index)}
                  className="w-full flex items-center gap-4 p-6 text-left"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorGrad} flex items-center justify-center shadow-lg shrink-0 ${
                      isCompleted ? "opacity-50" : ""
                    }`}
                  >
                    <span className="text-white font-black text-lg">{day.day || index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-black text-lg ${isCompleted ? "line-through opacity-50" : ""}`}
                    >
                      Day {day.day || index + 1}
                    </h3>
                    <p
                      className={`text-sm font-medium truncate ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <Target className="w-3 h-3 inline mr-1" />
                      {day.focus}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(index);
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : isDarkMode
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-400"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 opacity-30" />
                    ) : (
                      <ChevronDown className="w-5 h-5 opacity-30" />
                    )}
                  </div>
                </button>

                {/* DAY DETAILS */}
                {isExpanded && (
                  <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid md:grid-cols-2 gap-4">
                      <PlanCard
                        icon={<Utensils className="w-5 h-5" />}
                        label="Diet"
                        value={day.diet}
                        color="emerald"
                        isDark={isDarkMode}
                      />
                      <PlanCard
                        icon={<Dumbbell className="w-5 h-5" />}
                        label="Exercise"
                        value={day.exercise}
                        color="blue"
                        isDark={isDarkMode}
                      />
                      <PlanCard
                        icon={<Moon className="w-5 h-5" />}
                        label="Sleep"
                        value={day.sleep}
                        color="indigo"
                        isDark={isDarkMode}
                      />
                      <PlanCard
                        icon={<Pill className="w-5 h-5" />}
                        label="Supplements"
                        value={day.supplements}
                        color="violet"
                        isDark={isDarkMode}
                      />
                    </div>

                    {day.precautions && (
                      <div
                        className={`mt-4 p-4 rounded-2xl border flex items-start gap-3 ${
                          isDarkMode
                            ? "bg-amber-500/5 border-amber-500/20 text-amber-300/80"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Precautions
                          </span>
                          <p className="text-sm font-medium mt-1">{day.precautions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {healthPlan.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <Sparkles className="w-16 h-16 mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">
              No health plan available
            </p>
            <p className="text-sm mt-2">Upload a medical report to generate your personalized plan.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function PlanCard({
  icon,
  label,
  value,
  color,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  isDark: boolean;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    violet: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  };

  return (
    <div
      className={`p-5 rounded-2xl border ${
        isDark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-100"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-xl ${colorMap[color]}`}>{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <p className="text-sm font-semibold leading-relaxed">{value || "Follow general guidelines"}</p>
    </div>
  );
}
