"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "../auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { registerAccount } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!password) {
      return { score: 0, label: "Enter password", color: "text-slate-400", barColor: "bg-slate-200" };
    }
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;
    if (password.length >= 14 && /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) {
      return { score: 1, label: "Weak", color: "text-rose-600", barColor: "bg-rose-500" };
    }
    if (score === 2) {
      return { score: 2, label: "Fair", color: "text-amber-600", barColor: "bg-amber-500" };
    }
    if (score === 3) {
      return { score: 3, label: "Strong", color: "text-emerald-700", barColor: "bg-emerald-600" };
    }
    return { score: 4, label: "Very Strong", color: "text-emerald-700", barColor: "bg-emerald-600" };
  }, [password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      setShakeKey((prev) => prev + 1);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      setShakeKey((prev) => prev + 1);
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      setShakeKey((prev) => prev + 1);
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      setShakeKey((prev) => prev + 1);
      return;
    }
    if (!agreedTerms) {
      setFormError("Please agree to the Terms of Service and Privacy Policy.");
      setShakeKey((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    setIsCreated(false);
    try {
      await registerAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      setIsCreated(true);
      router.push("/rent");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to create account. Please try again."
      );
      setShakeKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-[#0b1c30] text-[14px] leading-[22px] antialiased relative">
      {/* Header Navigation: UniLend Top Navigation Bar matching Login Screen */}
      <header className="w-full top-0 sticky z-50 bg-white/80 backdrop-blur-md border-b border-[#c6c6cd]/30 shadow-xs transition-all duration-200">
        <div className="flex justify-between items-center w-full px-6 lg:px-8 max-w-[1360px] mx-auto h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <Link
              className="text-[18px] leading-[26px] tracking-tight font-bold text-[#0b1c30] hover:opacity-90 transition-opacity"
              href="/"
            >
              UNILEND.™
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-10 text-[13px] leading-[18px] tracking-[0.02em] font-semibold text-[#45464d]">
            <Link className="hover:text-[#0b1c30] transition-colors duration-150" href="/">
              Home
            </Link>
            <Link
              className="hover:text-[#0b1c30] transition-colors duration-150"
              href="/#featured"
            >
              Categories
            </Link>
            <Link
              className="hover:text-[#0b1c30] transition-colors duration-150"
              href="/rent"
            >
              Borrow
            </Link>
            <Link
              className="hover:text-[#0b1c30] transition-colors duration-150"
              href="/#how-it-works"
            >
              Explore
            </Link>
            <Link
              className="hover:text-[#0b1c30] transition-colors duration-150"
              href="/#contact"
            >
              Contact us
            </Link>
          </nav>

          {/* Trailing Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              className="inline-flex items-center justify-center h-10 px-6 rounded-full border border-[#c6c6cd]/60 bg-white/90 text-[13px] leading-[18px] tracking-[0.02em] font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors duration-150"
              href="/login"
            >
              Login
            </Link>
            <Link
              className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-black text-[13px] leading-[18px] tracking-[0.02em] font-semibold text-white ring-2 ring-black/10 shadow-xs hover:bg-[#45464d] transition-all duration-150"
              href="/register"
            >
              Join
            </Link>
          </div>
        </div>
      </header>

      {/* Main Viewport: Centered Registration Card with High Breathing Room */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative">
        {/* Soft decorative radial backing matching Home page */}
        <div
          aria-hidden="true"
          className="absolute w-[460px] h-[460px] rounded-full bg-gradient-to-br from-rose-100/40 via-purple-100/30 to-transparent blur-3xl pointer-events-none -z-10"
        />

        {/* Registration Card Container (~452px wide) */}
        <section
          key={shakeKey}
          className={`w-full max-w-[452px] bg-white/95 backdrop-blur-xl border border-[#c6c6cd]/40 rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_-15px_rgba(15,23,42,0.06)] relative z-10 transition-all ${
            shakeKey > 0 ? "animate-shake" : ""
          }`}
        >
          {/* Card Header */}
          <div className="text-center mb-6">
            <h1 className="text-[28px] leading-[36px] tracking-[-0.02em] font-semibold text-[#0b1c30]">
              Create Your Account
            </h1>
            <p className="text-[#45464d] text-[14px] leading-[22px] mt-1">
              Join UniLend and discover a smarter way to rent.
            </p>
          </div>

          {/* Registration Form */}
          <form className="space-y-4" noValidate onSubmit={handleSubmit}>
            {/* Field: Full Name */}
            <div className="space-y-1.5">
              <label
                className="block text-[11px] leading-[16px] font-semibold text-[#0b1c30] tracking-wider uppercase"
                htmlFor="full_name"
              >
                FULL NAME
              </label>
              <div className="relative">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formError) setFormError(null);
                    if (isCreated) setIsCreated(false);
                  }}
                  placeholder="Enter your full name"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#c6c6cd]/70 bg-white text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all duration-150"
                />
              </div>
            </div>

            {/* Field: Email Address */}
            <div className="space-y-1.5">
              <label
                className="block text-[11px] leading-[16px] font-semibold text-[#0b1c30] tracking-wider uppercase"
                htmlFor="email"
              >
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError(null);
                    if (isCreated) setIsCreated(false);
                  }}
                  placeholder="Enter your email address"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#c6c6cd]/70 bg-white text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all duration-150"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <label
                className="block text-[11px] leading-[16px] font-semibold text-[#0b1c30] tracking-wider uppercase"
                htmlFor="password"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError(null);
                    if (isCreated) setIsCreated(false);
                  }}
                  placeholder="Create a password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-[#c6c6cd]/70 bg-white text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all duration-150"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#76777d] hover:text-[#0b1c30] transition-colors"
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Password Guidance & Segmented Strength Bar */}
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center gap-1.5 w-full">
                  {[1, 2, 3, 4].map((segment) => (
                    <span
                      key={segment}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        segment <= passwordStrength.score
                          ? passwordStrength.barColor
                          : "bg-[#c6c6cd]/40"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[12px] leading-[18px] text-[#45464d] flex items-center justify-between">
                  <span>At least 8 characters with letters &amp; numbers</span>
                  <span
                    className={`text-[11px] leading-[16px] tracking-normal font-semibold ${passwordStrength.color}`}
                  >
                    {passwordStrength.label}
                  </span>
                </p>
              </div>
            </div>

            {/* Field: Confirm Password */}
            <div className="space-y-1.5">
              <label
                className="block text-[11px] leading-[16px] font-semibold text-[#0b1c30] tracking-wider uppercase"
                htmlFor="confirm_password"
              >
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formError) setFormError(null);
                    if (isCreated) setIsCreated(false);
                  }}
                  placeholder="Re-enter your password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-[#c6c6cd]/70 bg-white text-[#0b1c30] placeholder:text-[#76777d] text-[14px] focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all duration-150"
                />
                <button
                  type="button"
                  aria-label="Toggle confirm password visibility"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#76777d] hover:text-[#0b1c30] transition-colors"
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms and Consent Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => {
                    setAgreedTerms(e.target.checked);
                    if (formError) setFormError(null);
                  }}
                  className="mt-1 h-4 w-4 rounded border-[#c6c6cd]/80 text-black focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                />
                <span className="text-[12px] leading-[18px] text-[#45464d] leading-snug">
                  I agree to the{" "}
                  <Link
                    className="text-[#0b1c30] font-medium underline underline-offset-2 hover:text-black transition-colors"
                    href="/"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="text-[#0b1c30] font-medium underline underline-offset-2 hover:text-black transition-colors"
                    href="/"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {formError && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 pt-0.5">
                <span className="material-symbols-outlined text-[15px]">error</span>
                <span>{formError}</span>
              </p>
            )}

            {/* Primary Call to Action */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 mt-2 text-white rounded-full text-[13px] leading-[18px] tracking-[0.02em] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.99] transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-black/20 ${
                isCreated ? "bg-emerald-600 hover:bg-emerald-700" : "bg-black hover:bg-[#45464d]"
              }`}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : isCreated ? (
                <span>Account Created!</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="text-base leading-none">→</span>
                </>
              )}
            </button>
          </form>

          {/* Elegant Line Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#c6c6cd]/30" />
            </div>
            <div className="relative bg-white px-3">
              <span className="text-[11px] leading-[16px] font-semibold uppercase tracking-wider text-[#76777d]">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Social Authentication: Google SSO */}
          <div>
            <button
              type="button"
              className="w-full h-11 rounded-lg border border-[#c6c6cd]/70 bg-white hover:bg-[#eff4ff] text-[13px] leading-[18px] tracking-[0.02em] font-semibold text-[#0b1c30] flex items-center justify-center gap-2.5 transition-colors duration-150 hover:border-[#76777d]"
            >
              {/* Authentic Multicolor Google G */}
              <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  fill="#4285F4"
                />
                <path
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  fill="#34A853"
                />
                <path
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Card Sub-Footer: Switch to Sign In */}
          <div className="mt-6 text-center">
            <p className="text-[12px] leading-[18px] text-[#45464d]">
              Already have an account?{" "}
              <Link
                className="font-semibold text-[#0b1c30] underline underline-offset-2 hover:text-black transition-colors ml-1"
                href="/login"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Security Trust Indicator */}
          <div className="mt-4 pt-3 border-t border-[#c6c6cd]/20 flex items-center justify-center gap-1.5 text-[#76777d]">
            <span className="material-symbols-outlined text-[15px] fill-icon">lock</span>
            <span className="text-[11px] leading-[16px] font-medium text-[#45464d]/75">
              Enterprise-grade 256-bit encryption
            </span>
          </div>
        </section>
      </main>

      {/* Page Footer: Minimal Web Baseline Footer */}
      <footer className="w-full bg-[#f8f9ff] border-t border-[#c6c6cd]/30 transition-colors duration-150">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 lg:px-8 py-4 max-w-[1360px] mx-auto gap-4">
          <p className="text-[12px] leading-[18px] text-[#45464d]">
            © 2025 UniLend Technologies Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              className="text-[11px] leading-[16px] font-semibold text-[#45464d] hover:text-[#0b1c30] transition-colors duration-150"
              href="/"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-[11px] leading-[16px] font-semibold text-[#45464d] hover:text-[#0b1c30] transition-colors duration-150"
              href="/"
            >
              Terms of Service
            </Link>
            <Link
              className="text-[11px] leading-[16px] font-semibold text-[#45464d] hover:text-[#0b1c30] transition-colors duration-150"
              href="/"
            >
              Security Architecture
            </Link>
            <Link
              className="text-[11px] leading-[16px] font-semibold text-[#45464d] hover:text-[#0b1c30] transition-colors duration-150"
              href="/"
            >
              Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
