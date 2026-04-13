import { useEffect } from "react";
import {
  Activity,
  Brain,
  Shield,
  FileText,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Globe,
  Moon,
  Sun,
  LogOut,
  User,
  Calendar,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  user?: any;
  onLogout?: () => void;
}

export default function LandingPage({
  onGetStarted,
  isDarkMode,
  setIsDarkMode,
  user,
  onLogout,
}: LandingPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* ANIMATED 3D BACKGROUND PARTICLES */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/6 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse delay-500" />

        {/* Floating 3D Orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${12 + i * 4}px`,
              height: `${12 + i * 4}px`,
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              background: `linear-gradient(135deg, ${
                i % 2 === 0 ? "#3b82f6" : "#10b981"
              }, ${i % 3 === 0 ? "#6366f1" : "#06b6d4"})`,
              animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* ================= NAVBAR ================= */}
      <nav
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 backdrop-blur-xl ${
          isDarkMode
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white/70 border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform glow-blue">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span
              className={`text-xl font-black tracking-tight ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              Medi<span className="text-blue-600">Q</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* User info */}
            {user && (
              <div className="hidden md:flex items-center gap-3 mr-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${
                    isDarkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <User className="w-3 h-3" />
                  {user.full_name}
                </div>
                <button
                  onClick={onLogout}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? "hover:bg-slate-800 text-yellow-400"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
            >
              {user ? "Upload Report" : "Get Started"}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="text-center mb-24 animate-fade-in-up">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 border animate-bounce-slow ${
              isDarkMode
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : "bg-blue-50 border-blue-100 text-blue-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Medical Intelligence
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
            Understand Your Health
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600 bg-[length:200%_auto] animate-gradient-x">
              Like Never Before
            </span>
          </h1>

          <p
            className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Upload any medical report — get instant AI analysis, personalized 10-day health plans,
            risk predictions, and doctor-level insights. Track progress over time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onGetStarted}
              className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3 shadow-2xl shadow-blue-500/30"
            >
              <UploadCloud size={24} />
              {user ? "Analyze Report" : "Start Free Analysis"}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Row */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Privacy First
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Lock className="w-4 h-4 text-blue-500" /> Encrypted Data
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Globe className="w-4 h-4 text-indigo-500" /> Local Processing
            </div>
          </div>
        </div>

        {/* ================= FEATURE GRID ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          <FeatureCard
            isDark={isDarkMode}
            icon={<Brain className="w-10 h-10 text-blue-500" />}
            title="AI Analysis"
            description="Dual AI engine extracts biomarkers with medical-grade precision from any document format."
            delay={0}
          />
          <FeatureCard
            isDark={isDarkMode}
            icon={<Calendar className="w-10 h-10 text-emerald-500" />}
            title="10-Day Health Plan"
            description="Personalized daily plans with diet, exercise, sleep, and supplement recommendations."
            delay={100}
          />
          <FeatureCard
            isDark={isDarkMode}
            icon={<TrendingUp className="w-10 h-10 text-indigo-500" />}
            title="Compare Reports"
            description="Track health progress by comparing current results with your previous reports."
            delay={200}
          />
          <FeatureCard
            isDark={isDarkMode}
            icon={<Heart className="w-10 h-10 text-rose-500" />}
            title="Doctor's Perspective"
            description="AI-generated clinical interpretation — as if an experienced doctor is reviewing your results."
            delay={300}
          />
        </div>

        {/* ================= HOW IT WORKS ================= */}
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16 tracking-tight">
            How It <span className="gradient-text">Works</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Upload", desc: "Drop your medical report (PDF, image, or CSV)", icon: <UploadCloud className="w-6 h-6" /> },
              { step: "02", title: "Extract", desc: "Smart OCR & parser extracts all biomarker data", icon: <FileText className="w-6 h-6" /> },
              { step: "03", title: "Analyze", desc: "Dual AI engine assesses risks & generates insights", icon: <Brain className="w-6 h-6" /> },
              { step: "04", title: "Act", desc: "Get your health plan, doctor's view & track progress", icon: <Zap className="w-6 h-6" /> },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group ${
                  isDarkMode
                    ? "bg-slate-900/40 border-slate-800 hover:border-blue-500/30"
                    : "bg-white border-slate-100 hover:border-blue-200"
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-black text-blue-500/20">{item.step}</span>
                  <div className="text-blue-500 group-hover:scale-110 transition-transform">{item.icon}</div>
                </div>
                <h3 className="font-black text-xl mb-2">{item.title}</h3>
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</p>
                {i < 3 && (
                  <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-blue-500/20 w-6 h-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= STATS SECTION ================= */}
        <div
          className={`rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-inner ${
            isDarkMode
              ? "bg-slate-900/50 border border-slate-800"
              : "bg-white border border-slate-100"
          }`}
        >
          <div className="grid md:grid-cols-4 gap-12 text-center relative z-10">
            <Metric value="98.5%" label="Analysis Accuracy" isDark={isDarkMode} />
            <Metric value="<30s" label="Response Time" isDark={isDarkMode} />
            <Metric value="10-Day" label="Health Plans" isDark={isDarkMode} />
            <Metric value="100%" label="Private & Secure" isDark={isDarkMode} />
          </div>

          {/* Background Blobs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        {/* ================= AI DISCLAIMER ================= */}
        <div className={`mt-20 text-center max-w-2xl mx-auto`}>
          <div
            className={`p-6 rounded-2xl border ${
              isDarkMode
                ? "bg-amber-500/5 border-amber-500/15 text-amber-200/60"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
          >
            <Shield className="w-5 h-5 mx-auto mb-3 opacity-60" />
            <p className="text-xs font-semibold leading-relaxed">
              <strong>Medical Disclaimer:</strong> MediQ is an AI-powered tool designed for informational
              and educational purposes only. It does not provide medical advice, diagnosis, or treatment.
              AI systems can make errors. Always consult a qualified healthcare professional for medical decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- Sub-Components ---------------- */

function FeatureCard({ icon, title, description, isDark, delay }: any) {
  return (
    <div
      className={`group p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl perspective-container ${
        isDark
          ? "bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-blue-500/20"
          : "bg-white border-slate-100 hover:border-blue-100"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p
        className={`text-sm leading-relaxed ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function Metric({ value, label, isDark }: any) {
  return (
    <div className="group">
      <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 mb-4 group-hover:scale-110 transition-transform tracking-tighter">
        {value}
      </div>
      <div
        className={`text-xs font-black uppercase tracking-[0.2em] ${
          isDark ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {label}
      </div>
    </div>
  );
}