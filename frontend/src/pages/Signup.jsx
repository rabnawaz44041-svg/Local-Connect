import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { AuthShell, FieldError, PrimaryButton, RoleSwitch, fieldClass } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { COUNTRIES, passwordStrength } from "../data/authOptions";
import { detectRegion } from "../utils/location";
import { homePathForRole } from "../utils/format";

export default function Signup() {
  const { user, signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    countryCode: "",
    city: "",
    latitude: "",
    longitude: "",
    acceptedTerms: false,
  });
  const [manual, setManual] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    detectRegion()
      .then((region) => {
        setForm((current) => ({
          ...current,
          country: region.country,
          countryCode: region.countryCode,
          city: region.city,
          latitude: region.latitude,
          longitude: region.longitude,
        }));
      })
      .catch(() => setManual(true));
  }, []);

  if (user) return <Navigate to={homePathForRole(user.role)} replace />;

  const strength = passwordStrength(form.password);

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email.";
    if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.acceptedTerms) nextErrors.acceptedTerms = "Accept the terms to continue.";
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const nextUser = await signup({ ...form, acceptedTerms: true });
      navigate(homePathForRole(nextUser.role));
    } catch (error) {
      const message = getErrorMessage(error, "Could not create the account.");
      setFormError(message);
      showToast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Tell us where you are so matches stay local.">
      <form onSubmit={onSubmit}>
        <label className="block text-sm font-medium">Full name
          <input className={fieldClass} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <FieldError>{errors.fullName}</FieldError>
        </label>
        <label className="mt-4 block text-sm font-medium">Email
          <input type="email" className={fieldClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <FieldError>{errors.email}</FieldError>
        </label>
        <label className="mt-4 block text-sm font-medium">Password
          <input type="password" className={fieldClass} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <div className="mt-2 h-1.5 rounded bg-gray-200">
            <div className="h-1.5 rounded bg-indigo-600" style={{ width: `${strength * 25}%` }} />
          </div>
          <FieldError>{errors.password}</FieldError>
        </label>
        <label className="mt-4 block text-sm font-medium">Confirm password
          <input type="password" className={fieldClass} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
          <FieldError>{errors.confirmPassword}</FieldError>
        </label>
        <label className="mt-4 block text-sm font-medium">Country
          <select
            className={fieldClass}
            value={form.countryCode}
            onChange={(event) => {
              const country = COUNTRIES.find((item) => item[0] === event.target.value);
              setForm({ ...form, countryCode: event.target.value, country: country ? country[1] : "" });
              setManual(true);
            }}
          >
            <option value="">{form.country || "Select a country"}</option>
            {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-sm font-medium">City / region
          <input className={fieldClass} list="cities" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
          <datalist id="cities">
            <option value="Lahore" />
            <option value="Karachi" />
            <option value="Seoul" />
            <option value="Pune" />
            <option value="London" />
          </datalist>
          <FieldError>{errors.city}</FieldError>
          {manual ? <p className="mt-1 text-xs text-gray-500">Location access was skipped. Enter your city manually.</p> : null}
        </label>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={form.acceptedTerms} onChange={(event) => setForm({ ...form, acceptedTerms: event.target.checked })} />
          <span>I agree to the <Link className="text-indigo-600" to="/info/terms">terms</Link>.</span>
        </label>
        <FieldError>{errors.acceptedTerms}</FieldError>
        <FieldError>{formError}</FieldError>
        <PrimaryButton loading={loading}>{loading ? "Creating account…" : "Create account"}</PrimaryButton>
        <RoleSwitch />
      </form>
    </AuthShell>
  );
}
