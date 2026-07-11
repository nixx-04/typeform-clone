import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Star, 
  AlertCircle, 
  Send,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";
import { Form, Question, FormTheme } from "../types";
import { Logo } from "./Logo";

interface RespondentProps {
  shareLink: string;
  showNotification: (msg: string, type?: "success" | "info" | "error") => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Respondent({ 
  shareLink, 
  showNotification,
  darkMode = false,
  onToggleDarkMode
}: RespondentProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flow State
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 is Welcome/Intro screen, questions length is Thank-You
  const [answers, setAnswers] = useState<{ [qId: string]: any }>({});
  const [history, setHistory] = useState<number[]>([]); // stack of previous indices to allow going back safely
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Validation error state
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchForm = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/forms/${shareLink}`);
      if (!res.ok) {
        throw new Error("This form is either draft, inactive, or does not exist.");
      }
      const data = await res.json();
      setForm(data);
      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [shareLink]);

  // Handle keyboard inputs globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitted || loading || !form) return;

      const activeEl = document.activeElement;
      const isTextInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT");

      // Enter navigation
      if (e.key === "Enter") {
        if (currentIdx === -1) {
          e.preventDefault();
          handleAdvance();
          return;
        }

        const currentQ = questions[currentIdx];
        if (currentQ) {
          if (currentQ.type === "long_text" && activeEl?.tagName === "TEXTAREA") {
            // In a textarea, regular Enter should insert a newline.
            // Ctrl+Enter or Cmd+Enter will advance/submit.
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleAdvance();
            }
            return;
          }

          e.preventDefault();
          const currentVal = answers[currentQ.id];
          const hasValue = currentVal !== undefined && currentVal !== null && currentVal !== "";

          // Advance if optional OR if it has a valid answer
          if (!currentQ.required || hasValue) {
            handleAdvance();
          } else {
            // Trigger validation error on Enter if required and empty
            const err = validateField(currentQ, currentVal);
            if (err) {
              setValidationError(err);
            }
          }
        }
      }

      // Arrow navigation (ignore if inside a text input/textarea)
      if (isTextInput) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleAdvance();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleGoBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIdx, answers, questions, submitted, loading, form]);

  const handleStart = () => {
    setCurrentIdx(0);
    setHistory([-1]);
  };

  // Field validation helper
  const validateField = (q: Question, val: any): string | null => {
    if (q.required) {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        return "This field is required. Please provide an answer to proceed.";
      }
    }

    if (val !== undefined && val !== null && val !== "") {
      if (q.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val))) {
          return "Please enter a valid email address (e.g. user@example.com).";
        }
      }

      if (q.type === "number") {
        const num = Number(val);
        if (isNaN(num)) {
          return "Please enter a valid number.";
        }
        if (q.minVal !== undefined && num < q.minVal) {
          return `Number must be at least ${q.minVal}.`;
        }
        if (q.maxVal !== undefined && num > q.maxVal) {
          return `Number cannot exceed ${q.maxVal}.`;
        }
      }
    }

    return null;
  };

  const handleValueChange = (qId: string, val: any) => {
    setValidationError(null);
    setAnswers({ ...answers, [qId]: val });
  };

  const handleAdvance = () => {
    if (currentIdx === -1) {
      handleStart();
      return;
    }

    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    const val = answers[currentQ.id];
    const err = validateField(currentQ, val);
    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError(null);

    // If it is the last question, submit the form
    if (currentIdx === questions.length - 1) {
      handleSubmit();
      return;
    }

    // Calculate next index
    let nextIdx = currentIdx + 1;

    // Check Logic Jumps
    if (currentQ.logic) {
      const conditionMet = evaluateLogic(currentQ.logic, val);
      if (conditionMet) {
        const destinationQId = currentQ.logic.goToQuestionId;
        if (destinationQId === "thank-you") {
          handleSubmit();
          return;
        } else {
          const destIndex = questions.findIndex((x) => x.id === destinationQId);
          if (destIndex !== -1) {
            nextIdx = destIndex;
          }
        }
      }
    }

    setHistory([...history, currentIdx]);
    setCurrentIdx(nextIdx);
  };

  const handleGoBack = () => {
    if (history.length === 0) return;
    const previousHistory = [...history];
    const prevIdx = previousHistory.pop();
    if (prevIdx !== undefined) {
      setCurrentIdx(prevIdx);
      setHistory(previousHistory);
      setValidationError(null);
    }
  };

  const evaluateLogic = (logic: any, val: any): boolean => {
    const valStr = String(val).toLowerCase().trim();
    const conditionValStr = String(logic.value).toLowerCase().trim();

    switch (logic.condition) {
      case "equals":
        return valStr === conditionValStr;
      case "not_equals":
        return valStr !== conditionValStr;
      case "contains":
        return valStr.includes(conditionValStr);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    // Validate final field
    const currentQ = questions[currentIdx];
    if (currentQ) {
      const val = answers[currentQ.id];
      const err = validateField(currentQ, val);
      if (err) {
        setValidationError(err);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/forms/${shareLink}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || (errData.validationErrors && errData.validationErrors.join(" ")) || "Submission failed";
        throw new Error(errMsg);
      }
      setSubmitted(true);
    } catch (err: any) {
      showNotification(err.message || "Error submitting form", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // UI styling based on current Form Theme
  const themeStyles = form
    ? {
        backgroundColor: form.theme.backgroundColor,
        color: form.theme.textColor,
      }
    : {};

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-3 bg-[#F3F3F1] dark:bg-[#121214]">
        <RefreshCw className="w-8 h-8 animate-spin text-black dark:text-[#a78bfa]" />
        <p className="text-xs text-gray-600 dark:text-zinc-400 font-mono font-bold uppercase tracking-wider">Loading form experience...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-[#F3F3F1] dark:bg-[#121214] p-6 text-center">
        <div className="w-16 h-16 border-2 border-black dark:border-zinc-700 bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-black dark:text-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
          <AlertCircle className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="text-lg font-sans font-black uppercase tracking-wider text-black dark:text-zinc-200">Form Not Available</h2>
        <p className="text-xs text-gray-600 dark:text-zinc-400 max-w-md font-semibold">{error || "The form you are looking for is currently draft or does not exist."}</p>
        <button
          onClick={fetchForm}
          className="px-5 py-2.5 border-2 border-black dark:border-zinc-700 bg-black dark:bg-[#a78bfa] text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-[#b59ffb] text-xs font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  // Progress metrics
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== "").length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div
      className="h-screen w-full flex flex-col justify-between overflow-hidden relative bg-[#F3F3F1] dark:bg-[#121214] select-text p-4 md:p-6"
    >
      {/* Tiny top branding */}
      <header className="h-12 px-6 border border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] flex items-center justify-between shrink-0 text-[10px] uppercase font-bold tracking-widest text-black dark:text-zinc-200">
        <div className="flex items-center gap-1.5" id="logo-branding">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-bold">Powered by</span>
          <Logo 
            darkMode={darkMode} 
            className="h-4 transition-all" 
          />
        </div>
        <div className="flex items-center gap-4">
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-1 border border-black dark:border-zinc-700 rounded-none bg-white dark:bg-zinc-800 text-black dark:text-zinc-200 hover:bg-[#F3F3F1] dark:hover:bg-zinc-700 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
          <span>{answeredCount} of {totalQuestions} answered</span>
        </div>
      </header>

      {/* Main Form Center Stage */}
      <main className="flex-1 max-w-2xl w-full mx-auto flex flex-col justify-center relative">
        <AnimatePresence mode="wait">
          {submitted ? (
            // THANK YOU CARD
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="text-center py-10 px-8 border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(167,139,250,0.15)] animate-fade-in"
              style={{
                backgroundColor: form.theme?.backgroundColor || undefined,
                color: form.theme?.textColor || undefined,
              }}
            >
              <div
                className="w-16 h-16 border-2 border-black dark:border-zinc-700 flex items-center justify-center mx-auto mb-6 bg-green-100 dark:bg-green-950/30 text-black dark:text-green-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]"
              >
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="font-sans font-black uppercase text-2xl md:text-3xl leading-tight tracking-wide mb-3">
                Thank you!
              </h1>
              <p className="text-xs md:text-sm opacity-80 max-w-md mx-auto mb-8 font-semibold leading-relaxed">
                Your responses have been successfully compiled. You can close this tab now.
              </p>
              
              <button
                onClick={() => {
                  setAnswers({});
                  setHistory([]);
                  setCurrentIdx(-1);
                  setSubmitted(false);
                }}
                className="px-5 py-2.5 border-2 border-black dark:border-zinc-700 hover:bg-neutral-800 hover:text-white text-xs font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] active:translate-x-[1px] active:translate-y-[1px]"
                style={{
                  backgroundColor: form.theme?.buttonColor || undefined,
                  color: form.theme?.buttonTextColor || undefined,
                }}
              >
                Submit another response
              </button>
            </motion.div>
          ) : currentIdx === -1 ? (
            // INTRO / WELCOME SCREEN
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="text-left py-10 px-8 border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(167,139,250,0.15)]"
              style={{
                backgroundColor: form.theme?.backgroundColor || undefined,
                color: form.theme?.textColor || undefined,
              }}
            >
              <h1 className="font-sans font-black uppercase text-3xl md:text-4xl leading-tight tracking-wide mb-4">
                {form.title}
              </h1>
              <p className="text-xs md:text-sm opacity-80 mb-8 max-w-lg font-semibold leading-relaxed">
                Welcome to this conversant experience. Ready to get started? This will take about {Math.max(1, Math.round(questions.length * 0.5))} minutes.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleStart}
                  className="px-6 py-3 border-2 border-black dark:border-zinc-700 text-xs font-bold uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] hover:opacity-90 flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
                  id="welcome-start-btn"
                  style={{
                    backgroundColor: form.theme?.buttonColor || "#000000",
                    color: form.theme?.buttonTextColor || "#ffffff",
                  }}
                >
                  Start Form
                  <Check className="w-5 h-5 text-current" />
                </button>
                <span className="text-[10px] font-mono font-bold uppercase opacity-60 hidden md:inline tracking-wider">
                  press <b className="font-sans border border-black dark:border-zinc-700 px-1 py-0.5 bg-white dark:bg-zinc-800 text-black dark:text-zinc-200">Enter ↵</b>
                </span>
              </div>
            </motion.div>
          ) : (
            // QUESTION PANEL
            <motion.div
              key={questions[currentIdx]?.id || "empty"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="text-left py-10 px-8 border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(167,139,250,0.15)]"
              style={{
                backgroundColor: form.theme?.backgroundColor || undefined,
                color: form.theme?.textColor || undefined,
              }}
            >
              {/* Question metadata */}
              <div className="flex items-center gap-2 mb-4 font-mono text-[10px] font-bold opacity-60 uppercase tracking-widest">
                <span>Question {currentIdx + 1}</span>
                <span>/</span>
                <span>{totalQuestions}</span>
              </div>

              {/* Title & Description */}
              <h2 className="font-sans font-black uppercase text-xl md:text-2xl leading-tight tracking-wide mb-2">
                {questions[currentIdx].title}
                {questions[currentIdx].required && <span className="text-red-500 ml-1.5">*</span>}
              </h2>

              {questions[currentIdx].description && (
                <p className="text-xs font-semibold opacity-75 mb-6 leading-relaxed">
                  {questions[currentIdx].description}
                </p>
              )}

              {/* Dynamic Inputs */}
              <div className="mb-6 min-h-24">
                {/* 1. SHORT TEXT */}
                {questions[currentIdx].type === "short_text" && (
                  <input
                    type="text"
                    value={answers[questions[currentIdx].id] || ""}
                    onChange={(e) => handleValueChange(questions[currentIdx].id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full text-sm md:text-base border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-black dark:text-zinc-100 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-all"
                    autoFocus
                    id={`resp-input-${questions[currentIdx].id}`}
                  />
                )}

                {/* 2. LONG TEXT */}
                {questions[currentIdx].type === "long_text" && (
                  <textarea
                    rows={4}
                    value={answers[questions[currentIdx].id] || ""}
                    onChange={(e) => handleValueChange(questions[currentIdx].id, e.target.value)}
                    placeholder="Type your long response here..."
                    className="w-full text-sm border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-black dark:text-zinc-100 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-all resize-none"
                    autoFocus
                    id={`resp-input-${questions[currentIdx].id}`}
                  />
                )}

                {/* 3. MULTIPLE CHOICE */}
                {questions[currentIdx].type === "multiple_choice" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                    {questions[currentIdx].options.map((opt, oIdx) => {
                      const selected = answers[questions[currentIdx].id] === opt;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => {
                            handleValueChange(questions[currentIdx].id, opt);
                            // Auto advance multiple choice for crisp UX!
                            setTimeout(() => {
                              handleAdvance();
                            }, 350);
                          }}
                          className={`p-3.5 border-2 text-left font-bold text-xs uppercase tracking-wide flex items-center justify-between transition-all ${
                            selected
                              ? "border-black dark:border-zinc-600 bg-amber-50 dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.25)] text-black dark:text-[#a78bfa] font-black"
                              : "border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-zinc-800 text-black dark:text-zinc-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1px_1px_0px_0px_rgba(167,139,250,0.15)]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-5 h-5 border border-black dark:border-zinc-700 text-[10px] font-mono flex items-center justify-center font-black bg-white dark:bg-zinc-800 text-black dark:text-zinc-300"
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {selected && <Check className="w-4 h-4 shrink-0 text-black dark:text-[#a78bfa] stroke-[3px]" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. DROPDOWN */}
                {questions[currentIdx].type === "dropdown" && (
                  <div className="max-w-xs relative">
                    <select
                      value={answers[questions[currentIdx].id] || ""}
                      onChange={(e) => handleValueChange(questions[currentIdx].id, e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 text-xs font-bold uppercase tracking-wider text-black dark:text-zinc-200 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)]"
                      autoFocus
                    >
                      <option value="">Select an option...</option>
                      {questions[currentIdx].options.map((opt, oIdx) => (
                        <option key={oIdx} value={opt} className="bg-white dark:bg-zinc-900 text-black dark:text-zinc-200">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 5. EMAIL */}
                {questions[currentIdx].type === "email" && (
                  <input
                    type="email"
                    value={answers[questions[currentIdx].id] || ""}
                    onChange={(e) => handleValueChange(questions[currentIdx].id, e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-sm md:text-base border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-black dark:text-zinc-100 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-all"
                    autoFocus
                    id={`resp-input-${questions[currentIdx].id}`}
                  />
                )}

                {/* 6. NUMBER */}
                {questions[currentIdx].type === "number" && (
                  <input
                    type="number"
                    value={answers[questions[currentIdx].id] ?? ""}
                    onChange={(e) => handleValueChange(questions[currentIdx].id, e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Type a number..."
                    className="w-full text-sm md:text-base border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-black dark:text-zinc-100 focus:outline-none focus:bg-amber-50 dark:focus:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-all"
                    autoFocus
                    id={`resp-input-${questions[currentIdx].id}`}
                  />
                )}

                {/* 7. YES/NO */}
                {questions[currentIdx].type === "yes_no" && (
                  <div className="flex gap-4 max-w-sm">
                    {["Yes", "No"].map((opt) => {
                      const selected = answers[questions[currentIdx].id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            handleValueChange(questions[currentIdx].id, opt);
                            // Auto advance Yes/No for perfect UI
                            setTimeout(() => {
                              handleAdvance();
                            }, 350);
                          }}
                          className={`flex-1 text-center py-4 border-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            selected
                              ? "border-black dark:border-zinc-600 bg-amber-50 dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.25)] text-black dark:text-[#a78bfa]"
                              : "border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-zinc-800 text-black dark:text-zinc-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1px_1px_0px_0px_rgba(167,139,250,0.15)]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 8. RATING */}
                {questions[currentIdx].type === "rating" && (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: questions[currentIdx].maxVal || 5 }).map((_, rIdx) => {
                      const starVal = rIdx + 1;
                      const active = (answers[questions[currentIdx].id] || 0) >= starVal;
                      return (
                        <button
                          key={rIdx}
                          onClick={() => {
                            handleValueChange(questions[currentIdx].id, starVal);
                            // Auto advance rating
                            setTimeout(() => {
                              handleAdvance();
                            }, 350);
                          }}
                          className={`w-12 h-12 border-2 border-black dark:border-zinc-700 flex items-center justify-center transition-all ${
                            active 
                              ? "bg-amber-50 dark:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.25)] text-black dark:text-[#a78bfa] border-black dark:border-zinc-600" 
                              : "bg-white dark:bg-zinc-900 text-gray-400 dark:text-zinc-600 border-black dark:border-zinc-700 hover:bg-amber-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <Star
                            className="w-6 h-6 transition-all"
                            style={{
                              fill: active ? (darkMode ? "#a78bfa" : "black") : "none",
                              color: darkMode ? "#a78bfa" : "black",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Error state */}
              {validationError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 border border-black dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-2.5 text-[10px] font-bold uppercase tracking-wide mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center gap-3">
                {currentIdx === totalQuestions - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 border-2 border-black dark:border-zinc-700 bg-black dark:bg-[#a78bfa] text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] hover:opacity-90 flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
                    id="submit-form-btn"
                    style={{
                      backgroundColor: form.theme?.buttonColor || undefined,
                      color: form.theme?.buttonTextColor || undefined,
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-current" /> Submitting...
                      </>
                    ) : (
                      <>
                        Submit responses <Send className="w-4 h-4 text-current" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleAdvance}
                    className="px-6 py-2.5 border-2 border-black dark:border-zinc-700 bg-black dark:bg-[#a78bfa] text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] flex items-center gap-1 hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px]"
                    style={{
                      backgroundColor: form.theme?.buttonColor || undefined,
                      color: form.theme?.buttonTextColor || undefined,
                    }}
                  >
                    OK <Check className="w-4 h-4 text-current" />
                  </button>
                )}

                <span className="text-[10px] font-mono font-bold uppercase text-gray-400 dark:text-zinc-500 hidden md:inline tracking-wider">
                  press <b className="font-sans border border-black dark:border-zinc-700 px-1 py-0.5 bg-white dark:bg-zinc-800 text-black dark:text-zinc-200">Enter ↵</b>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Progress & Quick Nav Controls Footer */}
      <footer className="h-16 px-6 border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] flex items-center justify-between shrink-0 text-xs font-sans shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] mt-4">
        {/* Progress bar */}
        <div className="flex-1 max-w-xs flex items-center gap-3">
          <div className="flex-1 bg-white dark:bg-zinc-800 border border-black dark:border-zinc-700 h-4 rounded-none overflow-hidden relative">
            <div
              className="h-full bg-black dark:bg-[#a78bfa] border-r border-black dark:border-zinc-700 transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
          <span className="font-mono font-bold text-[10px] text-black dark:text-zinc-200 tracking-wide">{progressPercent}% complete</span>
        </div>

        {/* Small chevron controls */}
        {!submitted && (
          <div className="flex items-center bg-white dark:bg-zinc-900 border border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)]">
            <button
              onClick={handleGoBack}
              disabled={history.length === 0}
              className="p-2 hover:bg-black dark:hover:bg-zinc-800 hover:text-white text-black dark:text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Go Back"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div className="w-px bg-black dark:bg-zinc-700 h-5" />
            <button
              onClick={handleAdvance}
              disabled={currentIdx === totalQuestions - 1}
              className="p-2 hover:bg-black dark:hover:bg-zinc-800 hover:text-white text-black dark:text-zinc-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Skip Forward"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
