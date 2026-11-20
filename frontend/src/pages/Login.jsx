import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { AuthShell, FieldError, PrimaryButton, fieldClass } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { homePathForRole } from "../utils/format";

export default function Login() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "", rememberMe: true });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  if (user) return <Navigate to={homePathForRole(user.role)} replace />;

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const nextUser = await login(form.email, form.password, form.rememberMe);
      navigate(homePathForRole(nextUser.role));
    } catch (error) {
      const message = getErrorMessage(error, "Invalid credentials");
      setFormError(message);
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Use the email and password for your account.">
      {params.get("reset") === "1" ? <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Password updated. Sign in with the new one.</p> : null}
      <form onSubmit={onSubmit}>
        <label className="block text-sm font-medium">Email
          <input type="email" required className={fieldClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="mt-4 block text-sm font-medium">Password
          <span className="relative block">
            <input type={show ? "text" : "password"} required className={fieldClass} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <button type="button" className="absolute top-3 right-3 text-xs text-gray-500" onClick={() => setShow((current) => !current)}>{show ? "Hide" : "Show"}</button>
          </span>
        </label>
        <div className="mt-4 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.rememberMe} onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })} /> Remember me</label>
          <Link className="font-semibold text-indigo-600" to="/forgot-password">Forgot password?</Link>
        </div>
        <FieldError>{formError}</FieldError>
        <PrimaryButton loading={loading}>{loading ? "Signing in…" : "Sign in"}</PrimaryButton>
        <p className="mt-4 text-sm text-gray-600">
          New here? <Link className="font-semibold text-indigo-600" to="/signup">Sign up as Customer</Link>
          {" / "}
          <Link className="font-semibold text-indigo-600" to="/signup/provider">Provider</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot", { email });
      setSent(data.message);
    } catch (error) {
      showToast(getErrorMessage(error, "Could not send the reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Forgot password" subtitle="We will send a reset link if the account exists.">
      <form onSubmit={onSubmit}>
        <label className="block text-sm font-medium">Email
          <input type="email" required className={fieldClass} value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {sent ? <p className="mt-3 text-sm text-gray-700">{sent}</p> : null}
        <PrimaryButton loading={loading}>{loading ? "Sending…" : "Send reset link"}</PrimaryButton>
        <p className="mt-4 text-sm"><Link className="text-indigo-600" to="/login">Back to sign in</Link></p>
      </form>
    </AuthShell>
  );
}

export function ResetPassword() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = params.get("token") || "";

  const onSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset", { token, password, confirmPassword });
      showToast("Password updated.", "success");
      navigate("/login?reset=1");
    } catch (requestError) {
      showToast(getErrorMessage(requestError, "Could not reset the password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={onSubmit}>
        <label className="block text-sm font-medium">New password
          <input type="password" className={fieldClass} value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-medium">Confirm password
          <input type="password" className={fieldClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <FieldError>{error}</FieldError>
        </label>
        <PrimaryButton loading={loading}>{loading ? "Saving…" : "Update password"}</PrimaryButton>
      </form>
    </AuthShell>
  );
}
