import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../utils/format";
import { detectRegion } from "../utils/location";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: params.get("role") === "PROVIDER" ? "PROVIDER" : "CUSTOMER",
    phone: "",
  });
  const [region, setRegion] = useState(null);
  const [regionError, setRegionError] = useState("");
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    detectRegion()
      .then((value) => {
        if (!ignore) setRegion(value);
      })
      .catch((regionFailure) => {
        if (!ignore) setRegionError(regionFailure.message || "Could not detect your region.");
      })
      .finally(() => {
        if (!ignore) setLocating(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (user) return <Navigate to={homePathForRole(user.role)} replace />;

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!region) {
      setError(regionError || "Wait until your region is detected.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const nextUser = await register({
        ...form,
        phone: form.phone || undefined,
        ...region,
      });
      navigate(homePathForRole(nextUser.role));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not create the account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white px-4 py-16">
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-lg">
        <h1 className="text-3xl font-extrabold">Sign up</h1>
        <p className="mt-2 text-sm text-muted">Join as a customer, or become a pro and publish services.</p>
        <label className="mt-6 block text-sm font-semibold">
          Full name
          <input name="name" required value={form.name} onChange={onChange} className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-leaf" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Email
          <input name="email" type="email" required value={form.email} onChange={onChange} className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-leaf" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Password
          <input name="password" type="password" minLength={6} required value={form.password} onChange={onChange} className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-leaf" />
        </label>
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">I am joining as</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              ["CUSTOMER", "Customer"],
              ["PROVIDER", "Pro"],
            ].map(([value, label]) => (
              <label key={value} className={`rounded-2xl border px-4 py-3 text-sm ${form.role === value ? "border-leaf bg-sky" : "border-line bg-white"}`}>
                <input type="radio" name="role" value={value} checked={form.role === value} onChange={onChange} className="mr-2" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-4 block text-sm font-semibold">
          Phone <span className="font-normal text-muted">(optional)</span>
          <input name="phone" value={form.phone} onChange={onChange} className="mt-1 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-leaf" />
        </label>
        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
          <p className="font-semibold">Your region</p>
          <p className="mt-1 text-muted">
            {locating ? "Detecting where you are..." : region?.location || regionError}
          </p>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={loading || locating || !region} className="lift mt-6 w-full rounded-full bg-coral px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-leaf">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
