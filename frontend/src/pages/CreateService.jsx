import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { categories } from "../data/catalog";

const initialForm = {
  title: "",
  description: "",
  category: "Cleaning",
  price: "",
  location: "",
};

export default function CreateService() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/services", {
        ...form,
        price: Number(form.price),
      });
      navigate(`/services/${data.data.id}`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not publish the service."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f8f9] px-4 py-12">
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold">Publish a service</h1>
        <p className="mt-2 text-sm text-muted">Customers will find this when they search by project or city.</p>
        <label className="mt-6 block text-sm font-semibold">
          Title
          <input name="title" required value={form.title} onChange={onChange} className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-blue" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Description
          <textarea name="description" required rows={4} value={form.description} onChange={onChange} className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-blue" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Category
          <select name="category" value={form.category} onChange={onChange} className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-blue">
            {categories.map((item) => (
              <option key={item.category} value={item.category}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Starting price (PKR)
            <input name="price" inputMode="numeric" required value={form.price} onChange={onChange} className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-blue" />
          </label>
          <label className="block text-sm font-semibold">
            City
            <input name="location" required value={form.location} onChange={onChange} className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-blue" />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={loading} className="mt-6 rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white hover:bg-leaf-dark disabled:opacity-60">
          {loading ? "Publishing..." : "Publish service"}
        </button>
      </form>
    </div>
  );
}
