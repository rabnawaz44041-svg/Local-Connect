import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "CUSTOMER",
  phone: "",
  location: "",
  city: "",
  country: "",
  countryCode: "",
};

const emptyService = {
  title: "",
  description: "",
  category: "Cleaning",
  price: "",
  currency: "USD",
  location: "",
  providerId: "",
  isActive: true,
};

export default function AdminConsole() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("people");
  const [people, setPeople] = useState([]);
  const [services, setServices] = useState([]);
  const [userForm, setUserForm] = useState(emptyUser);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [editingUser, setEditingUser] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState("");

  const load = async () => {
    const [usersResponse, servicesResponse] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/services"),
    ]);
    setPeople(usersResponse.data.data || []);
    setServices(servicesResponse.data.data || []);
  };

  useEffect(() => {
    load().catch((requestError) => setError(getErrorMessage(requestError, "Could not load the console.")));
  }, []);

  const saveUser = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser}`, userForm);
        setMessage("Account updated.");
      } else {
        await api.post("/admin/users", userForm);
        setMessage("Account created.");
      }
      setUserForm(emptyUser);
      setEditingUser(null);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not save the account."));
    }
  };

  const saveService = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = { ...serviceForm, price: Number(serviceForm.price), providerId: Number(serviceForm.providerId) };
      if (editingService) {
        await api.patch(`/admin/services/${editingService}`, payload);
        setMessage("Service updated.");
      } else {
        await api.post("/admin/services", payload);
        setMessage("Service created.");
      }
      setServiceForm(emptyService);
      setEditingService(null);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not save the service."));
    }
  };

  const remove = async (path) => {
    setError("");
    setPendingDelete("");
    try {
      await api.delete(path);
      setMessage("Deleted.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not delete that record."));
    }
  };

  const providers = people.filter((person) => person.role === "PROVIDER");

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-ink">
      <header className="flex items-center justify-between border-b border-line bg-navy px-6 py-4 text-white">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Webmaster</p>
          <h1 className="text-2xl font-extrabold">LocalConnect console</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span>{user?.name}</span>
          <Link to="/" className="hover:text-white/80">View site</Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-2">
          {["people", "services"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${tab === item ? "bg-leaf text-white" : "bg-white"}`}
            >
              {item === "people" ? "Customers and providers" : "Services"}
            </button>
          ))}
        </div>
        {message ? <p className="mt-4 text-sm font-semibold text-leaf">{message}</p> : null}
        {error ? <p className="mt-4 text-sm font-semibold text-coral">{error}</p> : null}

        {tab === "people" ? (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={saveUser} className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-extrabold">{editingUser ? "Edit account" : "Add account"}</h2>
              {["name", "email", "password", "phone", "city", "country", "countryCode", "location"].map((field) => (
                <label key={field} className="mt-3 block text-sm font-semibold capitalize">
                  {field === "password" && editingUser ? "New password (optional)" : field}
                  <input
                    type={field === "password" ? "password" : "text"}
                    value={userForm[field]}
                    onChange={(event) => setUserForm((current) => ({ ...current, [field]: event.target.value }))}
                    required={field === "name" || field === "email" || (field === "password" && !editingUser)}
                    className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-normal"
                  />
                </label>
              ))}
              <label className="mt-3 block text-sm font-semibold">
                Role
                <select
                  value={userForm.role}
                  onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="PROVIDER">Provider</option>
                </select>
              </label>
              <div className="mt-4 flex gap-2">
                <button type="submit" className="rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white">Save</button>
                {editingUser ? (
                  <button type="button" onClick={() => { setEditingUser(null); setUserForm(emptyUser); }} className="rounded-full border border-line px-4 py-2 text-sm font-bold">
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
            <div className="space-y-3">
              {people.map((person) => (
                <article key={person.id} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">{person.name}</p>
                      <p className="text-sm text-muted">{person.email} · {person.role}</p>
                      <p className="text-sm text-muted">{person.location || person.city || "No location"}</p>
                    </div>
                    <div className="flex gap-2 text-sm font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(person.id);
                          setUserForm({ ...emptyUser, ...person, password: "" });
                        }}
                      >
                        Edit
                      </button>
                      {pendingDelete === `/admin/users/${person.id}` ? (
                        <button type="button" className="text-coral" onClick={() => remove(`/admin/users/${person.id}`)}>
                          Confirm delete
                        </button>
                      ) : (
                        <button type="button" className="text-coral" onClick={() => setPendingDelete(`/admin/users/${person.id}`)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={saveService} className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-extrabold">{editingService ? "Edit service" : "Add service"}</h2>
              {["title", "category", "price", "currency", "location"].map((field) => (
                <label key={field} className="mt-3 block text-sm font-semibold capitalize">
                  {field}
                  <input
                    value={serviceForm[field]}
                    onChange={(event) => setServiceForm((current) => ({ ...current, [field]: event.target.value }))}
                    required
                    className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-normal"
                  />
                </label>
              ))}
              <label className="mt-3 block text-sm font-semibold">
                Description
                <textarea
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-normal"
                />
              </label>
              <label className="mt-3 block text-sm font-semibold">
                Provider
                <select
                  value={serviceForm.providerId}
                  onChange={(event) => setServiceForm((current) => ({ ...current, providerId: event.target.value }))}
                  required
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2"
                >
                  <option value="">Select a provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </label>
              <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={serviceForm.isActive}
                  onChange={(event) => setServiceForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                Active listing
              </label>
              <div className="mt-4 flex gap-2">
                <button type="submit" className="rounded-full bg-leaf px-4 py-2 text-sm font-bold text-white">Save</button>
                {editingService ? (
                  <button type="button" onClick={() => { setEditingService(null); setServiceForm(emptyService); }} className="rounded-full border border-line px-4 py-2 text-sm font-bold">
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
            <div className="space-y-3">
              {services.map((service) => (
                <article key={service.id} className="rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">{service.title}</p>
                      <p className="text-sm text-muted">{service.provider?.name} · {service.category} · {service.isActive ? "Active" : "Hidden"}</p>
                      <p className="text-sm text-muted">{service.price} {service.currency} · {service.location}</p>
                    </div>
                    <div className="flex gap-2 text-sm font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(service.id);
                          setServiceForm({
                            title: service.title,
                            description: service.description,
                            category: service.category,
                            price: String(service.price),
                            currency: service.currency,
                            location: service.location,
                            providerId: String(service.providerId),
                            isActive: service.isActive,
                          });
                        }}
                      >
                        Edit
                      </button>
                      {pendingDelete === `/admin/services/${service.id}` ? (
                        <button type="button" className="text-coral" onClick={() => remove(`/admin/services/${service.id}`)}>
                          Confirm delete
                        </button>
                      ) : (
                        <button type="button" className="text-coral" onClick={() => setPendingDelete(`/admin/services/${service.id}`)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
