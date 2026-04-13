import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import UploadInterface from "./components/UploadInterface";
import ProcessingScreen from "./components/ProcessingScreen";
import ResultsDashboard from "./components/ResultsDashboard";
import HistoryDashboard from "./components/HistoryDashboard";
import HealthPlanView from "./components/HealthPlanView";
import CompareReports from "./components/CompareReports";
import { isAuthenticated, getUser, logout as apiLogout, setOnAuthError } from "./lib/api";

type Screen =
  | "landing"
  | "auth"
  | "upload"
  | "processing"
  | "results"
  | "history"
  | "healthplan"
  | "compare";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Compare state
  const [compareOldUid, setCompareOldUid] = useState<string>("");
  const [compareNewUid, setCompareNewUid] = useState<string>("");

  // 🌗 GLOBAL THEME STATE
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Check auth on mount
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user) setCurrentUser(user);
    }
  }, []);

  // Auto-logout on 401 from any API call
  useEffect(() => {
    setOnAuthError(() => {
      setCurrentUser(null);
      setAnalysisResult(null);
      setUploadedFile(null);
      setCurrentScreen("auth");
    });
  }, []);

  // -------------------------------
  // Navigation
  // -------------------------------

  const goToLanding = () => setCurrentScreen("landing");
  const goToAuth = () => setCurrentScreen("auth");
  const goToUpload = () => setCurrentScreen("upload");
  const goToResults = () => setCurrentScreen("results");
  const goToHistory = () => setCurrentScreen("history");
  const goToHealthPlan = () => setCurrentScreen("healthplan");

  const goToCompare = (oldUid: string, newUid: string) => {
    setCompareOldUid(oldUid);
    setCompareNewUid(newUid);
    setCurrentScreen("compare");
  };

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      goToUpload();
    } else {
      goToAuth();
    }
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    goToUpload();
  };

  const handleUploadComplete = (result: any, file: File) => {
    setUploadedFile(file);
    setAnalysisResult(result);
    setCurrentScreen("processing");
  };

  const handleLogout = () => {
    apiLogout();
    setCurrentUser(null);
    setAnalysisResult(null);
    setUploadedFile(null);
    goToLanding();
  };

  const resetFlow = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    if (isAuthenticated()) {
      goToUpload();
    } else {
      goToLanding();
    }
  };

  // -------------------------------
  // Render Controller
  // -------------------------------

  const renderScreen = () => {
    switch (currentScreen) {
      case "landing":
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            user={currentUser}
            onLogout={handleLogout}
          />
        );

      case "auth":
        return (
          <AuthScreen
            onAuthSuccess={handleAuthSuccess}
            onBack={goToLanding}
            isDarkMode={isDarkMode}
          />
        );

      case "upload":
        return (
          <UploadInterface
            onUploadComplete={handleUploadComplete}
            onBack={goToLanding}
            isDarkMode={isDarkMode}
            user={currentUser}
            onLogout={handleLogout}
          />
        );

      case "processing":
        return (
          <ProcessingScreen
            onComplete={goToResults}
            isDarkMode={isDarkMode}
          />
        );

      case "results":
        return (
          <ResultsDashboard
            uploadedFile={uploadedFile}
            result={analysisResult}
            onStartNew={resetFlow}
            isDarkMode={isDarkMode}
            onViewHistory={goToHistory}
            onViewHealthPlan={goToHealthPlan}
            user={currentUser}
            onLogout={handleLogout}
          />
        );

      case "history":
        return (
          <HistoryDashboard
            isDarkMode={isDarkMode}
            onBack={goToResults}
            onCompare={goToCompare}
            onViewReport={(report: any) => {
              setAnalysisResult(report.analysis_data);
              setUploadedFile(null);
              goToResults();
            }}
          />
        );

      case "healthplan":
        return (
          <HealthPlanView
            healthPlan={analysisResult?.health_plan || []}
            isDarkMode={isDarkMode}
            onBack={goToResults}
          />
        );

      case "compare":
        return (
          <CompareReports
            reportOldUid={compareOldUid}
            reportNewUid={compareNewUid}
            isDarkMode={isDarkMode}
            onBack={goToHistory}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen w-full overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-[#0F172A]" : "bg-slate-50"
      }`}
    >
      {renderScreen()}
    </div>
  );
}

export default App;