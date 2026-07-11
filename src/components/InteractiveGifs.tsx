import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  User, 
  Bot, 
  Check, 
  CheckCircle2, 
  Smartphone, 
  Database, 
  Mail, 
  MessageSquare, 
  ChevronRight,
  ArrowRight,
  Coffee,
  HelpCircle,
  Clock,
  Heart
} from "lucide-react";

interface GifProps {
  darkMode: boolean;
}

// ==========================================
// 1. ASK FEATURE GIF (Intelligent Forms)
// ==========================================
export function AskFeatureGif({ darkMode }: GifProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState<"typing" | "respondent">("typing");
  const [typedPrompt, setTypedPrompt] = useState("");
  const [selectedCoffeeOption, setSelectedCoffeeOption] = useState<string | null>(null);
  const [formIsGenerated, setFormIsGenerated] = useState(false);

  const fullPrompt = "Create an elegant feedback form for my gourmet coffee boutique with branching logic for hot vs. cold drinks...";

  // Simulation loop for typing prompt
  useEffect(() => {
    if (currentStep !== "typing" || !isPlaying) return;

    let idx = 0;
    setTypedPrompt("");
    setFormIsGenerated(false);

    const interval = setInterval(() => {
      setTypedPrompt((prev) => prev + fullPrompt.charAt(idx));
      idx++;
      if (idx >= fullPrompt.length) {
        clearInterval(interval);
        // Form generated state
        setTimeout(() => {
          setFormIsGenerated(true);
          // Advance to respondent mode in 1.5s
          setTimeout(() => {
            setCurrentStep("respondent");
          }, 1500);
        }, 600);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [currentStep, isPlaying]);

  const resetSimulation = () => {
    setCurrentStep("typing");
    setTypedPrompt("");
    setFormIsGenerated(false);
    setSelectedCoffeeOption(null);
  };

  return (
    <div className="w-full border-2 border-black dark:border-zinc-700 bg-[#FAF9F5] dark:bg-[#151518] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] flex flex-col overflow-hidden font-sans">
      {/* Player header */}
      <div className="bg-[#EFEFEE] dark:bg-[#1F1F23] border-b-2 border-black dark:border-zinc-700 px-4 py-2 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-zinc-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="ml-1 text-[10px] tracking-widest text-gray-500 dark:text-zinc-400">interactive_player_01.gif</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="p-1 hover:bg-neutral-300 dark:hover:bg-zinc-800 transition-colors border border-black dark:border-zinc-700 bg-white dark:bg-zinc-900"
            title={isPlaying ? "Pause GIF" : "Play GIF"}
          >
            {isPlaying ? <Pause className="w-3 h-3 text-black dark:text-zinc-200" /> : <Play className="w-3 h-3 text-black dark:text-zinc-200" />}
          </button>
          <button 
            onClick={resetSimulation}
            className="p-1 hover:bg-neutral-300 dark:hover:bg-zinc-800 transition-colors border border-black dark:border-zinc-700 bg-white dark:bg-zinc-900"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3 h-3 text-black dark:text-zinc-200" />
          </button>
        </div>
      </div>

      {/* Screen Stage */}
      <div className="p-6 min-h-[340px] flex items-center justify-center relative bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]">
        
        {currentStep === "typing" ? (
          <div className="w-full max-w-sm flex flex-col gap-4">
            {/* AI Prompt Input Card */}
            <div className="bg-white dark:bg-[#1E1E22] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.1)] transition-colors">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase text-[#2E7D32] dark:text-[#a78bfa] mb-2">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>AI Prompt Creator</span>
              </div>
              <div className="w-full border border-black dark:border-zinc-700 p-2.5 font-mono text-xs text-black dark:text-zinc-200 bg-[#FAF9F6] dark:bg-[#28282C] min-h-[60px] relative">
                {typedPrompt}
                <span className="w-1.5 h-3.5 bg-black dark:bg-[#a78bfa] inline-block animate-pulse ml-0.5" />
              </div>
            </div>

            {/* AI Generation State */}
            <AnimatePresence>
              {formIsGenerated && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#E8F5E9] dark:bg-emerald-950/40 border border-emerald-500 text-emerald-800 dark:text-emerald-300 px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-mono tracking-widest text-emerald-700 dark:text-emerald-400">STATUS: PROCESSED</p>
                    <p className="text-xs text-black dark:text-zinc-100">AI Form generated with 5 branch flows!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#1E1E22] border-2 border-black dark:border-zinc-700 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(167,139,250,0.2)]"
            >
              <div className="flex items-center justify-between border-b border-black dark:border-zinc-700 pb-2.5 mb-4">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Live Preview Interactive</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 px-1.5 py-0.2 border border-amber-300 dark:border-amber-800">Branching active</span>
              </div>

              {selectedCoffeeOption === null ? (
                <div>
                  <h4 className="font-sans font-black uppercase text-sm text-black dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-amber-700" />
                    How do you prefer your caffeine?
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 mb-4 font-semibold">Select an option to watch the form adapt in real-time.</p>

                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedCoffeeOption("hot")}
                      className="text-left p-2.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider hover:bg-amber-50 dark:hover:bg-zinc-700 text-black dark:text-zinc-200 flex items-center justify-between"
                    >
                      <span>A) Warm & Cozy (Hot Brews)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setSelectedCoffeeOption("cold")}
                      className="text-left p-2.5 border border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider hover:bg-amber-50 dark:hover:bg-zinc-700 text-black dark:text-zinc-200 flex items-center justify-between"
                    >
                      <span>B) Ice-Cold Refreshment (Iced)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="mb-4 bg-amber-50 dark:bg-zinc-800/50 p-2 border border-black dark:border-zinc-700 text-[10px] text-black dark:text-zinc-300 flex justify-between items-center">
                    <span>Selected: <b>{selectedCoffeeOption === "hot" ? "Hot Brews" : "Iced"}</b></span>
                    <button 
                      onClick={() => setSelectedCoffeeOption(null)}
                      className="text-[9px] uppercase font-mono font-bold underline text-gray-500 hover:text-black dark:hover:text-white"
                    >
                      Change
                    </button>
                  </div>

                  {selectedCoffeeOption === "hot" ? (
                    <div>
                      <h4 className="font-sans font-black uppercase text-sm text-black dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        AI Branch: Favorite roast type?
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mb-4 font-semibold">The form adapted to your temperature choice.</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button className="p-2 border border-black dark:border-zinc-700 bg-[#E8F5E9] dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200 hover:bg-emerald-100">Light & Fruity</button>
                        <button className="p-2 border border-black dark:border-zinc-700 bg-[#E8F5E9] dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200 hover:bg-emerald-100">Rich Dark Roast</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-sans font-black uppercase text-sm text-black dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        AI Branch: How do you like your ice?
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-zinc-400 mb-4 font-semibold">The form adapted to show iced preferences.</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button className="p-2 border border-black dark:border-zinc-700 bg-[#E3F2FD] dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200 hover:bg-blue-100">Crushed Ice</button>
                        <button className="p-2 border border-black dark:border-zinc-700 bg-[#E3F2FD] dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-black dark:text-zinc-200 hover:bg-blue-100">Cold Brew Only</button>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={resetSimulation}
                    className="mt-6 w-full py-2 bg-black dark:bg-[#A78BFA] text-white dark:text-black border-2 border-black dark:border-black text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Start Simulation Over
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Control Instruction Bar */}
      <div className="bg-[#FAF9F5] dark:bg-[#1A1A1D] border-t-2 border-black dark:border-zinc-700 p-3 flex items-center justify-between text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
        <span>Interactive Mode: Click options to try branch paths</span>
        <span className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-black dark:text-zinc-200" /> Mobile preview Responsive
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 2. ACT FEATURE GIF (Growth Flow)
// ==========================================
type Industry = "b2b" | "ecommerce" | "local";

export function ActFeatureGif({ darkMode }: GifProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [industry, setIndustry] = useState<Industry>("b2b");
  const [currentActiveNode, setCurrentActiveNode] = useState<number>(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  // Simulation timeline interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentActiveNode((prev) => {
        const next = (prev + 1) % 4;
        
        // Append log simulation messages
        const logMap: Record<Industry, string[]> = {
          b2b: [
            "📥 Form submission captured: Mark@acme.com",
            "🔍 Database lookup: Acme Corp found (92% confidence)",
            "💳 Subscription initialized: Enterprise tier, $1,500/mo",
            "🚀 Actions triggered: Slack notified & Google Cal invite dispatched!"
          ],
          ecommerce: [
            "📥 Checkout Form completed: Sarah@shop.com",
            "🔍 Enrichment: Lifetime Value $420, Shopify shopper profile matched",
            "💳 Stripe payment succeeded: $120.00 cart value",
            "🚀 Actions triggered: Welcome SMS & Coupon Code delivered!"
          ],
          local: [
            "📥 Dinner Reservation: Table for 4, tonight at 8 PM",
            "🔍 Profile: VIP guest, prefers outdoor seating, dietary: vegan",
            "💳 Deposit handled successfully: $50.00 confirmation hold",
            "🚀 Actions triggered: Chef alerted & calendar reminder sent!"
          ]
        };

        setSimulationLogs((logs) => {
          const matchedLogs = logMap[industry];
          const newLog = matchedLogs[next];
          if (next === 0) return [newLog];
          return [...logs, newLog].slice(-4);
        });

        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isPlaying, industry]);

  const triggerManualRun = () => {
    setCurrentActiveNode(0);
    setSimulationLogs(["📥 Manual simulation initialized. Waiting for trigger..."]);
  };

  return (
    <div className="w-full border-2 border-black dark:border-zinc-700 bg-[#FAF9F5] dark:bg-[#151518] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] flex flex-col overflow-hidden font-sans">
      {/* Player header */}
      <div className="bg-[#EFEFEE] dark:bg-[#1F1F23] border-b-2 border-black dark:border-zinc-700 px-4 py-2 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-zinc-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] tracking-widest text-gray-500 dark:text-zinc-400">growth_automation_pipeline.gif</span>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value as Industry);
              triggerManualRun();
            }}
            className="text-[9px] uppercase font-mono font-bold bg-white dark:bg-zinc-800 text-black dark:text-zinc-200 border border-black dark:border-zinc-700 p-0.5"
          >
            <option value="b2b">B2B SaaS Lead</option>
            <option value="ecommerce">E-Commerce Checkout</option>
            <option value="local">Local Cafe Guest</option>
          </select>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className="p-1 hover:bg-neutral-300 dark:hover:bg-zinc-800 transition-colors border border-black dark:border-zinc-700 bg-white dark:bg-zinc-900"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="p-6 min-h-[340px] flex flex-col justify-between relative bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#252528_1px,transparent_1px),linear-gradient(to_bottom,#252528_1px,transparent_1px)] [background-size:24px_24px]">
        {/* Nodes Flow row */}
        <div className="grid grid-cols-4 gap-2.5 relative items-center py-4">
          
          {/* Node 1: Trigger Form */}
          <div className={`p-2.5 border border-black dark:border-zinc-700 transition-all ${
            currentActiveNode === 0 
              ? "bg-amber-100 dark:bg-amber-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-105" 
              : "bg-white dark:bg-[#1E1E22] opacity-70"
          }`}>
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[8px] font-mono font-black uppercase text-gray-500">Node 01</span>
            </div>
            <h5 className="font-sans font-black text-[9px] uppercase tracking-wide text-black dark:text-zinc-200">Form Submit</h5>
            <p className="text-[8px] text-gray-500 mt-1 line-clamp-1">Trigger active</p>
          </div>

          {/* Node 2: AI Enricher */}
          <div className={`p-2.5 border border-black dark:border-zinc-700 transition-all ${
            currentActiveNode === 1 
              ? "bg-blue-100 dark:bg-blue-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-105" 
              : "bg-white dark:bg-[#1E1E22] opacity-70"
          }`}>
            <div className="flex items-center gap-1 mb-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[8px] font-mono font-black uppercase text-gray-500">Node 02</span>
            </div>
            <h5 className="font-sans font-black text-[9px] uppercase tracking-wide text-black dark:text-zinc-200">AI Enrich</h5>
            <p className="text-[8px] text-gray-500 mt-1 line-clamp-1">
              {industry === "b2b" ? "92% B2B match" : "Consumer lookup"}
            </p>
          </div>

          {/* Node 3: Billing Gateway */}
          <div className={`p-2.5 border border-black dark:border-zinc-700 transition-all ${
            currentActiveNode === 2 
              ? "bg-emerald-100 dark:bg-emerald-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-105" 
              : "bg-white dark:bg-[#1E1E22] opacity-70"
          }`}>
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[8px] font-mono font-black uppercase text-gray-500">Node 03</span>
            </div>
            <h5 className="font-sans font-black text-[9px] uppercase tracking-wide text-black dark:text-zinc-200">Stripe Sync</h5>
            <p className="text-[8px] text-gray-500 mt-1 line-clamp-1">Charge & Invoice</p>
          </div>

          {/* Node 4: Actions Delivery */}
          <div className={`p-2.5 border border-black dark:border-zinc-700 transition-all ${
            currentActiveNode === 3 
              ? "bg-purple-100 dark:bg-purple-950/40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-105" 
              : "bg-white dark:bg-[#1E1E22] opacity-70"
          }`}>
            <div className="flex items-center gap-1 mb-1">
              <Mail className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-[8px] font-mono font-black uppercase text-gray-500">Node 04</span>
            </div>
            <h5 className="font-sans font-black text-[9px] uppercase tracking-wide text-black dark:text-zinc-200">Dispatch Msg</h5>
            <p className="text-[8px] text-gray-500 mt-1 line-clamp-1">SMS & CRM alerts</p>
          </div>
        </div>

        {/* Console / Log output block */}
        <div className="border border-black dark:border-zinc-700 bg-[#FAF9F5] dark:bg-[#1A1A1D] p-3 font-mono text-[9px] text-black dark:text-zinc-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-3">
          <div className="flex items-center justify-between border-b border-gray-300 dark:border-zinc-700 pb-1.5 mb-2">
            <span className="font-black tracking-wider text-gray-500 dark:text-zinc-400">Automation Realtime Audit Log</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">● ACTIVE</span>
          </div>
          <div className="flex flex-col gap-1 min-h-[85px]">
            {simulationLogs.length === 0 ? (
              <span className="text-gray-400 italic">Starting pipeline trigger loop...</span>
            ) : (
              simulationLogs.map((log, lIdx) => (
                <motion.div 
                  key={lIdx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1"
                >
                  <span className="text-gray-400">[{new Date().toLocaleTimeString().split(" ")[0]}]</span>
                  <span>{log}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Control instruction footer */}
      <div className="bg-[#FAF9F5] dark:bg-[#1A1A1D] border-t-2 border-black dark:border-zinc-700 p-3 flex items-center justify-between text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
        <span>Change Industry preset to test custom payloads</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Automations run in &lt;1.2s
        </span>
      </div>
    </div>
  );
}

// ==========================================
// 3. LEARN FEATURE GIF (Research Flow)
// ==========================================
type StudyTopic = "ux" | "logo" | "culture";

export function LearnFeatureGif({ darkMode }: GifProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [topic, setTopic] = useState<StudyTopic>("ux");
  const [dialogSteps, setDialogSteps] = useState<number>(0);

  const dialogData: Record<StudyTopic, { speaker: "ai" | "user"; msg: string }[]> = {
    ux: [
      { speaker: "ai", msg: "What is your biggest roadblock during checkout on our app?" },
      { speaker: "user", msg: "Entering billing information on mobile is tedious, there are too many fields." },
      { speaker: "ai", msg: "That makes sense. If we auto-filled billing or had Apple Pay, would you purchase more?" },
      { speaker: "user", msg: "Absolutely. I'd buy twice as fast instead of abandoning my cart!" }
    ],
    logo: [
      { speaker: "ai", msg: "Which of these three logo variations strikes you as most professional?" },
      { speaker: "user", msg: "The blue organic pebble one feels very modern and high-trust." },
      { speaker: "ai", msg: "Interesting! Does it communicate tech-savviness or friendliness to you?" },
      { speaker: "user", msg: "Both, but specifically friendliness. It doesn't look like a clinical tech corp." }
    ],
    culture: [
      { speaker: "ai", msg: "How would you describe our workplace environment in three single words?" },
      { speaker: "user", msg: "Fast-paced, creative, autonomous." },
      { speaker: "ai", msg: "Tell me more about 'autonomous'. Do you feel supported when making decisions?" },
      { speaker: "user", msg: "Yes, our managers provide clear targets but completely trust our execution." }
    ]
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setDialogSteps((prev) => (prev + 1) % 5);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeDialog = dialogData[topic].slice(0, dialogSteps);

  return (
    <div className="w-full border-2 border-black dark:border-zinc-700 bg-[#FAF9F5] dark:bg-[#151518] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(167,139,250,0.15)] flex flex-col overflow-hidden font-sans">
      {/* Player header */}
      <div className="bg-[#EFEFEE] dark:bg-[#1F1F23] border-b-2 border-black dark:border-zinc-700 px-4 py-2 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-zinc-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
          <span className="text-[10px] tracking-widest text-gray-500 dark:text-zinc-400">ai_voice_research_simulator.gif</span>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value as StudyTopic);
              setDialogSteps(1);
            }}
            className="text-[9px] uppercase font-mono font-bold bg-white dark:bg-zinc-800 text-black dark:text-zinc-200 border border-black dark:border-zinc-700 p-0.5"
          >
            <option value="ux">Mobile Checkout UX</option>
            <option value="logo">Logo Aesthetics</option>
            <option value="culture">Company Culture Study</option>
          </select>
          <button 
            onClick={() => setDialogSteps(1)} 
            className="p-1 hover:bg-neutral-300 dark:hover:bg-zinc-800 transition-colors border border-black dark:border-zinc-700 bg-white dark:bg-zinc-900"
            title="Reset Dialog"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Screen Split Stage */}
      <div className="p-4 md:p-6 min-h-[340px] grid grid-cols-1 md:grid-cols-2 gap-4 relative bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]">
        
        {/* Column 1: AI Chat Transcript Bubble Animation */}
        <div className="border border-black dark:border-zinc-700 bg-white dark:bg-[#1A1A1D] p-3 flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[260px]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-700 pb-1.5 mb-2 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
            <span>Interview Transcript</span>
            <span className="text-purple-600 dark:text-purple-400">Moderator: Bot</span>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-1 max-h-[220px]">
            {activeDialog.map((item, dIdx) => (
              <motion.div 
                key={dIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 max-w-[85%] ${item.speaker === "ai" ? "self-start" : "self-end flex-row-reverse"}`}
              >
                <div className={`w-6 h-6 rounded-none border border-black flex items-center justify-center shrink-0 ${
                  item.speaker === "ai" ? "bg-purple-100 text-purple-800" : "bg-neutral-100 text-neutral-800"
                }`}>
                  {item.speaker === "ai" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className={`p-2 border border-black text-[10px] font-semibold leading-relaxed ${
                  item.speaker === "ai" 
                    ? "bg-[#FAF7FE] dark:bg-purple-950/20 text-black dark:text-zinc-200" 
                    : "bg-[#F5F5F5] dark:bg-zinc-800 text-black dark:text-zinc-200"
                }`}>
                  {item.msg}
                </div>
              </motion.div>
            ))}

            {dialogSteps === 0 && (
              <span className="text-gray-400 italic text-[10px] text-center my-auto">Initializing live study moderator agent...</span>
            )}
          </div>
        </div>

        {/* Column 2: Live AI Generated Charts */}
        <div className="border border-black dark:border-zinc-700 bg-white dark:bg-[#1A1A1D] p-3 flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-700 pb-1.5 mb-2 text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">
              <span>Study Sentiment & Topics</span>
              <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400 border border-purple-300 dark:border-purple-800 px-1 py-0.2 text-[8px]">Live report</span>
            </div>

            {/* Dynamic visual representation */}
            <div className="mt-3 flex flex-col gap-3 font-sans">
              
              {/* Sentiment bars based on dialog steps */}
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Sentiment Distribution</span>
                <div className="flex gap-1.5 mt-1.5 items-center">
                  <div className="flex-1 bg-gray-100 dark:bg-zinc-800 h-4 border border-black dark:border-zinc-700 overflow-hidden relative flex">
                    <motion.div 
                      className="bg-emerald-400 h-full border-r border-black" 
                      animate={{ 
                        width: topic === "ux" 
                          ? `${40 + dialogSteps * 5}%` 
                          : topic === "logo" 
                          ? `${55 + dialogSteps * 3}%` 
                          : `${70 + dialogSteps * 2}%` 
                      }} 
                    />
                    <motion.div 
                      className="bg-amber-300 h-full border-r border-black" 
                      animate={{ 
                        width: topic === "ux" 
                          ? `${30 - dialogSteps * 2}%` 
                          : topic === "logo" 
                          ? `${25 - dialogSteps * 1}%` 
                          : `${15}%` 
                      }} 
                    />
                  </div>
                  <span className="text-[9px] font-mono font-black uppercase text-emerald-600 dark:text-emerald-400">
                    {topic === "ux" ? `${40 + dialogSteps * 5}% POS` : `${55 + dialogSteps * 3}% POS`}
                  </span>
                </div>
              </div>

              {/* Keyword weight tag cloud simulated with absolute sizing */}
              <div className="mt-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">AI Cluster Topics</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={`px-2 py-0.5 border border-black text-[9px] font-bold uppercase transition-all ${
                    topic === "ux" ? "bg-purple-100 text-purple-800 font-black scale-105" : "bg-neutral-50 dark:bg-zinc-800 text-neutral-400"
                  }`}>
                    Checkout Flow
                  </span>
                  <span className={`px-2 py-0.5 border border-black text-[9px] font-bold uppercase transition-all ${
                    topic === "logo" ? "bg-purple-100 text-purple-800 font-black scale-105" : "bg-neutral-50 dark:bg-zinc-800 text-neutral-400"
                  }`}>
                    Visual Pebbles
                  </span>
                  <span className={`px-2 py-0.5 border border-black text-[9px] font-bold uppercase transition-all ${
                    topic === "culture" ? "bg-purple-100 text-purple-800 font-black scale-105" : "bg-neutral-50 dark:bg-zinc-800 text-neutral-400"
                  }`}>
                    Work Autonomy
                  </span>
                  <span className={`px-2 py-0.5 border border-black text-[9px] font-bold uppercase transition-all ${
                    dialogSteps > 2 ? "bg-amber-100 text-amber-800" : "bg-neutral-50 dark:bg-zinc-800 text-neutral-300"
                  }`}>
                    Friction Points
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-gray-400 dark:text-zinc-500 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-2.5 mt-2">
            <span>Studies configured: 14 participants</span>
            <span className="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 font-bold">
              <TrendingUp className="w-3 h-3" /> Report Ready
            </span>
          </div>
        </div>
      </div>

      {/* Control instruction footer */}
      <div className="bg-[#FAF9F5] dark:bg-[#1A1A1D] border-t-2 border-black dark:border-zinc-700 p-3 flex items-center justify-between text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
        <span>AI moderates 1000s of voice/text studies instantly</span>
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Proven 3.5x more data
        </span>
      </div>
    </div>
  );
}
