import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";

interface SignupProps {
  onNavigate: (path: string) => void;
  showNotification: (message: string, type: "success" | "info" | "error") => void;
}

export default function Signup({ onNavigate, showNotification }: SignupProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});

  const validate = () => {
    const tempErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      tempErrors.name = "Full name is required";
    }

    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    if (!passwordConfirm) {
      tempErrors.passwordConfirm = "Please confirm your password";
    } else if (password !== passwordConfirm) {
      tempErrors.passwordConfirm = "Passwords do not match";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(name, email, password, passwordConfirm);
      showNotification("Account created successfully! Welcome to Formify.", "success");
      onNavigate(""); // Redirects to Dashboard
    } catch (err: any) {
      showNotification(err.message || "Failed to sign up", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="signup-container" className="min-h-screen flex bg-[#fcfcfd] dark:bg-[#0d0d0f] font-sans">
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
            Start asking questions <span className="italic font-serif text-amber-100">differently</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-neutral-400 mt-6 leading-relaxed"
          >
            Create an account to build interactive forms, customize typography and background colors, analyze summary statistics, and export responses cleanly.
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
        <div className="lg:hidden flex items-center gap-2 mb-10">
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
              Create your account
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Start building professional, high-converting forms in seconds.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900/50 border ${
                    errors.name
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-100"
                  } rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-900/50 transition-all`}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
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
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900/50 border ${
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
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
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
                  className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-neutral-900/50 border ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-100"
                  } rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-900/50 transition-all`}
                  placeholder="Min. 6 characters"
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

            {/* Password Confirm Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password-confirm-input"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    if (errors.passwordConfirm) setErrors((prev) => ({ ...prev, passwordConfirm: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900/50 border ${
                    errors.passwordConfirm
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-neutral-100"
                  } rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-neutral-100 dark:focus:ring-neutral-900/50 transition-all`}
                  placeholder="Repeat your password"
                  required
                />
              </div>
              {errors.passwordConfirm && (
                <p className="text-xs text-red-500 mt-1">{errors.passwordConfirm}</p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="pt-2"
            >
              <button
                id="signup-submit-button"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#191919] hover:bg-black text-white dark:bg-[#f4f4f5] dark:hover:bg-white dark:text-black font-semibold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Toggle Redirect */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-6"
          >
            Already have an account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="font-semibold text-neutral-900 dark:text-white underline underline-offset-4 hover:opacity-80"
            >
              Sign in
            </button>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
