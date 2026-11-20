import { Link } from "react-router-dom";

export const fieldClass =
  "mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-600";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-indigo-600">LocalConnect</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function FieldError({ children }) {
  return children ? <p className="mt-1 text-sm text-red-600">{children}</p> : null;
}

export function RoleSwitch({ provider }) {
  return provider ? (
    <p className="mt-4 text-sm text-gray-600">
      Looking for help? <Link className="font-semibold text-indigo-600" to="/signup">Sign up as a customer</Link>
    </p>
  ) : (
    <p className="mt-4 text-sm text-gray-600">
      Are you a provider? <Link className="font-semibold text-indigo-600" to="/signup/provider">Register as Pro</Link>
    </p>
  );
}

export function PrimaryButton({ children, disabled, loading }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
      {children}
    </button>
  );
}
