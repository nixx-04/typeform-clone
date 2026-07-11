import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  BarChart2, 
  FileText, 
  Download, 
  RefreshCw, 
  Calendar, 
  Eye, 
  Percent, 
  Users, 
  Star,
  ChevronRight,
  Database,
  X,
  Clock,
  ExternalLink,
  Sun,
  Moon
} from "lucide-react";
import { Form, Question, FormStats, Submission } from "../types";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface ResultsProps {
  formId: string;
  onNavigate: (route: string) => void;
  showNotification: (msg: string, type?: "success" | "info" | "error") => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Results({ 
  formId, 
  onNavigate, 
  showNotification,
  darkMode = false,
  onToggleDarkMode
}: ResultsProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [submissionsData, setSubmissionsData] = useState<{ questions: Question[]; submissions: Submission[] } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "submissions">("summary");
  
  // Modal for looking at single response in detail
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Load form details
      const formRes = await apiFetch(`/api/forms/${formId}`);
      if (!formRes.ok) throw new Error("Failed to load form metadata");
      const formData = await formRes.json();
      setForm(formData);

      // Load Stats
      const statsRes = await apiFetch(`/api/forms/${formId}/stats`);
      if (!statsRes.ok) throw new Error("Failed to load summary stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Load Submissions list
      const subRes = await apiFetch(`/api/forms/${formId}/submissions`);
      if (!subRes.ok) throw new Error("Failed to load submissions");
      const subData = await subRes.json();
      setSubmissionsData(subData);

    } catch (err: any) {
      showNotification(err.message || "Error loading results data", "error");
      onNavigate("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formId]);

  const handleExportCSV = () => {
    const token = localStorage.getItem("auth_token") || "";
    window.open(`/api/forms/${formId}/export?token=${token}`, "_blank");
    showNotification("Downloading responses CSV...", "info");
  };

  if (loading || !form || !stats || !submissionsData) {
    return (
      <div className="h-screen bg-[#F3F3F1] dark:bg-[#121214] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-black dark:text-[#a78bfa]" />
        <p className="text-xs text-gray-600 dark:text-zinc-400 font-mono font-bold uppercase tracking-wider">Loading form metrics...</p>
      </div>
    );
  }

  const { questions, submissions } = submissionsData;

  return (
    <div className="min-h-screen bg-[#F3F3F1] dark:bg-[#121214] flex flex-col font-sans text-black dark:text-zinc-200 pb-12">
      {/* Top Header */}
      <header className="h-16 border-b-2 border-black dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] px-6 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate(`builder/${formId}`)}
            className="p-1.5 border border-black dark:border-zinc-700 rounded-none text-black dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors shrink-0 bg-white dark:bg-zinc-900"
            title="Back to Form Builder"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => onNavigate("")} id="logo-branding">
            <img 
              src={darkMode ? "/logo-dark.png" : "/logo-light.png"} 
              alt="Typeform" 
              className="h-6 md:h-7 object-contain transition-all" 
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="text-gray-400 dark:text-zinc-600 hidden sm:inline">/</span>

          <div>
            <h1 className="font-sans font-black uppercase text-sm tracking-wider text-black dark:text-zinc-100 flex items-center gap-2">
              {form.title} <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 border border-black dark:border-zinc-700 px-1.5 py-0.5 bg-[#F3F3F1] dark:bg-zinc-800">Metrics</span>
            </h1>
            <p className="text-[9px] text-gray-500 dark:text-zinc-400 font-mono font-bold uppercase tracking-wider">Real-time compilation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode switcher */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 border-2 border-black dark:border-zinc-700 text-black dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-zinc-800 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-colors active:translate-x-[1px] active:translate-y-[1px]"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={fetchData}
            className="p-2 border-2 border-black dark:border-zinc-700 text-black dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-zinc-800 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-colors active:translate-x-[1px] active:translate-y-[1px]"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="border-2 border-black dark:border-zinc-700 bg-black dark:bg-[#a78bfa] text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-[#b59ffb] text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] transition-all active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
            id="export-csv-btn"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {user && (
            <div id="results-user-menu" className="flex items-center gap-1.5 pl-1.5 border-l border-neutral-300 dark:border-neutral-700">
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
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        
        {/* High-level KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
            <div className="flex items-center justify-between mb-3 text-black dark:text-zinc-300">
              <span className="text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-widest">Views</span>
              <Eye className="w-4 h-4 text-black dark:text-zinc-400" />
            </div>
            <h3 className="text-3xl font-mono font-black text-black dark:text-[#a78bfa] tracking-tight">{stats.views}</h3>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mt-1">Unique page visits</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
            <div className="flex items-center justify-between mb-3 text-black dark:text-zinc-300">
              <span className="text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-widest">Submissions</span>
              <Users className="w-4 h-4 text-black dark:text-zinc-400" />
            </div>
            <h3 className="text-3xl font-mono font-black text-black dark:text-[#a78bfa] tracking-tight">{stats.submissionsCount}</h3>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mt-1">Completed forms</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-none p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
            <div className="flex items-center justify-between mb-3 text-black dark:text-zinc-300">
              <span className="text-[10px] font-bold text-black dark:text-zinc-300 uppercase tracking-widest">Completion Rate</span>
              <Percent className="w-4 h-4 text-black dark:text-zinc-400" />
            </div>
            <h3 className="text-3xl font-mono font-black text-black dark:text-[#a78bfa] tracking-tight">{stats.completionRate}%</h3>
            <p className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mt-1">Form filling efficiency</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b-2 border-black dark:border-zinc-700 mb-6 font-bold text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-3 px-4 border-b-4 transition-all ${
              activeTab === "summary"
                ? "border-black dark:border-[#a78bfa] text-black dark:text-[#a78bfa] bg-white dark:bg-zinc-900"
                : "border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 hover:bg-[#F3F3F1] dark:hover:bg-zinc-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Analytics Summary
            </span>
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`pb-3 px-4 border-b-4 transition-all ${
              activeTab === "submissions"
                ? "border-black dark:border-[#a78bfa] text-black dark:text-[#a78bfa] bg-white dark:bg-zinc-900"
                : "border-transparent text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 hover:bg-[#F3F3F1] dark:hover:bg-zinc-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Individual Submissions ({submissions.length})
            </span>
          </button>
        </div>

        {/* content panels */}

        {/* TAB 1: SUMMARY STATS */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            {questions.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-10 text-center text-gray-500 dark:text-zinc-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
                <Database className="w-8 h-8 mx-auto mb-2 text-black dark:text-zinc-400 animate-bounce" />
                <p className="text-xs font-bold uppercase tracking-wider">This form has no questions to compile.</p>
              </div>
            ) : (
              questions.map((q, qIdx) => {
                const qStat = stats.questionsStats[q.id];
                if (!qStat) return null;

                return (
                  <div key={q.id} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
                          Question {qIdx + 1} • {q.type.replace("_", " ")}
                        </span>
                        <h4 className="font-sans font-black uppercase text-sm md:text-base text-black dark:text-zinc-100 mt-1 leading-snug tracking-wide">
                          {q.title}
                        </h4>
                      </div>
                      <span className="text-[10px] bg-amber-50 dark:bg-zinc-800 border border-black dark:border-zinc-700 text-black dark:text-zinc-200 px-2.5 py-1 font-bold uppercase tracking-wider shrink-0">
                        {qStat.totalAnswers} responses
                      </span>
                    </div>

                    {/* Chart distributions or Recent Answers list */}
                    <div className="mt-4 border-t-2 border-black dark:border-zinc-700 pt-4">
                      {/* RATING / NUMBER STYLING */}
                      {(q.type === "rating" || q.type === "number") && (
                        <div className="space-y-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-black text-indigo-700 dark:text-[#a78bfa]">{qStat.average}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">average score</span>
                          </div>

                          <div className="space-y-2.5 max-w-md">
                            {qStat.distribution?.map((dist: any, dIdx: number) => (
                              <div key={dIdx} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                                <span className="w-12 text-black dark:text-zinc-300 font-mono font-bold text-[10px] flex items-center gap-1">
                                  {dist.choice} <Star className="w-3 h-3 text-black dark:text-zinc-300 fill-black dark:fill-zinc-300" />
                                </span>
                                <div className="flex-1 bg-white dark:bg-zinc-800 border border-black dark:border-zinc-700 h-3.5 rounded-none overflow-hidden relative">
                                  <div
                                    className="bg-black dark:bg-[#a78bfa] border-r border-black dark:border-zinc-700 h-full transition-all"
                                    style={{ width: `${dist.percentage}%` }}
                                  />
                                </div>
                                <span className="w-14 text-right text-black dark:text-zinc-300 font-mono font-bold text-[10px]">{dist.count} ({dist.percentage}%)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CHOICE / DROPDOWN / YES-NO */}
                      {(q.type === "multiple_choice" || q.type === "dropdown" || q.type === "yes_no") && (
                        <div className="space-y-3 max-w-xl">
                          {qStat.distribution?.map((dist: any, dIdx: number) => (
                            <div key={dIdx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-black dark:text-zinc-200">
                                <span>{dist.choice}</span>
                                <span className="font-mono text-[10px] text-black dark:text-zinc-300">{dist.count} ({dist.percentage}%)</span>
                              </div>
                              <div className="bg-white dark:bg-zinc-800 border border-black dark:border-zinc-700 h-4 rounded-none overflow-hidden relative">
                                <div
                                  className="bg-black dark:bg-[#a78bfa] border-r border-black dark:border-zinc-700 h-full transition-all"
                                  style={{ width: `${dist.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TEXTUAL ANSWERS LIST */}
                      {(q.type === "short_text" || q.type === "long_text" || q.type === "email") && (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {qStat.recentAnswers && qStat.recentAnswers.length > 0 ? (
                            qStat.recentAnswers.map((ans: any, aIdx: number) => (
                              <div key={aIdx} className="p-3 bg-amber-50/20 dark:bg-zinc-800/20 rounded-none border border-black dark:border-zinc-700 text-xs text-black dark:text-zinc-200 font-semibold leading-relaxed">
                                "{ans}"
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic font-medium uppercase tracking-wide">No text entries provided yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: RAW SUBMISSIONS TABLE */}
        {activeTab === "submissions" && (
          <div className="bg-white dark:bg-[#1C1C1E] border-2 border-black dark:border-zinc-700 rounded-none overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)]">
            {submissions.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-zinc-400">
                <Database className="w-8 h-8 mx-auto mb-2 text-black dark:text-zinc-400 animate-bounce" />
                <h4 className="font-bold text-black dark:text-zinc-200 text-xs uppercase tracking-wider">No submissions received</h4>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">Once respondents complete the form, their data will pop up here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-[#F3F3F1] dark:bg-zinc-800 border-b-2 border-black dark:border-zinc-700 text-black dark:text-zinc-200 font-black uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4">Submission ID</th>
                      <th className="px-6 py-4">Submitted At</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-black dark:border-zinc-700 divide-black dark:divide-zinc-700">
                    {submissions.map((sub) => {
                      const dateStr = new Date(sub.submittedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedSubmission(sub)}
                          className="hover:bg-amber-50/40 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 font-mono font-black text-indigo-700 dark:text-[#a78bfa]">{sub.id}</td>
                          <td className="px-6 py-4 text-black dark:text-zinc-200 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-black dark:text-zinc-300" /> {dateStr}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-0.5 bg-green-100 dark:bg-green-950/40 border border-black dark:border-zinc-700 text-black dark:text-green-300 text-[9px] font-bold uppercase tracking-wider rounded-none">
                              Completed
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubmission(sub);
                              }}
                              className="text-[10px] border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1 text-black dark:text-zinc-200 font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:shadow-[1px_1px_0px_0px_rgba(167,139,250,0.15)] hover:bg-amber-50 dark:hover:bg-zinc-700 inline-flex items-center gap-0.5"
                            >
                              Inspect <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* DETAILED SUBMISSION INSPECTOR DIALOG */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-end z-50 p-0">
          <div className="bg-white dark:bg-[#1C1C1E] h-full max-w-lg w-full shadow-2xl flex flex-col justify-between overflow-hidden p-6 md:p-8 font-sans border-l-4 border-black dark:border-zinc-700">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-indigo-700 dark:text-[#a78bfa] border border-indigo-200 dark:border-indigo-900 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/20">
                  Submission Details
                </span>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 border border-black dark:border-zinc-700 rounded-none text-black dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-mono font-black uppercase text-lg text-black dark:text-zinc-100 mt-1">ID: {selectedSubmission.id}</h3>
              <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5 text-black dark:text-zinc-300" />
                {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </p>
            </div>

            {/* Answer List */}
            <div className="flex-1 my-6 overflow-y-auto space-y-4 pr-1">
              {questions.map((q, idx) => {
                const answerValue = selectedSubmission.answers[q.id];
                return (
                  <div key={q.id} className="p-4 bg-amber-50/20 dark:bg-zinc-900/30 rounded-none border border-black dark:border-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)]">
                    <span className="text-[9px] font-mono font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Q{idx + 1} • {q.type.replace("_", " ")}</span>
                    <p className="font-bold text-black dark:text-zinc-200 text-xs mt-0.5">{q.title}</p>
                    <div className="mt-2.5 pt-2 border-t border-black dark:border-zinc-700">
                      {answerValue !== undefined ? (
                        <p className="text-xs font-mono font-bold text-indigo-700 dark:text-[#a78bfa] bg-white dark:bg-zinc-800 inline-block px-2.5 py-1 border border-black dark:border-zinc-700 rounded-none">
                          {String(answerValue)}
                        </p>
                      ) : (
                        <p className="text-xs italic text-gray-400 dark:text-zinc-500 font-medium">Skipped (Optional Field)</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="border-t-2 border-black dark:border-zinc-700 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2.5 border-2 border-black dark:border-zinc-700 bg-black dark:bg-[#a78bfa] text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-[#b59ffb] text-xs font-bold uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(167,139,250,0.15)] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
