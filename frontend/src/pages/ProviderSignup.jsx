import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { AuthShell, FieldError, PrimaryButton, RoleSwitch, fieldClass } from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { COUNTRIES, CURRENCY_BY_COUNTRY, PROVIDER_CATEGORIES, passwordStrength } from "../data/authOptions";
import { homePathForRole } from "../utils/format";
import { detectRegion } from "../utils/location";

const empty = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  country: "",
  countryCode: "",
  city: "",
  latitude: "",
  longitude: "",
  categories: [],
  services: [],
  serviceDraft: "",
  hourlyRate: "",
  currency: "USD",
  bio: "",
  profilePhoto: "",
};

export default function ProviderSignup() {
  const { user, signupProvider } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
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
          currency: CURRENCY_BY_COUNTRY[region.countryCode] || "USD",
        }));
      })
      .catch(() => {});
  }, []);

  if (user) return <Navigate to={homePathForRole(user.role)} replace />;

  const stepOneValid =
    form.fullName.trim() &&
    form.email.includes("@") &&
    form.phone.trim() &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword;

  const stepTwoValid =
    form.city.trim() &&
    form.country &&
    form.categories.length > 0 &&
    form.services.length > 0 &&
    Number(form.hourlyRate) > 0 &&
    form.bio.trim().length >= 200 &&
    form.bio.trim().length <= 500;

  const nextStep = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email.";
    if (!form.phone.trim()) nextErrors.phone = "Phone is required.";
    if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) setStep(2);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.categories.length) nextErrors.categories = "Choose at least one category.";
    if (!form.services.length) nextErrors.services = "Add at least one service.";
    if (!(Number(form.hourlyRate) > 0)) nextErrors.hourlyRate = "Enter an hourly rate.";
    if (form.bio.trim().length < 200 || form.bio.trim().length > 500) nextErrors.bio = "Bio must be 200 to 500 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await signupProvider(form);
      navigate("/provider/dashboard");
    } catch (error) {
      showToast(getErrorMessage(error, "Could not create the provider account."));
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.password);

  return (
    <AuthShell title="Register as a pro" subtitle={`Step ${step} of 2`}>
      <div className="mb-4 h-1.5 rounded bg-gray-200">
        <div className="h-1.5 rounded bg-indigo-600" style={{ width: step === 1 ? "50%" : "100%" }} />
      </div>
      {step === 1 ? (
        <form onSubmit={nextStep}>
          <label className="block text-sm font-medium">Full name
            <input className={fieldClass} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            <FieldError>{errors.fullName}</FieldError>
          </label>
          <label className="mt-4 block text-sm font-medium">Business name
            <input className={fieldClass} value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-medium">Email
            <input type="email" className={fieldClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <FieldError>{errors.email}</FieldError>
          </label>
          <label className="mt-4 block text-sm font-medium">Phone
            <input className={fieldClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <FieldError>{errors.phone}</FieldError>
          </label>
          <label className="mt-4 block text-sm font-medium">Password
            <input type="password" className={fieldClass} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <div className="mt-2 h-1.5 rounded bg-gray-200"><div className="h-1.5 rounded bg-indigo-600" style={{ width: `${strength * 25}%` }} /></div>
            <FieldError>{errors.password}</FieldError>
          </label>
          <label className="mt-4 block text-sm font-medium">Confirm password
            <input type="password" className={fieldClass} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
            <FieldError>{errors.confirmPassword}</FieldError>
          </label>
          <PrimaryButton>Continue</PrimaryButton>
          <RoleSwitch provider />
        </form>
      ) : (
        <form onSubmit={onSubmit}>
          <label className="block text-sm font-medium">Country
            <select className={fieldClass} value={form.countryCode} onChange={(event) => {
              const country = COUNTRIES.find((item) => item[0] === event.target.value);
              setForm({
                ...form,
                countryCode: event.target.value,
                country: country ? country[1] : form.country,
                currency: CURRENCY_BY_COUNTRY[event.target.value] || "USD",
              });
            }}>
              <option value="">{form.country || "Select a country"}</option>
              {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-sm font-medium">City / region
            <input className={fieldClass} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            <FieldError>{errors.city}</FieldError>
          </label>
          <fieldset className="mt-4">
            <legend className="text-sm font-medium">Categories</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {PROVIDER_CATEGORIES.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(value)}
                    onChange={(event) => {
                      const categories = event.target.checked
                        ? [...form.categories, value]
                        : form.categories.filter((item) => item !== value);
                      setForm({ ...form, categories });
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <FieldError>{errors.categories}</FieldError>
          </fieldset>
          <label className="mt-4 block text-sm font-medium">Services offered
            <input
              className={fieldClass}
              value={form.serviceDraft}
              placeholder="Type a service and press Enter"
              onChange={(event) => setForm({ ...form, serviceDraft: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  const tag = form.serviceDraft.trim();
                  if (tag) setForm({ ...form, services: [...form.services, tag], serviceDraft: "" });
                }
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {form.services.map((service) => (
                <button type="button" key={service} className="rounded-full bg-gray-100 px-3 py-1 text-xs" onClick={() => setForm({ ...form, services: form.services.filter((item) => item !== service) })}>
                  {service} ×
                </button>
              ))}
            </div>
            <FieldError>{errors.services}</FieldError>
          </label>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">Hourly rate
              <input className={fieldClass} value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: event.target.value })} />
              <FieldError>{errors.hourlyRate}</FieldError>
            </label>
            <label className="text-sm font-medium">Currency
              <input className={fieldClass} value={form.currency} readOnly />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium">Bio ({form.bio.trim().length}/500)
            <textarea rows={5} className={fieldClass} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
            <FieldError>{errors.bio}</FieldError>
          </label>
          <label className="mt-4 block text-sm font-medium">Profile photo
            <input type="file" accept="image/*" className="mt-1 block text-sm" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 400000) {
                showToast("Choose a photo under 400 KB.");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setForm((current) => ({ ...current, profilePhoto: String(reader.result) }));
              reader.readAsDataURL(file);
            }} />
          </label>
          <div className="mt-4 flex gap-3">
            <button type="button" className="rounded-xl border border-gray-300 px-4 py-3 text-sm" onClick={() => setStep(1)}>Back</button>
            <div className="flex-1"><PrimaryButton loading={loading}>{loading ? "Creating account…" : "Submit profile"}</PrimaryButton></div>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
