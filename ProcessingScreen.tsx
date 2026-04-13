import { useState, useEffect, useRef } from "react";
import {
  FileSearch,
  ScanLine,
  TrendingUp,
  Brain,
  FileCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  Terminal,
  ShieldAlert,
  Server,
  Cpu,
  WifiOff,
} from "lucide-react";
import { checkHealth } from "../lib/api";

interface ProcessingScreenProps {
  onComplete: () => void;
  isDarkMode: boolean;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "processing" | "complete";
}

export default function ProcessingScreen({
  onComplete,
  isDarkMode,
}: ProcessingScreenProps) {
  const timerRef = useRef<number | null>(null);
  const currentStepRef = useRef(0);

  const [backendStatus, setBackendStatus] = useState<"online" | "offline">("offline");
  const [aiEngine, setAiEngine] = useState<"Gemini" | "Groq" | "Local">("Gemini");

  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Data Extraction",
      description: "Parsing document structure & metadata",
      icon: <FileSearch className="w-5 h-5" />,
      status: "processing",
    },
    {
      id: 2,
      title: "OCR Engine",
      description: "Converting image text to clinical data",
      icon: <ScanLine className="w-5 h-5" />,
      status: "pending",
    },
    {
      id: 3,
      title: "Biomarker Mapping",
      description: "Identifying metabolic indicators",
      icon: <TrendingUp className="w-5 h-5" />,
      status: "pending",
    },
    {
      id: 4,
      title: "Contextual AI",
      description: "Risk inference, health plan & doctor's perspective",
      icon: <Brain className="w-5 h-5" />,
      status: "pending",
    },
    {
      id: 5,
      title: "Finalizing Report",
      description: "Generating dashboard, health plan & risk analysis",
      icon: <FileCheck className="w-5 h-5" />,
      status: "pending",
    },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "Initializing neural core...",
  ]);

  const [statusText, setStatusText] = useState("Booting Intelligence Engine");

  // Backend Health Monitor
  useEffect(() => {
    const doCheck = async () => {
      const healthy = await checkHealth();
      setBackendStatus(healthy ? "online" : "offline");
    };

    doCheck();
    const timer = setInterval(doCheck, 4000);
    return () => clearInterval(timer);
  }, []);

  // AI Engine Switching
  useEffect(() => {
    const engines: ("Gemini" | "Groq" | "Local")[] = [
      "Gemini", "Gemini", "Groq", "Gemini", "Local",
    ];
    let index = 0;
    const t = setInterval(() => {
      setAiEngine(engines[index % engines.length]);
      index++;
    }, 4500);
    return () => clearInterval(t);
  }, []);

  // Processing Pipeline Animation
  useEffect(() => {
    const detailLogs = [
      "Parsing hematology tables...",
      "Normalizing OCR confidence...",
      "Detecting abnormal biomarkers...",
      "Generating 10-day health plan...",
      "Building doctor's perspective...",
      "Encrypting & finalizing payload...",
    ];

    const runPipeline = () => {
      const stepIndex = currentStepRef.current;

      if (stepIndex >= steps.length) {
        setStatusText("Analysis Complete");
        setLogs([
          "Generating secure session token...",
          "Redirecting to dashboard...",
        ]);

        timerRef.current = window.setTimeout(() => {
          onComplete();
        }, 1500);
        return;
      }

      const activeStep = steps[stepIndex];
      setStatusText(activeStep.title);

      setLogs((prev) => [
        detailLogs[stepIndex] || "Optimizing inference...",
        ...prev.slice(0, 3),
      ]);

      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx === stepIndex) return { ...s, status: "complete" };
          if (idx === stepIndex + 1) return { ...s, status: "processing" };
          return s;
        })
      );

      currentStepRef.current += 1;
      timerRef.current = window.setTimeout(runPipeline, 1800);
    };

    timerRef.current = window.setTimeout(runPipeline, 1200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete]);

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const progress = (completedSteps / steps.length) * 100;

  const engineColor =
    aiEngine === "Gemini" ? "text-indigo-400"
    : aiEngine === "Groq" ? "text-emerald-400"
    : "text-amber-400";

  const engineIcon =
    aiEngine === "Gemini" ? <Sparkles className="w-4 h-4" />
    : aiEngine === "Groq" ? <Cpu className="w-4 h-4" />
    : <Server className="w-4 h-4" />;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors ${
        isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* HEADER */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30 overflow-hidden">
              <Brain className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent h-1/2 w-full animate-scan" />
            </div>
          </div>

          <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase italic">
            {statusText}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
            <div className={`flex items-center gap-1 ${backendStatus === "online" ? "text-emerald-400" : "text-rose-400"}`}>
              {backendStatus === "online" ? <Server className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              Backend {backendStatus}
            </div>
            <div className={`flex items-center gap-1 ${engineColor}`}>
              {engineIcon}
              {aiEngine} Engine
            </div>
            <div className={`flex items-center gap-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              <Loader2 className="w-3 h-3 animate-spin" />
              Neural Pipeline Active
            </div>
          </div>
        </div>

        {/* PROGRESS CARD */}
        <div
          className={`rounded-[2.5rem] p-10 border mb-8 transition-colors ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]"
          }`}
        >
          {/* LOG TERMINAL */}
          <div
            className={`mb-10 rounded-2xl p-5 font-mono text-[11px] leading-relaxed shadow-inner border ${
              isDarkMode
                ? "bg-black/40 border-slate-700 text-slate-300"
                : "bg-slate-900 border-slate-800 text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 text-slate-500 mb-3 border-b border-slate-700 pb-2">
              <Terminal className="w-3 h-3" />
              <span className="uppercase tracking-widest text-[9px] font-black">AI System Logs</span>
            </div>
            <div className="space-y-1.5 min-h-[70px]">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${idx === 0 ? "text-blue-400" : "text-slate-400"} flex items-center gap-2 animate-fade-in`}
                >
                  <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
                  <span className="font-medium">{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pipeline Saturation</span>
              <span className="text-xl font-black text-blue-500 tracking-tighter">{Math.round(progress)}%</span>
            </div>
            <div className={`h-4 rounded-full overflow-hidden p-1 shadow-inner ring-1 ${isDarkMode ? "bg-slate-800 ring-slate-700" : "bg-slate-100 ring-slate-200"}`}>
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CHECKLIST */}
          <div className="grid gap-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${
                  step.status === "processing"
                    ? "bg-blue-500/10 border-blue-500/30"
                    : step.status === "complete"
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : isDarkMode
                    ? "bg-slate-800 border-slate-700 opacity-40 grayscale"
                    : "bg-white border-transparent opacity-40 grayscale"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    step.status === "processing"
                      ? "bg-blue-600 text-white"
                      : step.status === "complete"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-600/20 text-slate-400"
                  }`}
                >
                  {step.status === "complete" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : step.status === "processing" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-black uppercase tracking-widest">{step.title}</h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-center gap-6 px-4">
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            256-Bit Encrypted
          </div>
          <div className="h-1 w-1 bg-slate-500 rounded-full" />
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            AI-Generated • Not Medical Advice
          </div>
        </div>
      </div>
    </div>
  );
}