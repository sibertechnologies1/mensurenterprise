import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ─── Validation ────────────────────────────────────────────────────────────────

const validateFields = ({ email, password }) => {
  const errors = {};
  if (!email.trim())
    errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (!password)
    errors.password = "Password is required.";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters.";
  return errors;
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

// ─── Reusable Field ───────────────────────────────────────────────────────────

function Field({ label, id, error, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon />
          </span>
        )}
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
          <IconAlert /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Login() {
  const { login }  = useContext(AuthContext);
  const navigate   = useNavigate();
  const location   = useLocation();

  // Redirect back to wherever the user came from, or /shop by default
  const from = location.state?.from?.pathname || "/shop";

  const [fields,    setFields]   = useState({ email: "", password: "" });
  const [errors,    setErrors]   = useState({});
  const [apiError,  setApiError] = useState("");
  const [loading,   setLoading]  = useState(false);
  const [showPass,  setShowPass] = useState(false);
  const [remember,  setRemember] = useState(false);

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
    if (apiError)    setApiError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validateFields(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = login({ email: fields.email, password: fields.password });
      if (!res.ok) {
        setApiError(res.error || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Role-aware redirect: admins → /admin, everyone else → from or /shop
      const user = res.user || {};
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      setApiError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputCls = (key) =>
    `w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm outline-none transition-colors duration-150
     bg-white text-gray-900 placeholder:text-gray-400 ${
      errors[key]
        ? "border-red-400 focus:border-red-500 bg-red-50/20"
        : "border-gray-200 focus:border-green-500 hover:border-gray-300"
    }`;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-baseline gap-0">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Mensur</span>
            <span className="text-2xl font-bold text-green-600 tracking-tight">Enterprises</span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 md:px-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Welcome back</h1>

          {/* API error banner */}
          {apiError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <IconAlert />
              <span className="leading-relaxed">{apiError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">

            {/* Email */}
            <Field label="Email address" id="email" error={errors.email} icon={IconMail}>
              <input
                id="email"
                type="email"
                value={fields.email}
                onChange={set("email")}
                placeholder="Email"
                disabled={loading}
                autoComplete="email"
                className={inputCls("email")}
              />
            </Field>

            {/* Password */}
            <Field label="Password" id="password" error={errors.password} icon={IconLock}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={fields.password}
                onChange={set("password")}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                className={`${inputCls("password")} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </Field>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setRemember((v) => !v)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    remember
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {remember && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition-colors duration-150 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in…
                </>
              ) : "Sign in"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google sign-in stub */}
            <button
              type="button"
              onClick={() => alert("Google sign-in requires OAuth setup. Contact the developer to enable this.")}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-5 mt-5 flex-wrap">
          {[
            { icon: IconShield, text: "SSL encrypted" },
            { icon: IconLock,   text: "Secure login"  },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="text-green-500"><Icon /></span>
              {text}
            </div>
          ))}
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}