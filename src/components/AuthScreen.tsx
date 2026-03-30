import { useState } from "react";
import {
  Activity,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { signup, login } from "../lib/api";

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export default function AuthScreen({
  onAuthSuccess,
  onBack,
  isDarkMode,
}: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await login(email, password);
      } else {
        if (!fullName.trim()) {
          setError("Please enter your full name");
          setLoading(false);
          return;
        }
        data = await signup(email, password, fullName);
      }
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-5 py-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-300 outline-none ${
    isDarkMode
      ? "bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-800"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
  }`;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* ANIMATED BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[180px] animate-pulse delay-500" />
      </div>

      {/* DNA HELIX 3D ANIMATION */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: `${50 + Math.sin(i * 0.6) * 15}%`,
              top: `${(i / 20) * 100}%`,
              background: i % 2 === 0 ? "#3b82f6" : "#10b981",
              animation: `float ${3 + (i % 3)}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.15}s`,
              transform: `scale(${0.5 + Math.sin(i * 0.3) * 0.5})`,
            }}
          />
        ))}
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className={`absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all hover:opacity-70 ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <span>←</span> Back
      </button>

      {/* AUTH CARD */}
      <div className="relative z-10 w-full max-w-md">
        {/* LOGO */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 hover:rotate-6 transition-transform duration-500">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Medi<span className="text-blue-500">Q</span>
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            {isLogin ? "Welcome back! Sign in to continue." : "Create your account to get started."}
          </p>
        </div>

        {/* FORM CARD */}
        <div
          className={`rounded-[2.5rem] p-8 md:p-10 border transition-all duration-500 ${
            isDarkMode
              ? "bg-slate-900/70 backdrop-blur-xl border-slate-800 shadow-2xl shadow-black/20"
              : "bg-white/80 backdrop-blur-xl border-slate-200 shadow-2xl shadow-slate-200/50"
          }`}
        >
          {/* TAB TOGGLE */}
          <div
            className={`flex p-1.5 rounded-2xl mb-8 ${
              isDarkMode ? "bg-slate-800" : "bg-slate-100"
            }`}
          >
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                isLogin
                  ? isDarkMode
                    ? "bg-slate-700 text-white shadow-lg"
                    : "bg-white text-blue-600 shadow-lg"
                  : "text-slate-400"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isLogin
                  ? isDarkMode
                    ? "bg-slate-700 text-white shadow-lg"
                    : "bg-white text-blue-600 shadow-lg"
                  : "text-slate-400"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME (signup only) */}
            {!isLogin && (
              <div className="relative group">
                <User
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    isDarkMode ? "text-slate-500 group-focus-within:text-blue-400" : "text-slate-400 group-focus-within:text-blue-500"
                  }`}
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className={`${inputClass} pl-12`}
                  required={!isLogin}
                />
              </div>
            )}

            {/* EMAIL */}
            <div className="relative group">
              <Mail
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  isDarkMode ? "text-slate-500 group-focus-within:text-blue-400" : "text-slate-400 group-focus-within:text-blue-500"
                }`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className={`${inputClass} pl-12`}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <Lock
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                  isDarkMode ? "text-slate-500 group-focus-within:text-blue-400" : "text-slate-400 group-focus-within:text-blue-500"
                }`}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`${inputClass} pl-12 pr-12`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                  isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                loading
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.98]"
              } text-white`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* TRUST BADGES */}
        <div className="flex items-center justify-center gap-6 mt-8 opacity-40">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Encrypted
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-blue-500" /> AI-Powered
          </div>
        </div>
      </div>
    </div>
  );
}
