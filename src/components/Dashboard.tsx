import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  BarChart2, 
  Settings, 
  Eye, 
  FileText, 
  RefreshCw, 
  Globe, 
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { Form } from "../types";
import { AskFeatureGif, ActFeatureGif, LearnFeatureGif } from "./InteractiveGifs";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface DashboardProps {
  onNavigate: (route: string) => void;
  showNotification: (msg: string, type?: "success" | "info" | "error") => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Dashboard({ onNavigate, showNotification, darkMode, onToggleDarkMode }: DashboardProps) {
  const { user, logout } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Guest Auth Prompt state
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState("");

  const checkAuthOrPrompt = (actionName: string): boolean => {
    if (!user) {
      setAuthPromptAction(actionName);
      setIsAuthPromptOpen(true);
      return false;
    }
    return true;
  };

  // Rename state
  const [renamingFormId, setRenamingFormId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState("");
  const [activeFeatureTab, setActiveFeatureTab] = useState<"ask" | "act" | "learn">("ask");

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/forms");
      if (!res.ok) throw new Error("Failed to load forms");
      const data = await res.json();
      setForms(data);
    } catch (err: any) {
      showNotification(err.message || "Error fetching forms", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    try {
      const res = await apiFetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newFormTitle.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create form");
      const data = await res.json();
      showNotification("Form created successfully!", "success");
      setIsCreateModalOpen(false);
      setNewFormTitle("");
      onNavigate(`builder/${data.id}`);
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleDuplicateForm = async (id: string) => {
    if (!checkAuthOrPrompt("duplicate this form")) return;
    try {
      const res = await apiFetch(`/api/forms/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to duplicate form");
      await fetchForms();
      showNotification("Form duplicated successfully!", "success");
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setActiveDropdownId(null);
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!checkAuthOrPrompt("delete this form")) return;
    if (!confirm("Are you sure you want to delete this form? This will remove all questions and submissions.")) return;
    try {
      const res = await apiFetch(`/api/forms/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete form");
      setForms(forms.filter((f) => f.id !== id));
      showNotification("Form deleted successfully", "success");
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setActiveDropdownId(null);
    }
  };

  const handleToggleStatus = async (form: Form) => {
    if (!checkAuthOrPrompt("toggle draft/published status")) return;
    const nextStatus = form.status === "published" ? "draft" : "published";
    try {
      const res = await apiFetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setForms(forms.map((f) => (f.id === form.id ? { ...f, status: updated.status } : f)));
      showNotification(
        `Form ${nextStatus === "published" ? "Published" : "reverted to Draft"}!`,
        "success"
      );
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!checkAuthOrPrompt("rename this form")) return;
    if (!renamingTitle.trim()) return;

    try {
      const res = await apiFetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renamingTitle.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename form");
      const updated = await res.json();
      setForms(forms.map((f) => (f.id === id ? { ...f, title: updated.title } : f)));
      setRenamingFormId(null);
      showNotification("Form renamed successfully", "success");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleResetDb = async () => {
    if (!checkAuthOrPrompt("re-seed the workspace database")) return;
    if (!confirm("This will reset all tables and re-seed sample data. Continue?")) return;
    try {
      const res = await apiFetch("/api/admin/reset", { method: "POST" });
      if (!res.ok) throw new Error("Failed to reset database");
      showNotification("Database re-seeded successfully!", "success");
      fetchForms();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const filteredForms = forms.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F3F3F1] dark:bg-[#121214] flex flex-col font-sans p-4 md:p-6 text-[#141414] dark:text-[#E4E4E7] transition-colors duration-200">
      {/* Top Banner/Header */}
      <header className="h-16 mb-6 flex items-center justify-between px-6 bg-white dark:bg-[#1C1C1E] border border-black dark:border-[#a78bfa] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] sticky top-0 z-20 transition-all duration-200">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate("")} id="logo-branding">
          <img 
            src={darkMode ? "/logo-dark.png" : "/logo-light.png"} 
            alt="Typeform" 
            className="h-7 md:h-8 object-contain transition-all" 
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 border border-black dark:border-[#a78bfa] bg-white dark:bg-[#2A2A2E] text-black dark:text-[#a78bfa] hover:bg-black hover:text-white dark:hover:bg-[#a78bfa] dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,1)] active:translate-x-[1px] active:translate-y-[1px]"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            id="theme-toggle"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleResetDb}
            className="px-3 py-1.5 border border-black dark:border-[#a78bfa] bg-white dark:bg-[#2A2A2E] text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-100 hover:bg-black hover:text-white dark:hover:bg-[#a78bfa] dark:hover:text-black flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.5)] active:translate-x-[1px] active:translate-y-[1px]"
            id="reset-db-btn"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Seed Data
          </button>
          <button
            onClick={() => {
              if (checkAuthOrPrompt("create a new form")) {
                setIsCreateModalOpen(true);
              }
            }}
            className="bg-[#A78BFA] hover:bg-[#8B5CF6] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] border border-black dark:border-black text-black dark:text-white hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 flex items-center gap-2 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
            id="new-form-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            Create form
          </button>

          {!user && (
            <div id="guest-nav-actions" className="flex items-center gap-2 pl-2 border-l border-neutral-300 dark:border-neutral-700">
              <button
                onClick={() => onNavigate("login")}
                className="px-3 py-1.5 border border-black dark:border-[#a78bfa] bg-white dark:bg-[#2A2A2E] text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-100 hover:bg-black hover:text-white dark:hover:bg-[#a78bfa] dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.5)] active:translate-x-[1px] active:translate-y-[1px]"
                id="nav-login-btn"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate("signup")}
                className="px-3 py-1.5 bg-[#A78BFA] hover:bg-[#8B5CF6] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] border border-black text-black dark:text-white hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                id="nav-signup-btn"
              >
                Sign Up
              </button>
            </div>
          )}

          {user && (
            <div id="user-profile-menu" className="flex items-center gap-2 pl-2 border-l border-neutral-300 dark:border-neutral-700">
              <div 
                className="w-8 h-8 rounded-full bg-[#a78bfa] dark:bg-[#8B5CF6] text-black dark:text-white flex items-center justify-center font-bold text-sm shadow-sm border border-black"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hidden sm:inline">
                {user.name.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] text-black dark:text-zinc-200 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] active:translate-x-[1px] active:translate-y-[1px] ml-1"
                title="Log Out"
                id="logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-sans font-black uppercase tracking-tight text-black dark:text-zinc-100">My Forms</h2>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1">Create surveys, quizzes, and forms with a bento conversational interface.</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-black dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1C1C1E] border border-black dark:border-zinc-700 text-xs font-semibold text-black dark:text-white placeholder-gray-500 focus:outline-none focus:bg-amber-50 dark:focus:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-all"
              id="search-input"
            />
          </div>
        </div>

        {/* Form List/Grid */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-black dark:text-zinc-300">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest font-mono">Loading workspace...</p>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="h-80 border border-dashed border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] flex flex-col items-center justify-center p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
            <div className="w-12 h-12 border border-black dark:border-zinc-700 bg-gray-50 dark:bg-[#2A2A2E] flex items-center justify-center text-black dark:text-[#a78bfa] mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold uppercase tracking-wider text-black dark:text-zinc-100 text-sm">No forms found</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mt-1">
              {searchQuery ? "No forms match your search query. Try another keyword!" : "Get started by creating your very first conversational experience."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  if (checkAuthOrPrompt("create a new form")) {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="mt-4 bg-black dark:bg-[#A78BFA] border border-black dark:border-black text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] text-[10px] font-bold uppercase tracking-wider px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,1)]"
                id="create-first-form-btn"
              >
                Create a Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => {
              const shareUrl = `${window.location.origin}/#/form/${form.shareLink}`;
              const dropdownOpen = activeDropdownId === form.id;

              return (
                <div
                  key={form.id}
                  id={`form-card-${form.id}`}
                  className="bg-white dark:bg-[#1C1C1E] border border-black dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(167,139,250,0.3)] hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all duration-200 flex flex-col justify-between group relative"
                >
                  {/* Top segment */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {/* Status badge */}
                      <span
                        onClick={() => handleToggleStatus(form)}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase border cursor-pointer select-none transition-colors ${
                          form.status === "published"
                            ? "bg-green-100 dark:bg-green-950/40 border-green-300 dark:border-green-800 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
                            : "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40"
                        }`}
                        title="Click to toggle Status"
                      >
                        {form.status === "published" ? "Published" : "Draft"}
                      </span>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(dropdownOpen ? null : form.id);
                          }}
                          className="p-1 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] hover:bg-black hover:text-white dark:hover:bg-[#a78bfa] dark:hover:text-black text-black dark:text-[#a78bfa] transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {dropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveDropdownId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1C1C1E] border border-black dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.3)] py-1 z-30 font-sans text-xs">
                              <button
                                onClick={() => {
                                  setRenamingFormId(form.id);
                                  setRenamingTitle(form.title);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black flex items-center gap-2 text-black dark:text-zinc-200 font-semibold"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Rename
                              </button>
                              <button
                                onClick={() => handleDuplicateForm(form.id)}
                                className="w-full text-left px-4 py-2 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black flex items-center gap-2 text-black dark:text-zinc-200 font-semibold"
                              >
                                <Copy className="w-3.5 h-3.5" /> Duplicate
                              </button>
                              <button
                                onClick={() => handleToggleStatus(form)}
                                className="w-full text-left px-4 py-2 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black flex items-center gap-2 text-black dark:text-zinc-200 font-semibold"
                              >
                                {form.status === "published" ? "Revert to Draft" : "Publish Form"}
                              </button>
                              <div className="border-t border-black dark:border-zinc-700 my-1" />
                              <button
                                onClick={() => handleDeleteForm(form.id)}
                                className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 flex items-center gap-2 font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Title & Rename input */}
                    {renamingFormId === form.id ? (
                      <form
                        onSubmit={(e) => handleRenameSubmit(e, form.id)}
                        className="flex items-center gap-1.5 mt-2"
                      >
                        <input
                          type="text"
                          value={renamingTitle}
                          onChange={(e) => setRenamingTitle(e.target.value)}
                          className="flex-1 text-xs font-bold uppercase border border-black dark:border-zinc-700 p-1 focus:outline-none bg-amber-50 dark:bg-[#2A2A2E] text-black dark:text-white"
                          autoFocus
                          onBlur={() => setRenamingFormId(null)}
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-black dark:bg-[#A78BFA] text-white dark:text-black border border-black dark:border-black text-[10px] font-bold uppercase tracking-widest"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <h3
                        onClick={() => onNavigate(`builder/${form.id}`)}
                        className="font-sans font-black text-black dark:text-zinc-100 text-sm uppercase tracking-tight cursor-pointer hover:underline line-clamp-1 mt-1"
                        title="Click to edit form"
                      >
                        {form.title}
                      </h3>
                    )}

                    {/* Meta stats */}
                    <div className="flex gap-4 mt-4 text-[10px] font-mono font-bold uppercase text-gray-500 dark:text-zinc-400 tracking-wider">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {form.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {form.submissionsCount || 0} responses
                      </span>
                    </div>
                  </div>

                  {/* Actions segment */}
                  <div className="border-t border-black dark:border-zinc-700 bg-[#F9F9F9] dark:bg-[#232326] px-5 py-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onNavigate(`builder/${form.id}`)}
                      className="text-[10px] text-black dark:text-zinc-200 font-black uppercase tracking-wider flex items-center gap-1 hover:underline"
                    >
                      <Settings className="w-3.5 h-3.5 text-black dark:text-[#a78bfa]" />
                      Edit Builder
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onNavigate(`results/${form.id}`)}
                        className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] text-black dark:text-zinc-200 hover:bg-black hover:text-white dark:hover:bg-[#a78bfa] dark:hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] active:translate-x-[1px] active:translate-y-[1px]"
                        title="View Results & Charts"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>

                      {form.status === "published" && (
                        <a
                          href={`/#/form/${form.shareLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] text-black dark:text-zinc-200 hover:bg-black hover:text-white dark:hover:bg-[#a78bfa] dark:hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                          title="Open Live Public Form"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- TYPEFORM AI & AUTOMATION LANDING SECTION --- */}
        <div className="mt-16 pt-12 border-t-4 border-black">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="bg-[#F3E8FF] text-[#6B21A8] border border-[#6B21A8] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block mb-3 animate-bounce">
                Platform Update
              </span>
              <h2 className="text-3xl md:text-4xl font-sans font-black uppercase tracking-tight text-black dark:text-[#f4f4f5] flex items-center gap-2">
                AI Forms & Automation <Sparkles className="w-6 h-6 text-[#A855F7] fill-purple-300 animate-pulse" />
              </h2>
              <p className="text-xs text-gray-700 dark:text-[#9f9fa9] max-w-2xl mt-1.5 font-semibold">
                Combine conversational AI forms and automated workflows to drive revenue growth. Run in-depth research and manage your customer lifecycle. All in Typeform.
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  if (checkAuthOrPrompt("get started with forms")) {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="bg-[#C084FC] hover:bg-[#A855F7] border-2 border-black text-black text-xs font-black uppercase tracking-wider px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px]"
              >
                Get started—it’s free
              </button>
            </div>
          </div>

          {/* Quick Pillars Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* PILLAR 1: ASK */}
            <div
              onClick={() => setActiveFeatureTab("ask")}
              className={`p-6 border-2 border-black dark:border-zinc-700 cursor-pointer transition-all duration-200 relative group ${
                activeFeatureTab === "ask"
                  ? "bg-white dark:bg-[#1C1C1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(167,139,250,0.3)] -translate-x-1 -translate-y-1"
                  : "bg-[#F9F9F7] dark:bg-[#18181B] hover:bg-white dark:hover:bg-[#1C1C1E] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]"
              }`}
            >
              <div className="absolute top-4 right-4 bg-black dark:bg-zinc-800 text-white dark:text-zinc-200 font-mono text-[9px] font-black px-1.5 py-0.5">
                ASK
              </div>
              <div className="w-10 h-10 bg-[#E8F5E9] dark:bg-emerald-950/40 border border-black dark:border-zinc-700 flex items-center justify-center text-black dark:text-[#a78bfa] mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-black text-sm uppercase tracking-wider text-black dark:text-zinc-100">Intelligent Forms</h3>
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 font-semibold">
                Build forms that adapt to every respondent and then analyze your data for rich insights.
              </p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#2E7D32] dark:text-emerald-400">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* PILLAR 2: ACT */}
            <div
              onClick={() => setActiveFeatureTab("act")}
              className={`p-6 border-2 border-black dark:border-zinc-700 cursor-pointer transition-all duration-200 relative group ${
                activeFeatureTab === "act"
                  ? "bg-white dark:bg-[#1C1C1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(167,139,250,0.3)] -translate-x-1 -translate-y-1"
                  : "bg-[#F9F9F7] dark:bg-[#18181B] hover:bg-white dark:hover:bg-[#1C1C1E] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]"
              }`}
            >
              <div className="absolute top-4 right-4 flex gap-1 items-center">
                <span className="bg-[#E3F2FD] dark:bg-blue-950/40 text-[#1565C0] dark:text-blue-400 border border-[#1565C0] dark:border-blue-800 text-[8px] font-black px-1 py-0.2">NEW</span>
                <span className="bg-black dark:bg-zinc-800 text-white dark:text-zinc-200 font-mono text-[9px] font-black px-1.5 py-0.5">ACT</span>
              </div>
              <div className="w-10 h-10 bg-[#E3F2FD] dark:bg-blue-950/40 border border-black dark:border-zinc-700 flex items-center justify-center text-black dark:text-[#a78bfa] mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-black text-sm uppercase tracking-wider text-black dark:text-zinc-100">Growth Flow</h3>
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 font-semibold">
                Convert and keep customers with automated AI segmentation and follow-ups.
              </p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#1565C0] dark:text-blue-400">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* PILLAR 3: LEARN */}
            <div
              onClick={() => setActiveFeatureTab("learn")}
              className={`p-6 border-2 border-black dark:border-zinc-700 cursor-pointer transition-all duration-200 relative group ${
                activeFeatureTab === "learn"
                  ? "bg-white dark:bg-[#1C1C1E] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(167,139,250,0.3)] -translate-x-1 -translate-y-1"
                  : "bg-[#F9F9F7] dark:bg-[#18181B] hover:bg-white dark:hover:bg-[#1C1C1E] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]"
              }`}
            >
              <div className="absolute top-4 right-4 flex gap-1 items-center">
                <span className="bg-[#F3E8FF] dark:bg-purple-950/40 text-[#7E22CE] dark:text-purple-400 border border-[#7E22CE] dark:border-purple-800 text-[8px] font-black px-1.5 py-0.2">NEW</span>
                <span className="bg-black dark:bg-zinc-800 text-white dark:text-zinc-200 font-mono text-[9px] font-black px-1.5 py-0.5">LEARN</span>
              </div>
              <div className="w-10 h-10 bg-[#F3E8FF] dark:bg-purple-950/40 border border-black dark:border-zinc-700 flex items-center justify-center text-black dark:text-[#a78bfa] mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-black text-sm uppercase tracking-wider text-black dark:text-zinc-100">Research Flow</h3>
              <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 font-semibold">
                Make confident business decisions fast with AI-moderated studies and automated reports.
              </p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#7E22CE]">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Deep Dive Bento Section based on Active Tab */}
          <div className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(167,139,250,0.15)] mb-12">
            {activeFeatureTab === "ask" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 pb-6 border-b-2 border-black dark:border-zinc-700">
                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#2E7D32] bg-[#E8F5E9] dark:bg-emerald-950/40 px-2.5 py-0.5 border border-[#2E7D32] dark:border-emerald-800">
                        INTELLIGENT FORMS
                      </span>
                      <h3 className="text-xl md:text-2xl font-sans font-black uppercase tracking-tight text-black dark:text-zinc-100 mt-2">
                        Build forms at the drop of a prompt
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-zinc-300 mt-2 font-semibold leading-relaxed">
                        With over 48 million responses collected monthly, Typeform AI builds best-in-class forms proven to get 3.5x more data. Brand easily, customize everything.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-6 self-start bg-black dark:bg-[#A78BFA] hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] text-white dark:text-black border border-black dark:border-black text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,1)] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      Explore forms
                    </button>
                  </div>
                  <div className="lg:col-span-7">
                    <AskFeatureGif darkMode={!!darkMode} />
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Item 1 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">01</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">High Response Rate</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Build forms people actually fill out with beautiful design and conversational logic that adapts to every response, doubling the completion rate vs. traditional forms.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">02</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Deeper Insights</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Get rich answers with video and audio responses, plus extra context from AI-generated follow-up questions that adapt as people complete your form.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">03</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Advanced Analytics</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Dig into both qualitative and quantitative data with topic and sentiment analysis, respondent comparison, and form drop-off analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "act" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 pb-6 border-b-2 border-black dark:border-zinc-700">
                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#1565C0] bg-[#E3F2FD] dark:bg-blue-950/40 px-2.5 py-0.5 border border-[#1565C0] dark:border-blue-800">
                          GROWTH FLOW
                        </span>
                        <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.2 uppercase border border-black">NEW</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-sans font-black uppercase tracking-tight text-black dark:text-zinc-100 mt-2">
                        Be proactive with customer data
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono font-bold mt-1 uppercase tracking-wide">
                        When the form ends, the flow begins...
                      </p>
                      <p className="text-xs text-gray-600 dark:text-zinc-300 mt-2 font-semibold leading-relaxed">
                        Set up automations that convert and keep customers for you. As opportunities arise, Growth Flow steps in to enrich leads, create segments, and send personalized messages.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-6 self-start bg-black dark:bg-[#A78BFA] hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] text-white dark:text-black border border-black dark:border-black text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,1)] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      Explore Growth Flow
                    </button>
                  </div>
                  <div className="lg:col-span-7">
                    <ActFeatureGif darkMode={!!darkMode} />
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Item 1 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">01</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Instant Lead Capture</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Close deals directly in your forms. Capture e-signatures, schedule meetings with Google Calendar and Calendly, and accept payments with Stripe and Paypal.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">02</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Data Enrichment</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Enrich data to complete customer profiles, with industry-leading match rates of up to 92% for B2B companies and 71% for B2C companies.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">03</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Customer Engagement</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Follow up instantly across email, SMS, and your favorite tools. Trigger personalized workflows from any form submission or contact update.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === "learn" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8 pb-6 border-b-2 border-black dark:border-zinc-700">
                  <div className="lg:col-span-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#7E22CE] bg-[#F3E8FF] dark:bg-purple-950/40 px-2.5 py-0.5 border border-[#7E22CE] dark:border-purple-800">
                          RESEARCH FLOW
                        </span>
                        <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.2 uppercase border border-black">NEW</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-sans font-black uppercase tracking-tight text-black dark:text-zinc-100 mt-2">
                        Run fast research, moderated by AI
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-zinc-300 mt-2 font-semibold leading-relaxed">
                        Make data-backed business decisions with Research Flow. It builds your research study, conducts 1000s of AI-moderated interviews at once, and analyzes the findings. Fast.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (checkAuthOrPrompt("explore research flow")) {
                          setIsCreateModalOpen(true);
                        }
                      }}
                      className="mt-6 self-start bg-black dark:bg-[#A78BFA] hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] text-white dark:text-black border border-black dark:border-black text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,1)] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      Explore Research Flow
                    </button>
                  </div>
                  <div className="lg:col-span-7">
                    <LearnFeatureGif darkMode={!!darkMode} />
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Item 1 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">01</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Fast Insights</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Get insights in hours, not weeks. AI handles recruiting, moderating, and synthesizing research studies from start to finish, so you uncover deep insights at light speed.
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">02</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Qualitative & Quantitative</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Run AI-moderated text, video, and voice interviews at survey scale and in one platform. Capture tone, hesitation, and the reasoning behind every answer.
                    </p>
                  </div>

                  {/* Item 3 */}
                  <div className="p-5 border border-black dark:border-zinc-700 bg-[#FDFDFD] dark:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.1)]">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/40 border border-black dark:border-zinc-700 text-black dark:text-[#a78bfa] flex items-center justify-center font-bold text-xs mb-3">03</div>
                    <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100">Verified Panel Recruitment</h4>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      Get the best possible insights. Use 400+ targeting criteria to reach the right audience, with built-in incentive management so you need fewer tools.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Platform Footer Banner */}
          <div className="bg-black text-white p-8 border-2 border-black dark:border-[#a78bfa] text-center relative overflow-hidden mb-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(167,139,250,0.3)]">
            <div className="relative z-10">
              <h4 className="font-sans font-black text-lg md:text-xl uppercase tracking-wider">
                AI forms and automation. All in Typeform.
              </h4>
              <p className="text-[11px] text-gray-400 font-mono mt-1 uppercase tracking-widest">
                Drive revenue growth & accelerate research at lightspeed.
              </p>
              <button
                onClick={() => {
                  if (checkAuthOrPrompt("create a new form")) {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="mt-5 bg-[#C084FC] hover:bg-[#A855F7] border border-black text-black text-xs font-black uppercase tracking-wider px-6 py-2.5 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] dark:shadow-[3px_3px_0px_0px_rgba(167,139,250,1)] transition-all"
              >
                Create an AI Form
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1C1C1E] border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(167,139,250,0.3)] max-w-md w-full p-6 relative">
            <h3 className="font-sans font-black uppercase tracking-tight text-base text-black dark:text-zinc-100">Create a new form</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Give your form a title. You can always rename it or change its theme later.
            </p>

            <form onSubmit={handleCreateForm} className="mt-5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
                Form Title
              </label>
              <input
                type="text"
                placeholder="e.g. Employee Onboarding Survey"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] text-xs font-semibold text-black dark:text-white focus:outline-none focus:bg-amber-50 dark:focus:bg-[#2A2A2E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] mb-5"
                required
                autoFocus
                id="modal-form-title-input"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-black dark:border-zinc-700 text-black dark:text-zinc-200 hover:bg-black dark:hover:bg-zinc-800 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors bg-white dark:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black dark:bg-[#A78BFA] border border-black dark:border-black text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.5)]"
                  id="modal-form-submit-btn"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Mode Restriction Auth Prompt Modal */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 bg-black/55 dark:bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1C1C1E] border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(167,139,250,0.3)] max-w-sm w-full p-6 relative flex flex-col items-center text-center">
            {/* Warning Sign */}
            <div className="w-12 h-12 border border-black dark:border-zinc-700 bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="font-sans font-black uppercase tracking-wider text-sm text-black dark:text-zinc-100">
              Sign In Required
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 font-semibold leading-relaxed">
              You are currently in guest mode. To <strong className="text-black dark:text-white font-black">{authPromptAction}</strong>, please sign in or create an account.
            </p>

            {/* Demo user helper badge inside the popup for instant test usage */}
            <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl text-left w-full text-[10px] text-indigo-700 dark:text-indigo-300">
              <div className="font-bold flex items-center gap-1 mb-1">
                <span>✨ Instant Demo Access:</span>
              </div>
              <div className="font-mono">Email/Username: <span className="font-bold text-neutral-900 dark:text-white">nix</span></div>
              <div className="font-mono">Password: <span className="font-bold text-neutral-900 dark:text-white">123</span></div>
            </div>

            <div className="flex flex-col gap-2 w-full mt-5">
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => onNavigate("login")}
                  className="flex-1 py-2 bg-[#A78BFA] hover:bg-[#8B5CF6] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] border border-black dark:border-black text-black dark:text-white hover:text-white text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
                  id="prompt-login-btn"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate("signup")}
                  className="flex-1 py-2 bg-black text-white dark:bg-zinc-800 hover:bg-neutral-800 dark:hover:bg-zinc-700 border border-black dark:border-black text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
                  id="prompt-signup-btn"
                >
                  Sign Up
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsAuthPromptOpen(false)}
                className="w-full py-2 border border-black dark:border-zinc-700 text-black dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-[#1C1C1E] transition-colors"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
