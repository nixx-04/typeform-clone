import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onNavigate: (path: string) => void;
  showNotification: (message: string, type: "success" | "info" | "error") => void;
}

export default function Login({ onNavigate, showNotification }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isNixDemo = email.toLowerCase() === "nix" || email.toLowerCase() === "nix@example.com";

    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(email) && !isNixDemo) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6 && !isNixDemo) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      showNotification("Welcome back!", "success");
      onNavigate(""); // Redirects to Dashboard
    } catch (err: any) {
      showNotification(err.message || "Failed to log in", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex bg-[#fcfcfd] dark:bg-[#0d0d0f] font-sans">
      {/* Left Pane - Brand Pitch (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#191919] text-[#f4f4f5] flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-t from-neutral-800 via-neutral-950 to-black opacity-30 pointer-events-none" />
        
        {/* Brand Header */}
        <div className="z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
            <span className="font-mono text-black font-extrabold text-base">T</span>
          </div>
          <span className="font-sans font-medium tracking-tight text-lg text-white">Formify</span>
        </div>

        {/* Big Catchy Text */}
        <div className="z-10 my-auto max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-sans font-normal tracking-tight text-white leading-[1.15]"
          >
            Create beautifully conversational <span className="italic font-serif text-amber-100">forms</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-neutral-400 mt-6 leading-relaxed"
          >
            Ask questions one at a time. Enhance your respondent experience and double your completion rate with interactive, human-like conversations.
          </motion.p>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} Formify Inc. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Minimalist Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center shadow-md">
            <span className="font-mono text-white dark:text-black font-extrabold text-base">T</span>
          </div>
          <span className="font-sans font-semibold tracking-tight text-lg text-neutral-950 dark:text-white">Formify</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-sans font-normal tracking-tight text-neutral-900 dark:text-white mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Sign in to manage and build your conversational forms.
            </p>
            <div id="demo-credentials-badge" className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl mb-6 flex flex-col gap-1 text-xs text-indigo-700 dark:text-indigo-300">
              <span className="font-semibold">✨ Quick Demo Access:</span>
              <span className="font-mono">Email/Username: <strong className="text-indigo-900 dark:text-indigo-100 font-bold">nix</strong></span>
              <span className="font-mono">Password: <strong className="text-indigo-900 dark:text-indigo-100 font-bold">123</strong></span>
            </div>
          </motion.div>

          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900/50 border ${
                    errors.email
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-100"
                  } rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-900/50 transition-all`}
                  placeholder="name@example.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-neutral-900/50 border ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-100"
                  } rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-900/50 transition-all`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <button
                id="login-submit-button"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#191919] hover:bg-black text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-black font-semibold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Toggle Redirect */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-8"
          >
            Don't have an account?{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="font-semibold text-neutral-900 dark:text-white underline underline-offset-4 hover:opacity-80"
            >
              Create one for free
            </button>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
