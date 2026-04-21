import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ─── Validation ────────────────────────────────────────────────────────────────

const validateFields = ({ name, email, password, confirm }) => {
  const errors = {};
  if (!name.trim() || name.trim().length < 2)
    errors.name = "Full name must be at least 2 characters.";
  if (!email.trim())
    errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (!password)
    errors.password = "Password is required.";
  else if (password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (!confirm)
    errors.confirm = "Please confirm your password.";
  else if (confirm !== password)
    errors.confirm = "Passwords do not match.";
  return errors;
};

// Password strength scorer (0–4)
function scorePassword(pw) {
  let score = 0;
  if (!pw) return score;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const strengthMeta = [
  { label: "Too weak",  color: "bg-red-500"    },
  { label: "Weak",      color: "bg-orange-400" },
  { label: "Fair",      color: "bg-amber-400"  },
  { label: "Good",      color: "bg-lime-500"   },
  { label: "Strong",    color: "bg-green-600"  },
];

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
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
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
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/>
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

// ─── Password Field with show/hide ────────────────────────────────────────────

function PasswordField({ id, label, value, onChange, error, placeholder, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} id={id} error={error} icon={IconLock}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={id === "password" ? "new-password" : "new-password"}
        className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm outline-none transition-colors duration-150 bg-white text-gray-900 placeholder:text-gray-400 ${
          error
            ? "border-red-400 focus:border-red-500 bg-red-50/20"
            : "border-gray-200 focus:border-green-500 hover:border-gray-300"
        }`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </Field>
  );
}

// ─── Password Strength Bar ────────────────────────────────────────────────────

function StrengthBar({ password }) {
  if (!password) return null;
  const score = scorePassword(password);
  const meta  = strengthMeta[score];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? meta.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${
        score <= 1 ? "text-red-500" :
        score === 2 ? "text-amber-500" :
        score === 3 ? "text-lime-600" : "text-green-600"
      }`}>
        Password strength: {meta.label}
      </p>
    </div>
  );
}

// ─── Password Rules Checklist ─────────────────────────────────────────────────

function PasswordRules({ password }) {
  if (!password) return null;
  const rules = [
    { label: "At least 8 characters",          met: password.length >= 8               },
    { label: "Uppercase and lowercase letters", met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "At least one number",             met: /[0-9]/.test(password)             },
    { label: "At least one special character",  met: /[^A-Za-z0-9]/.test(password)      },
  ];
  return (
    <ul className="mt-2 space-y-1">
      {rules.map(({ label, met }) => (
        <li key={label} className={`flex items-center gap-1.5 text-[11px] transition-colors ${met ? "text-green-600" : "text-gray-400"}`}>
          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${met ? "bg-green-100" : "bg-gray-100"}`}>
            {met && <IconCheck />}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Signup() {
  const { register } = useContext(AuthContext);
  const navigate     = useNavigate();

  const [fields,  setFields]  = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [agreedErr, setAgreedErr] = useState(false);

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key])  setErrors((err) => ({ ...err, [key]: undefined }));
    if (apiError)     setApiError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validateFields(fields);
    if (!agreed) setAgreedErr(true);
    if (Object.keys(errs).length > 0 || !agreed) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = register({
        email:    fields.email,
        password: fields.password,
        name:     fields.name.trim(),
        role:     "customer",
      });
      if (!res.ok) {
        setApiError(res.error || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }
      navigate("/shop");
    } catch {
      setApiError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputCls = (key) =>
    `w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm outline-none transition-colors duration-150 bg-white text-gray-900 placeholder:text-gray-400 ${
      errors[key]
        ? "border-red-400 focus:border-red-500 bg-red-50/20"
        : "border-gray-200 focus:border-green-500 hover:border-gray-300"
    }`;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-baseline gap-0">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Mensur</span>
            <span className="text-2xl font-bold text-green-600 tracking-tight">Enterprises</span>
          </a>
          <p className="text-sm text-gray-500 mt-1">Create your account to start shopping</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 md:px-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Create account</h1>

          {/* API error banner */}
          {apiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <IconAlert />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">

            {/* Full name */}
            <Field label="Full name" id="name" error={errors.name} icon={IconUser}>
              <input
                id="name"
                type="text"
                value={fields.name}
                onChange={set("name")}
                placeholder="Enter your name"
                disabled={loading}
                autoComplete="name"
                className={inputCls("name")}
              />
            </Field>

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
            <div>
              <PasswordField
                id="password"
                label="Password"
                value={fields.password}
                onChange={set("password")}
                error={errors.password}
                placeholder="Create a strong password"
                disabled={loading}
              />
              <StrengthBar password={fields.password} />
              <PasswordRules password={fields.password} />
            </div>

            {/* Confirm password */}
            <PasswordField
              id="confirm"
              label="Confirm password"
              value={fields.confirm}
              onChange={set("confirm")}
              error={errors.confirm}
              placeholder="Re-enter your password"
              disabled={loading}
            />

            {/* Terms */}
            <div>
              <label className={`flex items-start gap-3 cursor-pointer group`}>
                <div
                  onClick={() => { setAgreed((v) => !v); setAgreedErr(false); }}
                  className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    agreed
                      ? "bg-green-600 border-green-600"
                      : agreedErr
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {agreed && <IconCheck />}
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium underline-offset-2 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-green-600 hover:text-green-700 font-medium underline-offset-2 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {agreedErr && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5 ml-7">
                  <IconAlert /> You must accept the terms to continue.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold transition-colors duration-150 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Creating your account…
                </>
              ) : "Create account"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google stub — shows intent without broken redirect */}
            <button
              type="button"
              onClick={() => alert("Google sign-in requires OAuth setup. Contact the developer to enable this feature.")}
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

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}