import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, ArrowRight, RefreshCw, Lock, Eye, EyeOff, Home, KeyRound } from "lucide-react";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";

export default function AdminLogin() {
  const router = useRouter();

  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const otpRefs = useRef([]);

  const adminFetch = (url, options = {}) =>
    fetch(url, { credentials: "include", ...options });

  useEffect(() => {
    adminFetch("/api/admin/verify-session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          window.location.replace("/admin/dashboard");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyCredentials = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/verify-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setError(
          res.ok
            ? "Invalid server response."
            : "Server error. Stop the dev server, delete the .next folder, and run npm run dev again."
        );
        return;
      }

      if (!data.success) {
        setError(data.error || "Invalid email or password");
        return;
      }

      setSuccess("Credentials verified. Sending OTP...");
      await sendOtpAfterCredentials();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtpAfterCredentials = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStep("otp");
        setSuccess("OTP sent to your email!");
        setResendTimer(60);
        setTimeout(() => setSuccess(""), 3000);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value.slice(-1);
    setOtp(newOTP);
    setError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newOTP.every((d) => d !== "")) {
      handleVerifyOTP(newOTP.join(""));
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.every((d) => d !== "")) {
      handleVerifyOTP(otp.join(""));
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOTP = pasted.split("");
      setOtp(newOTP);
      otpRefs.current[5]?.focus();
      handleVerifyOTP(pasted);
    }
  };

  const handleVerifyOTP = async (otpString) => {
    if (isLoading) return;
    const code = otpString || otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await adminFetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: code }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        // Full navigation so the browser applies Set-Cookie before protected routes load
        window.location.replace(data.redirect || "/admin/dashboard");
        return;
      } else {
        setError(data.error || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    await sendOtpAfterCredentials();
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-linear-to-br dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <AdminThemeToggle />
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <Home size={16} />
            Main Site
          </Link>
        </div>

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-[120px]" />
          <div
            className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-[120px]"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-size-[50px_50px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-10 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-black/40">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30">
                <Shield size={32} className="text-white" />
              </div>
              <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">HC Portfolio Dashboard</p>
            </div>

            <div className="mb-8 flex items-center justify-center gap-2">
              <div
                className={`h-2 rounded-full transition-all ${step === "credentials" ? "w-6 bg-purple-500" : "w-2 bg-green-500"}`}
              />
              <div
                className={`h-2 rounded-full transition-all ${step === "otp" ? "w-6 bg-purple-500" : "w-2 bg-slate-300 dark:bg-slate-600"}`}
              />
            </div>

            <AnimatePresence mode="wait">
              {step === "credentials" && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-300">
                    Sign in with your admin email and password, then verify OTP
                  </p>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Admin Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyCredentials()}
                        placeholder="admin@example.com"
                        autoFocus
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pr-4 pl-12 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative">
                      <KeyRound size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyCredentials()}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pr-12 pl-12 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
                  {success && <p className="mb-4 text-center text-sm text-emerald-600 dark:text-green-400">{success}</p>}

                  <button
                    type="button"
                    onClick={handleVerifyCredentials}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 py-4 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        Continue to OTP
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <p className="mb-2 text-center text-sm text-slate-600 dark:text-slate-300">Enter the 6-digit OTP sent to</p>
                  <p className="mb-6 text-center text-sm font-medium text-purple-600 dark:text-purple-400">{email}</p>

                  <div className="mb-6 flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        onPaste={index === 0 ? handleOTPPaste : undefined}
                        className="h-14 w-12 rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-900 focus:border-purple-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                        style={{
                          boxShadow: digit ? "0 0 12px rgba(139,92,246,0.35)" : "none",
                          borderColor: error ? "#ef4444" : digit ? "#8b5cf6" : undefined,
                        }}
                      />
                    ))}
                  </div>

                  {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
                  {success && <p className="mb-4 text-center text-sm text-emerald-600 dark:text-green-400">{success}</p>}

                  <button
                    type="button"
                    onClick={() => handleVerifyOTP()}
                    disabled={isLoading || otp.some((d) => !d)}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 py-4 font-semibold text-white shadow-lg shadow-purple-500/30 transition-all disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <Lock size={18} />
                        Verify OTP & Login
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("credentials");
                        setOtp(["", "", "", "", "", ""]);
                        setError("");
                        setSuccess("");
                      }}
                      className="text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    >
                      ← Back to login
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || isLoading}
                      className="flex items-center gap-1 text-purple-600 transition-colors hover:text-purple-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-purple-400"
                    >
                      <RefreshCw size={14} />
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-600">
            HC Portfolio Admin Panel © {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
  );
}
