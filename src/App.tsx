import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Builder from "./components/Builder";
import Respondent from "./components/Respondent";
import Results from "./components/Results";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";

interface Toast {
  message: string;
  type: "success" | "info" | "error";
  id: number;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [route, setRoute] = useState<{ view: "dashboard" | "builder" | "results" | "respondent" | "login" | "signup"; id?: string }>({
    view: "dashboard",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Simple, powerful toast notifier helper
  const showNotification = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { message, type, id }]);

    // Dismiss toast automatically after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Synchronize state with URL hash
  const parseHash = () => {
    const hash = window.location.hash;
    if (hash.startsWith("#/builder/")) {
      const id = hash.replace("#/builder/", "");
      setRoute({ view: "builder", id });
    } else if (hash.startsWith("#/results/")) {
      const id = hash.replace("#/results/", "");
      setRoute({ view: "results", id });
    } else if (hash.startsWith("#/form/")) {
      const link = hash.replace("#/form/", "");
      setRoute({ view: "respondent", id: link });
    } else if (hash === "#/signup") {
      setRoute({ view: "signup" });
    } else if (hash === "#/login") {
      setRoute({ view: "login" });
    } else {
      setRoute({ view: "dashboard" });
    }
  };

  useEffect(() => {
    parseHash();
    window.addEventListener("hashchange", parseHash);
    return () => {
      window.removeEventListener("hashchange", parseHash);
    };
  }, []);

  // Route protection & redirection
  useEffect(() => {
    if (loading) return;

    const publicViews = ["dashboard", "builder", "results", "respondent", "login", "signup"];
    const isPublicRoute = publicViews.includes(route.view);

    if (!user && !isPublicRoute) {
      // Unauthenticated user attempting to access private page -> force login
      setRoute({ view: "login" });
      window.location.hash = "#/login";
    } else if (user && (route.view === "login" || route.view === "signup")) {
      // Logged-in user attempting to view auth page -> redirect home
      setRoute({ view: "dashboard" });
      window.location.hash = "#/";
    }
  }, [user, loading, route.view]);

  const handleNavigate = (path: string) => {
    window.location.hash = path ? `#/${path}` : "#/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-[#0d0d0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-neutral-900 dark:border-neutral-100 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-400 font-medium">Loading Formify...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d0d0f] text-[#191919] dark:text-[#f4f4f5] transition-colors duration-200">
      {/* Dynamic View Dispatcher */}
      {route.view === "login" && (
        <Login onNavigate={handleNavigate} showNotification={showNotification} />
      )}
      {route.view === "signup" && (
        <Signup onNavigate={handleNavigate} showNotification={showNotification} />
      )}
      {route.view === "dashboard" && (
        <Dashboard onNavigate={handleNavigate} showNotification={showNotification} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      )}
      {route.view === "builder" && route.id && (
        <Builder formId={route.id} onNavigate={handleNavigate} showNotification={showNotification} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      )}
      {route.view === "results" && route.id && (
        <Results formId={route.id} onNavigate={handleNavigate} showNotification={showNotification} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      )}
      {route.view === "respondent" && route.id && (
        <Respondent shareLink={route.id} showNotification={showNotification} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      )}

      {/* Elegant, Non-blocking Floating Toast Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center justify-between gap-3 pointer-events-auto animate-slide-up ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-neutral-900 border-neutral-800 text-white"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-current opacity-60 hover:opacity-100 font-bold px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
