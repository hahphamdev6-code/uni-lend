"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { loginAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    let hasError = false;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Email address is required.");
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError("Please enter a valid email format.");
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) {
      setShakeKey((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    setIsSubmitted(false);
    try {
      await loginAccount({ email: trimmedEmail, password });
      setIsSubmitted(true);
      router.push("/rent");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Unable to sign in. Please try again."
      );
      setShakeKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-900 antialiased">
      {/* MainHeader */}
      <header
        className="w-full fixed top-0 left-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/60 transition-all duration-200"
        data-purpose="top-navigation-bar"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Brand Logo / Wordmark */}
          <div className="flex items-center gap-1.5 cursor-pointer select-none">
            <Link
              className="text-xl tracking-tight font-extrabold text-slate-950 flex items-baseline"
              href="/"
            >
              UNILEND<span className="text-xs font-semibold ml-0.5 tracking-normal">.™</span>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-9 text-[13px] font-medium tracking-normal text-slate-700">
            <Link className="hover:text-black transition-colors" href="/">
              Home
            </Link>
            <Link
              className="group flex items-center gap-1 hover:text-black transition-colors focus:outline-none"
              href="/#featured"
            >
              <span>Categories</span>
              <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-transform duration-150 group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </Link>
            <Link
              className="group flex items-center gap-1 hover:text-black transition-colors focus:outline-none"
              href="/rent"
            >
              <span>Borrow</span>
              <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-transform duration-150 group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </Link>
            <Link className="hover:text-black transition-colors" href="/#how-it-works">
              Explore
            </Link>
            <Link className="hover:text-black transition-colors" href="/#contact">
              Contact us
            </Link>
          </nav>

          {/* Right Side Action Buttons */}
          <div className="flex items-center space-x-3 text-[13px]">
            <Link
              className="px-5 py-2 rounded-full border border-slate-300 font-semibold text-slate-800 bg-white/60 hover:bg-white hover:border-slate-400 transition-all shadow-sm"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="px-6 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-medium transition-all shadow-sm"
              href="/register"
            >
              Join
            </Link>
          </div>
        </div>
      </header>

      {/* MainContent */}
      <main
        className="flex-grow flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 relative"
        data-purpose="login-viewport-wrapper"
      >
        {/* Soft decorative radial backing matching Home page */}
        <div
          aria-hidden="true"
          className="absolute w-[460px] h-[460px] rounded-full bg-gradient-to-br from-rose-100/40 via-purple-100/30 to-transparent blur-3xl pointer-events-none -z-10"
        />

        {/* Login Container Card */}
        <div
          key={shakeKey}
          className={`w-full max-w-[430px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 transition-all duration-300 ${
            shakeKey > 0 ? "animate-shake" : ""
          }`}
          data-purpose="login-form-card"
        >
          {/* Card Heading & Context */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-950 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
              Sign in to continue your UniLend experience.
            </p>
          </div>

          {/* Login Form Element */}
          <form className="space-y-4" noValidate onSubmit={handleSubmit}>
            {/* Email Input Field */}
            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                htmlFor="emailInput"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="emailInput"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (isSubmitted) setIsSubmitted(false);
                  }}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-150 bg-white ${
                    emailError
                      ? "border-rose-400 focus:ring-rose-400 focus:border-rose-400"
                      : "border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                  <svg
                    className="w-3.5 h-3.5 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            {/* Password Input Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-600"
                  htmlFor="passwordInput"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="passwordInput"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (isSubmitted) setIsSubmitted(false);
                  }}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-150 bg-white ${
                    passwordError
                      ? "border-rose-400 focus:ring-rose-400 focus:border-rose-400"
                      : "border-slate-200 focus:ring-slate-900 focus:border-slate-900"
                  }`}
                />
                {/* Show/Hide Password Interactive Button */}
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none p-1 rounded-md"
                >
                  {showPassword ? (
                    /* Eye On (Visible) Icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    /* Eye Off (Hidden) Icon */
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                  <svg
                    className="w-3.5 h-3.5 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            {/* Options: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  name="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>
              <a
                className="text-xs font-semibold text-slate-900 hover:text-slate-600 transition-colors"
                href="#forgot-password"
              >
                Forgot password?
              </a>
            </div>

            {/* Primary Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full relative flex items-center justify-center py-3.5 px-6 rounded-full text-white text-sm font-semibold tracking-wide transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed group ${
                  isSubmitted
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-950 hover:bg-slate-800"
                }`}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                ) : isSubmitted ? (
                  <span>Welcome back!</span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Center Divider Line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] tracking-wider uppercase font-semibold text-slate-400">
              <span className="bg-white/95 px-3">or continue with</span>
            </div>
          </div>

          {/* Social Authentication: Google */}
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700 text-xs font-semibold tracking-wide transition-all duration-150 bg-white shadow-xs"
            >
              {/* Official Google SVG Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Registration Invitation Link */}
          <p className="text-center text-xs text-slate-500 mt-6 pt-1">
            Don’t have an account?{" "}
            <Link
              className="font-bold text-slate-950 underline underline-offset-4 hover:text-slate-700 transition-colors"
              href="/register"
            >
              Join UniLend
            </Link>
          </p>

          {/* Security / Encryption Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span className="text-[11px] font-medium tracking-tight">
              Enterprise-grade 256-bit encryption
            </span>
          </div>
        </div>
      </main>

      {/* MinimalFooter */}
      <footer
        className="w-full py-6 px-6 border-t border-slate-200/50 text-[11px] text-slate-400 bg-white/40 backdrop-blur-sm"
        data-purpose="bottom-page-footer"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2025 UniLend Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link className="hover:text-slate-700 transition-colors" href="/">
              Privacy Policy
            </Link>
            <Link className="hover:text-slate-700 transition-colors" href="/">
              Terms of Service
            </Link>
            <Link className="hover:text-slate-700 transition-colors" href="/">
              Security Architecture
            </Link>
            <Link className="hover:text-slate-700 transition-colors" href="/">
              Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
