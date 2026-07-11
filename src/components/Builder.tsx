import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Eye, 
  Settings, 
  Palette, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileText,
  Mail,
  Hash,
  Star,
  ToggleLeft,
  List,
  Layers,
  CheckCircle,
  BarChart2,
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  AlertCircle
} from "lucide-react";
import { Form, Question, FormTheme, QuestionLogic } from "../types";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { Logo } from "./Logo";

interface BuilderProps {
  formId: string;
  onNavigate: (route: string) => void;
  showNotification: (msg: string, type?: "success" | "info" | "error") => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const QUESTION_TYPES = [
  { value: "short_text", label: "Short Text", icon: FileText, color: "bg-blue-50 text-blue-600" },
  { value: "long_text", label: "Long Text", icon: FileText, color: "bg-indigo-50 text-indigo-600" },
  { value: "multiple_choice", label: "Multiple Choice", icon: List, color: "bg-purple-50 text-purple-600" },
  { value: "dropdown", label: "Dropdown", icon: ChevronDown, color: "bg-pink-50 text-pink-600" },
  { value: "email", label: "Email", icon: Mail, color: "bg-emerald-50 text-emerald-600" },
  { value: "number", label: "Number", icon: Hash, color: "bg-orange-50 text-orange-600" },
  { value: "yes_no", label: "Yes/No", icon: ToggleLeft, color: "bg-teal-50 text-teal-600" },
  { value: "rating", label: "Rating", icon: Star, color: "bg-amber-50 text-amber-600" },
];

const PRESET_THEMES = [
  { name: "Standard White", backgroundColor: "#ffffff", textColor: "#191919", buttonColor: "#000000", buttonTextColor: "#ffffff" },
  { name: "Soft Charcoal", backgroundColor: "#1e1e24", textColor: "#f5f5f5", buttonColor: "#4f46e5", buttonTextColor: "#ffffff" },
  { name: "Cosmic Navy", backgroundColor: "#0b132b", textColor: "#ffffff", buttonColor: "#3a86c8", buttonTextColor: "#ffffff" },
  { name: "Warm Cream", backgroundColor: "#fdf8f5", textColor: "#2d1b10", buttonColor: "#c27438", buttonTextColor: "#ffffff" },
  { name: "Minty Fresh", backgroundColor: "#f0fdf4", textColor: "#166534", buttonColor: "#15803d", buttonTextColor: "#ffffff" },
];

export default function Builder({ formId, onNavigate, showNotification, darkMode, onToggleDarkMode }: BuilderProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Guest Restriction State
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
  
  // Right tabs
  const [rightTab, setRightTab] = useState<"settings" | "design" | "logic">("settings");
  
  // Quick adds
  const [showAddMenu, setShowAddMenu] = useState(false);

  const fetchFormDetails = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/forms/${formId}`);
      if (!res.ok) throw new Error("Failed to load form details");
      const data = await res.json();
      setForm(data);
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setSelectedQuestionId(data.questions[0].id);
      }
    } catch (err: any) {
      showNotification(err.message || "Error fetching form details", "error");
      onNavigate(""); // Go back to dashboard on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormDetails();
  }, [formId]);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  // Form Metadata changes
  const handleUpdateForm = async (updates: Partial<Form>) => {
    if (!checkAuthOrPrompt("modify form properties")) return;
    if (!form) return;
    const previousForm = { ...form };
    setForm({ ...form, ...updates } as Form);

    try {
      const res = await apiFetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update form properties");
    } catch (err: any) {
      setForm(previousForm); // Rollback
      showNotification(err.message, "error");
    }
  };

  // Question manipulation
  const handleAddQuestion = async (type: Question["type"]) => {
    if (!checkAuthOrPrompt("add a new question")) return;
    setShowAddMenu(false);
    try {
      const res = await apiFetch(`/api/forms/${formId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to add question");
      const newQ = await res.json();
      const updatedQuestions = [...questions, newQ];
      setQuestions(updatedQuestions);
      setSelectedQuestionId(newQ.id);
      showNotification(`Added ${type.replace("_", " ")} question!`, "success");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleUpdateQuestion = async (qId: string, updates: Partial<Question>) => {
    if (!checkAuthOrPrompt("modify this question")) return;
    setQuestions(questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)));

    try {
      const res = await apiFetch(`/api/questions/${qId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to sync question updates");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!checkAuthOrPrompt("delete this question")) return;
    try {
      const res = await apiFetch(`/api/questions/${qId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete question");
      
      const filtered = questions.filter((q) => q.id !== qId);
      // Reorder indexes locally
      const reordered = filtered.map((q, idx) => ({ ...q, orderIndex: idx }));
      setQuestions(reordered);
      
      if (selectedQuestionId === qId) {
        setSelectedQuestionId(reordered.length > 0 ? reordered[0].id : null);
      }
      showNotification("Question deleted successfully", "info");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  const handleMoveQuestion = async (index: number, direction: "up" | "down") => {
    if (!checkAuthOrPrompt("reorder questions")) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const reorderedQuestions = [...questions];
    
    // Swap order
    const temp = reorderedQuestions[index];
    reorderedQuestions[index] = reorderedQuestions[targetIdx];
    reorderedQuestions[targetIdx] = temp;

    // Adjust indices
    const normalized = reorderedQuestions.map((q, idx) => ({ ...q, orderIndex: idx }));
    setQuestions(normalized);

    try {
      const res = await apiFetch(`/api/forms/${formId}/questions/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: normalized.map((q) => q.id) }),
      });
      if (!res.ok) throw new Error("Failed to save reordered questions");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  // Option lists helpers (for MC / Dropdown)
  const handleAddOption = (q: Question) => {
    const currentOptions = q.options || [];
    const newOption = `Option ${currentOptions.length + 1}`;
    handleUpdateQuestion(q.id, { options: [...currentOptions, newOption] });
  };

  const handleRemoveOption = (q: Question, optIdx: number) => {
    const currentOptions = q.options || [];
    if (currentOptions.length <= 1) {
      showNotification("Questions require at least one choice option", "info");
      return;
    }
    const filtered = currentOptions.filter((_, idx) => idx !== optIdx);
    handleUpdateQuestion(q.id, { options: filtered });
  };

  const handleOptionChange = (q: Question, optIdx: number, val: string) => {
    const currentOptions = [...(q.options || [])];
    currentOptions[optIdx] = val;
    handleUpdateQuestion(q.id, { options: currentOptions });
  };

  const handleCopyShareLink = () => {
    if (!form) return;
    const shareUrl = `${window.location.origin}/#/form/${form.shareLink}`;
    navigator.clipboard.writeText(shareUrl);
    showNotification("Share Link copied to clipboard!", "success");
  };

  if (loading || !form) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-[#0d0d0f] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-black dark:text-[#a78bfa]" />
        <p className="text-sm text-gray-500 dark:text-zinc-400 font-mono">Loading form builder...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F3F3F1] dark:bg-[#09090b] flex flex-col overflow-hidden font-sans select-none p-4 text-[#141414] dark:text-[#f4f4f5] gap-4">
      {!user && (
        <div id="guest-builder-banner" className="bg-amber-50 dark:bg-amber-950/20 border-2 border-black dark:border-amber-500/30 text-black dark:text-amber-200 px-4 py-2 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[11px] font-semibold tracking-wide select-text shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300 animate-pulse shrink-0" />
            <span>
              <strong>GUEST MODE (READ-ONLY)</strong>: You are viewing this builder as a guest. All edits, creations, and theme customizations are restricted until you register.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4 font-bold uppercase tracking-wider">
            <button
              onClick={() => onNavigate("login")}
              className="bg-[#A78BFA] hover:bg-[#8B5CF6] text-black hover:text-white px-2.5 py-1 border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] text-[10px]"
            >
              Log In
            </button>
            <button
              onClick={() => onNavigate("signup")}
              className="bg-black text-white hover:bg-neutral-800 px-2.5 py-1 border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] text-[10px]"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1C1C1E] border border-black dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("")}
            className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] text-black dark:text-zinc-200 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-colors shrink-0"
            title="Go to Workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => onNavigate("")} id="logo-branding">
            <Logo 
              darkMode={darkMode} 
              className="h-6 md:h-7 transition-all" 
            />
          </div>

          <span className="text-gray-400 hidden sm:inline">/</span>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleUpdateForm({ title: e.target.value })}
              className="font-sans font-black text-xs uppercase tracking-wider text-black dark:text-zinc-100 focus:outline-none bg-amber-50 dark:bg-[#2A2A2E] px-2.5 py-1 border border-black dark:border-zinc-700 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] max-w-xs md:max-w-md transition-all"
              title="Click to rename"
            />
            <span
              className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 border border-black dark:border-zinc-700 ${
                form.status === "published"
                  ? "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400"
                  : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400"
              }`}
            >
              {form.status}
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {form.status === "published" ? (
            <button
              onClick={() => handleUpdateForm({ status: "draft" })}
              className="px-3.5 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] active:translate-x-[1px] active:translate-y-[1px]"
            >
              Revert to Draft
            </button>
          ) : (
            <button
              onClick={() => handleUpdateForm({ status: "published" })}
              className="px-3.5 py-1.5 border border-black dark:border-zinc-700 bg-black dark:bg-[#A78BFA] text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.5)] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
            >
              Publish
            </button>
          )}

          <button
            onClick={() => onNavigate(`results/${form.id}`)}
            className="px-3.5 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
            title="Analyze responses"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Results</span>
          </button>

          <div className="border-l border-black dark:border-zinc-700 h-6 mx-1" />

          {/* Copyable Share URL */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-black dark:bg-[#A78BFA] border border-black dark:border-black text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.5)] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
              title="Copy public respondent link"
            >
              Copy Link
            </button>
            {form.status === "published" && (
              <a
                href={`/#/form/${form.shareLink}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] text-black dark:text-zinc-200 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center"
                title="View live respondent flow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#2A2A2E] text-black dark:text-[#a78bfa] hover:bg-black hover:text-white dark:hover:bg-[#a78bfa] dark:hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}

            {user && (
              <div id="builder-user-menu" className="flex items-center gap-1.5 pl-1.5 border-l border-neutral-300 dark:border-neutral-700">
                <div 
                  className="w-7 h-7 rounded-full bg-[#a78bfa] dark:bg-[#8B5CF6] text-black dark:text-white flex items-center justify-center font-bold text-xs shadow-sm border border-black shrink-0"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hidden md:inline">
                  {user.name.split(" ")[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Builder Grid */}
      <div className="flex-1 flex overflow-hidden gap-4">
        {/* Left Sidebar: Questions list */}
        <div className="w-72 bg-white dark:bg-[#1C1C1E] border border-black dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-black dark:border-zinc-700 flex items-center justify-between shrink-0">
            <span className="font-sans font-black text-xs text-black dark:text-zinc-100 uppercase tracking-wider">
              Questions ({questions.length})
            </span>
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="px-3 py-1.5 border border-black dark:border-black bg-black dark:bg-[#A78BFA] text-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-[#8B5CF6] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
                id="add-question-btn"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>

              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowAddMenu(false)} />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-[#1C1C1E] border border-black dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.3)] py-1.5 z-30 font-sans text-xs max-h-80 overflow-y-auto animate-fade-in">
                    <p className="px-3 py-1 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest text-[9px] border-b border-black dark:border-zinc-700 mb-1">
                      Select question type
                    </p>
                    {QUESTION_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => handleAddQuestion(type.value as Question["type"])}
                          className="w-full text-left px-3 py-2 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black flex items-center gap-2.5 text-black dark:text-zinc-200 font-semibold"
                        >
                          <span className={`p-1 border border-black dark:border-zinc-700 rounded-sm bg-white dark:bg-zinc-800 text-black dark:text-zinc-200`}>
                            <Icon className="w-3.5 h-3.5 text-current" />
                          </span>
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-black dark:text-zinc-400">
                <Layers className="w-8 h-8 mb-2 stroke-1 text-black dark:text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-wider">Your form is empty.</p>
                <button
                  onClick={() => setShowAddMenu(true)}
                  className="mt-2 text-xs font-black uppercase text-indigo-600 dark:text-[#a78bfa] hover:underline"
                >
                  Create a question
                </button>
              </div>
            ) : (
              questions.map((q, idx) => {
                const isSelected = q.id === selectedQuestionId;
                const typeInfo = QUESTION_TYPES.find((t) => t.value === q.type) || QUESTION_TYPES[0];
                const Icon = typeInfo.icon;

                return (
                  <div
                    key={q.id}
                    id={`builder-q-card-${q.id}`}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-3 border text-left cursor-pointer transition-all duration-150 group flex items-start gap-2.5 ${
                      isSelected
                        ? "border-black dark:border-zinc-700 bg-black dark:bg-[#A78BFA] text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)]"
                        : "border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] hover:bg-amber-50 dark:hover:bg-[#2A2A2E] text-black dark:text-zinc-200 hover:translate-x-[1px] hover:translate-y-[1px]"
                    }`}
                  >
                    {/* Index & icon */}
                    <div className="flex flex-col items-center justify-center shrink-0 mt-0.5">
                      <span className={`text-[10px] font-mono font-bold mb-1 ${isSelected ? "text-gray-300 dark:text-zinc-800" : "text-gray-400 dark:text-zinc-500"}`}>
                        {idx + 1}
                      </span>
                      <span className={`p-1 border rounded-sm ${isSelected ? "bg-white text-black border-white" : "bg-white dark:bg-[#2A2A2E] text-black dark:text-[#a78bfa] border-black dark:border-zinc-700"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-bold uppercase tracking-tight line-clamp-1 ${isSelected ? "text-white dark:text-black" : "text-black dark:text-zinc-200"}`}>
                        {q.title || "Untitled question"}
                      </p>
                      <p className={`text-[9px] font-mono mt-0.5 uppercase font-bold tracking-wider ${isSelected ? "text-gray-300 dark:text-zinc-700" : "text-gray-500 dark:text-zinc-400"}`}>
                        {q.type.replace("_", " ")} {q.required && "• Required"}
                      </p>
                    </div>

                    {/* Move controls inside list */}
                    <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-0.5 shrink-0 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveQuestion(idx, "up");
                        }}
                        disabled={idx === 0}
                        className={`p-0.5 border border-black dark:border-zinc-700 rounded-sm disabled:opacity-30 ${isSelected ? "bg-white text-black hover:bg-amber-100 dark:hover:bg-zinc-200" : "bg-white dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-black dark:hover:bg-black hover:text-white dark:hover:text-white"}`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveQuestion(idx, "down");
                        }}
                        disabled={idx === questions.length - 1}
                        className={`p-0.5 border border-black rounded-sm disabled:opacity-30 ${isSelected ? "bg-white text-black hover:bg-amber-100" : "bg-white text-black hover:bg-black hover:text-white"}`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Live Preview Pane */}
        <div className="flex-1 bg-white dark:bg-[#121214] border border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(167,139,250,0.15)] p-6 md:p-12 overflow-y-auto flex items-center justify-center relative">
          <div className="absolute top-4 left-4 bg-amber-50 dark:bg-zinc-800 px-3 py-1 border border-black dark:border-zinc-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live Form Preview Canvas
          </div>

          {selectedQuestion ? (
            <div
              className="max-w-2xl w-full bg-white dark:bg-zinc-900 border border-black dark:border-zinc-700 p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: form.theme.backgroundColor,
                color: form.theme.textColor,
              }}
            >
              {/* Index marker */}
              <div className="flex items-center gap-2 mb-6 font-mono text-xs font-semibold">
                <span style={{ color: form.theme.buttonColor }} className="font-bold">
                  {questions.indexOf(selectedQuestion) + 1}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>

              {/* Title & Description */}
              <h2 className="font-sans font-black uppercase text-xl md:text-2xl leading-snug tracking-tight mb-2">
                {selectedQuestion.title || "Your question title..."}
                {selectedQuestion.required && <span className="text-red-500 ml-1">*</span>}
              </h2>

              {selectedQuestion.description && (
                <p className="text-xs opacity-85 mb-8 max-w-lg leading-relaxed font-semibold">
                  {selectedQuestion.description}
                </p>
              )}

              {/* Dynamic Field Inputs based on type */}
              <div className="mb-8 min-h-24">
                {selectedQuestion.type === "short_text" && (
                  <input
                    type="text"
                    disabled
                    placeholder="Type your answer here..."
                    className="w-full text-sm border-b border-black dark:border-zinc-600 py-2.5 focus:outline-none opacity-50 bg-transparent text-black dark:text-zinc-200"
                  />
                )}

                {selectedQuestion.type === "long_text" && (
                  <textarea
                    disabled
                    rows={3}
                    placeholder="Type your long answer here..."
                    className="w-full text-sm border-b border-black dark:border-zinc-600 py-2.5 focus:outline-none opacity-50 bg-transparent resize-none text-black dark:text-zinc-200"
                  />
                )}

                {selectedQuestion.type === "multiple_choice" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md text-black dark:text-zinc-200">
                    {(selectedQuestion.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="px-4 py-3 border border-black dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 text-xs font-bold uppercase tracking-wide flex items-center gap-3 opacity-90 hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-all cursor-pointer"
                      >
                        <span
                          className="w-5 h-5 border border-black dark:border-zinc-700 text-[10px] font-mono flex items-center justify-center bg-white dark:bg-zinc-900 text-black dark:text-zinc-200 shrink-0"
                          style={{ borderColor: form.theme.buttonColor }}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedQuestion.type === "dropdown" && (
                  <div className="max-w-xs border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200 flex items-center justify-between opacity-90">
                    <span>Select an option...</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                )}

                {selectedQuestion.type === "email" && (
                  <input
                    type="email"
                    disabled
                    placeholder="name@example.com"
                    className="w-full text-sm border-b border-black dark:border-zinc-600 py-2.5 focus:outline-none opacity-50 bg-transparent text-black dark:text-zinc-200"
                  />
                )}

                {selectedQuestion.type === "number" && (
                  <input
                    type="number"
                    disabled
                    placeholder="Type a number..."
                    className="w-full text-sm border-b border-black dark:border-zinc-600 py-2.5 focus:outline-none opacity-50 bg-transparent text-black dark:text-zinc-200"
                  />
                )}

                {selectedQuestion.type === "yes_no" && (
                  <div className="flex gap-3 max-w-xs text-black dark:text-zinc-200">
                    <div className="flex-1 text-center py-3 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-colors cursor-pointer">
                      Yes
                    </div>
                    <div className="flex-1 text-center py-3 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-colors cursor-pointer">
                      No
                    </div>
                  </div>
                )}

                {selectedQuestion.type === "rating" && (
                  <div className="flex gap-2 text-black dark:text-zinc-200">
                    {Array.from({ length: selectedQuestion.maxVal || 5 }).map((_, rIdx) => (
                      <button
                        key={rIdx}
                        className="w-10 h-10 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-black dark:hover:bg-[#a78bfa] hover:text-white dark:hover:text-black transition-all"
                      >
                        <Star className="w-4 h-4 text-current" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit / Ok button */}
              <div className="flex items-center gap-3">
                <button
                  disabled
                  className="px-6 py-2.5 border border-black font-bold uppercase tracking-widest text-xs transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-90 flex items-center gap-1 bg-black text-white"
                  style={{
                    backgroundColor: form.theme.buttonColor,
                    color: form.theme.buttonTextColor,
                  }}
                >
                  OK
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-[9px] font-mono font-bold uppercase text-gray-500 dark:text-zinc-400 hidden md:inline tracking-wider">
                  press <b className="font-sans border border-black dark:border-zinc-700 px-1 py-0.5 bg-white dark:bg-zinc-800 text-black dark:text-zinc-200">Enter ↵</b>
                </span>
              </div>
            </div>
          ) : (
            <div className="max-w-sm text-center p-6 text-black dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-black dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-black dark:text-[#a78bfa]" />
              <h4 className="font-sans font-black uppercase text-xs tracking-wider">No Question Selected</h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Select an existing question from the sidebar or click "Add" to create a new conversational field.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Settings & Design */}
        <div className="w-80 border border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] flex flex-col overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-black dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 shrink-0 text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200">
            <button
              onClick={() => setRightTab("settings")}
              className={`flex-1 py-3 text-center border-r border-black dark:border-zinc-700 transition-colors ${
                rightTab === "settings"
                  ? "bg-white dark:bg-[#1C1C1E] text-black dark:text-[#a78bfa] font-black"
                  : "hover:bg-amber-50 dark:hover:bg-zinc-700"
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Settings className="w-3.5 h-3.5" /> Question
              </span>
            </button>
            <button
              onClick={() => setRightTab("design")}
              className={`flex-1 py-3 text-center border-r border-black dark:border-zinc-700 transition-colors ${
                rightTab === "design"
                  ? "bg-white dark:bg-[#1C1C1E] text-black dark:text-[#a78bfa] font-black"
                  : "hover:bg-amber-50 dark:hover:bg-zinc-700"
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Palette className="w-3.5 h-3.5" /> Styling
              </span>
            </button>
            <button
              onClick={() => setRightTab("logic")}
              className={`flex-1 py-3 text-center transition-colors ${
                rightTab === "logic"
                  ? "bg-white dark:bg-[#1C1C1E] text-black dark:text-[#a78bfa] font-black"
                  : "hover:bg-amber-50 dark:hover:bg-zinc-700"
              }`}
            >
              <span className="flex items-center justify-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Logic Jumps
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* 1. SETTINGS TAB */}
            {rightTab === "settings" && (
              selectedQuestion ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Question Title
                    </label>
                    <textarea
                      rows={2}
                      value={selectedQuestion.title}
                      onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 resize-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Description / Help text
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Try to choose your absolute favorite..."
                      value={selectedQuestion.description}
                      onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 resize-none font-semibold"
                    />
                  </div>

                  {/* Required Toggle */}
                  <div className="flex items-center justify-between py-2.5 border-y border-black dark:border-zinc-700">
                    <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200">Required question?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuestion.required}
                        onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { required: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-white dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 peer peer-checked:bg-black dark:peer-checked:bg-[#a78bfa] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white dark:after:bg-zinc-200 after:border-2 after:border-black dark:after:border-zinc-700 after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-white dark:peer-checked:after:bg-black"></div>
                    </label>
                  </div>

                  {/* Rating parameters */}
                  {selectedQuestion.type === "rating" && (
                    <div>
                      <label className="block text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-wider mb-1">
                        Max Stars
                      </label>
                      <select
                        value={selectedQuestion.maxVal || 5}
                        onChange={(e) => handleUpdateQuestion(selectedQuestion.id, { maxVal: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-semibold"
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} Stars
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Multiple Choice Options List */}
                  {(selectedQuestion.type === "multiple_choice" || selectedQuestion.type === "dropdown") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-wider">
                          Options
                        </label>
                        <button
                          onClick={() => handleAddOption(selectedQuestion)}
                          className="text-[10px] text-indigo-600 dark:text-[#a78bfa] hover:underline font-black uppercase tracking-wider"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(selectedQuestion.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-black dark:text-zinc-300 w-4">
                              {oIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(selectedQuestion, oIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-semibold"
                            />
                            <button
                              onClick={() => handleRemoveOption(selectedQuestion, oIdx)}
                              className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-black dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Danger zone delete */}
                  <div className="pt-4 border-t border-black dark:border-zinc-700">
                    <button
                      onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                      className="w-full py-2.5 border border-black dark:border-zinc-700 bg-red-100 dark:bg-red-950/40 text-black dark:text-zinc-200 hover:bg-red-200 dark:hover:bg-red-900/60 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(248,113,113,0.3)] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Question
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-center py-6">Select a question to edit properties</p>
              )
            )}

            {/* 2. DESIGN TAB */}
            {rightTab === "design" && (
              <div className="space-y-4">
                <p className="text-xs text-black dark:text-zinc-300 font-semibold leading-relaxed">Apply visual preset styling or customize colors for respondents.</p>
                
                {/* Presets */}
                <div>
                  <label className="block text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Preset Themes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_THEMES.map((theme, tIdx) => {
                      const active = form.theme.backgroundColor === theme.backgroundColor;
                      return (
                        <button
                          key={tIdx}
                          onClick={() => handleUpdateForm({ theme })}
                          className={`p-2 border text-left text-[10px] font-bold uppercase tracking-wide flex flex-col gap-1.5 transition-all ${
                            active 
                              ? "border-black dark:border-zinc-500 bg-[#F3F3F1] dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.3)]" 
                              : "border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <span className="line-clamp-1">{theme.name}</span>
                          <div className="flex gap-1">
                            <span className="w-3.5 h-3.5 rounded-full border border-black dark:border-zinc-700" style={{ backgroundColor: theme.backgroundColor }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-black dark:border-zinc-700" style={{ backgroundColor: theme.textColor }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-black dark:border-zinc-700" style={{ backgroundColor: theme.buttonColor }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-black dark:border-zinc-700 my-4" />

                {/* Custom theme configuration */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-wider">
                    Custom Properties
                  </label>

                  {/* Colors selectors */}
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-black dark:text-zinc-300">
                    <span>Background Color</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{form.theme.backgroundColor}</span>
                      <input
                        type="color"
                        value={form.theme.backgroundColor}
                        onChange={(e) => handleUpdateForm({ theme: { ...form.theme, backgroundColor: e.target.value } })}
                        className="w-6 h-6 border border-black dark:border-zinc-700 cursor-pointer bg-white dark:bg-zinc-800 p-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-black dark:text-zinc-300">
                    <span>Text Color</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{form.theme.textColor}</span>
                      <input
                        type="color"
                        value={form.theme.textColor}
                        onChange={(e) => handleUpdateForm({ theme: { ...form.theme, textColor: e.target.value } })}
                        className="w-6 h-6 border border-black dark:border-zinc-700 cursor-pointer bg-white dark:bg-zinc-800 p-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-black dark:text-zinc-300">
                    <span>Button Accent</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{form.theme.buttonColor}</span>
                      <input
                        type="color"
                        value={form.theme.buttonColor}
                        onChange={(e) => handleUpdateForm({ theme: { ...form.theme, buttonColor: e.target.value } })}
                        className="w-6 h-6 border border-black dark:border-zinc-700 cursor-pointer bg-white dark:bg-zinc-800 p-0.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-black dark:text-zinc-300">
                    <span>Button Text Color</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400">{form.theme.buttonTextColor}</span>
                      <input
                        type="color"
                        value={form.theme.buttonTextColor}
                        onChange={(e) => handleUpdateForm({ theme: { ...form.theme, buttonTextColor: e.target.value } })}
                        className="w-6 h-6 border border-black dark:border-zinc-700 cursor-pointer bg-white dark:bg-zinc-800 p-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LOGIC TAB */}
            {rightTab === "logic" && (
              selectedQuestion ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-black dark:text-zinc-200">Branching & Logic jumps</h4>
                  <p className="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 leading-relaxed">
                    Set conditions to branch and jump to later questions dynamically, bypass fields, or skip immediately to the thank-you screen based on answers.
                  </p>

                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-indigo-950 dark:text-indigo-200 tracking-wider">Current Jump Settings</span>
                      <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300 uppercase border border-indigo-200 dark:border-indigo-800 px-1 py-0.5 bg-white dark:bg-zinc-800">Relational Rules</span>
                    </div>

                    {selectedQuestion.logic ? (
                      <div className="space-y-2 text-xs text-black dark:text-zinc-200 font-semibold">
                        <p>
                          If value <b className="text-indigo-900 dark:text-indigo-300 uppercase font-black">"{selectedQuestion.logic.condition}"</b> to{" "}
                          <span className="px-1.5 py-0.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-[10px] font-bold text-black dark:text-zinc-200">
                            "{selectedQuestion.logic.value}"
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-zinc-400">
                          → Jump to:{" "}
                          <b className="text-black dark:text-zinc-200 font-bold uppercase">
                            {selectedQuestion.logic.goToQuestionId === "thank-you"
                              ? "Thank-you screen"
                              : questions.find((x) => x.id === selectedQuestion.logic?.goToQuestionId)?.title || "Next Question"}
                          </b>
                        </p>

                        <button
                          onClick={() => handleUpdateQuestion(selectedQuestion.id, { logic: undefined })}
                          className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider hover:underline pt-1.5 block"
                        >
                          Remove Logic Rule
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 italic font-medium">No branching rules defined for this question.</p>
                    )}
                  </div>

                  <div className="border-t border-black dark:border-zinc-700 pt-3 space-y-3">
                    <label className="block text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-wider">
                      Add / Edit Branch Rule
                    </label>

                    {/* Condition selection */}
                    <div>
                      <span className="text-[10px] text-black dark:text-zinc-400 mb-1 block font-bold uppercase tracking-wide">Condition</span>
                      <select
                        onChange={(e) => {
                          const currentLogic = selectedQuestion.logic || { condition: "equals", value: "", goToQuestionId: "thank-you" };
                          handleUpdateQuestion(selectedQuestion.id, {
                            logic: { ...currentLogic, condition: e.target.value as QuestionLogic["condition"] },
                          });
                        }}
                        value={selectedQuestion.logic?.condition || "equals"}
                        className="w-full px-2 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-semibold"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Does not equal</option>
                        <option value="contains">Contains substring</option>
                      </select>
                    </div>

                    {/* Trigger value */}
                    <div>
                      <span className="text-[10px] text-black dark:text-zinc-400 mb-1 block font-bold uppercase tracking-wide">Value to match</span>
                      {selectedQuestion.type === "yes_no" ? (
                        <select
                          onChange={(e) => {
                            const currentLogic = selectedQuestion.logic || { condition: "equals", value: "Yes", goToQuestionId: "thank-you" };
                            handleUpdateQuestion(selectedQuestion.id, {
                              logic: { ...currentLogic, value: e.target.value },
                            });
                          }}
                          value={selectedQuestion.logic?.value || "Yes"}
                          className="w-full px-2 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-semibold"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : selectedQuestion.type === "multiple_choice" || selectedQuestion.type === "dropdown" ? (
                        <select
                          onChange={(e) => {
                            const currentLogic = selectedQuestion.logic || { condition: "equals", value: selectedQuestion.options[0] || "", goToQuestionId: "thank-you" };
                            handleUpdateQuestion(selectedQuestion.id, {
                              logic: { ...currentLogic, value: e.target.value },
                            });
                          }}
                          value={selectedQuestion.logic?.value || selectedQuestion.options[0] || ""}
                          className="w-full px-2 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-semibold"
                        >
                          {selectedQuestion.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="e.g. hello"
                          value={selectedQuestion.logic?.value || ""}
                          onChange={(e) => {
                            const currentLogic = selectedQuestion.logic || { condition: "equals", value: "", goToQuestionId: "thank-you" };
                            handleUpdateQuestion(selectedQuestion.id, {
                              logic: { ...currentLogic, value: e.target.value },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-semibold"
                        />
                      )}
                    </div>

                    {/* Go to selection */}
                    <div>
                      <span className="text-[10px] text-black dark:text-zinc-400 mb-1 block font-bold uppercase tracking-wide">Destination Question</span>
                      <select
                        onChange={(e) => {
                          const currentLogic = selectedQuestion.logic || { condition: "equals", value: "", goToQuestionId: "thank-you" };
                          handleUpdateQuestion(selectedQuestion.id, {
                            logic: { ...currentLogic, goToQuestionId: e.target.value },
                          });
                        }}
                        value={selectedQuestion.logic?.goToQuestionId || "thank-you"}
                        className="w-full px-2 py-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-700 font-semibold"
                      >
                        <option value="thank-you">Thank-you screen (Finish)</option>
                        {questions
                          .filter((x) => x.id !== selectedQuestion.id && x.orderIndex > selectedQuestion.orderIndex)
                          .map((q, qIdx) => (
                            <option key={qIdx} value={q.id}>
                              Q{q.orderIndex + 1}: {q.title || "Untitled"}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-black dark:border-zinc-700 pt-4 text-xs">
                    <span className="inline-block px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border border-black dark:border-zinc-700 font-bold text-[9px] uppercase tracking-wide mb-1.5">
                      Pro Feature State
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-semibold leading-relaxed">
                      Multi-variable arithmetic evaluations, scoring jumps, and webhook responses are in <b className="text-black dark:text-zinc-200 font-bold uppercase">Active Beta</b>.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-center py-6">Select a question to define logical branching</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Guest Mode Restriction Auth Prompt Modal */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 bg-black/55 dark:bg-black/85 flex items-center justify-center z-[100] p-4">
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
