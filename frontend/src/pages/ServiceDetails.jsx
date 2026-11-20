import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { imageForCategory } from "../data/catalog";
import { formatPrice } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function ServiceDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [service, setService] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    api
      .get(`/services/${id}`)
      .then(({ data }) => {
        if (!ignore) setService(data.data);
      })
      .catch((requestError) => {
        if (!ignore) {
          setService(null);
          setError(getErrorMessage(requestError, "Could not load this pro."));
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <p className="mx-auto max-w-6xl px-4 py-10 text-muted">Loading pro...</p>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">This service is not available</h1>
        <p className="mt-3 text-muted">{error}</p>
        <Link to="/services" className="mt-6 inline-flex font-semibold text-blue">
          Back to pros
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <img src={imageForCategory(service.category)} alt="" className="h-72 w-full object-cover" />
          <div className="p-6 sm:p-8">
            <Link to="/services" className="text-sm font-semibold text-blue">
              All pros
            </Link>
            <p className="mt-4 text-sm font-semibold text-blue">{service.category}</p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight">{service.title}</h1>
            <p className="mt-2 text-sm text-muted">
              {service.provider?.name} · {service.location}
            </p>
            <p className="mt-6 whitespace-pre-wrap leading-7 text-ink">{service.description}</p>
          </div>
        </article>

        <aside className="h-fit rounded-[1.75rem] bg-navy p-6 text-white shadow-sm">
          <p className="text-sm text-white/70">Starting price</p>
          <p className="mt-1 text-4xl font-extrabold text-white">{formatPrice(service.price, service.currency)}</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-white/60">Location</dt>
              <dd className="font-semibold">{service.location}</dd>
            </div>
            <div>
              <dt className="text-white/60">Pro</dt>
              <dd className="font-semibold">{service.provider?.name}</dd>
            </div>
            {service.provider?.phone ? (
              <div>
                <dt className="text-white/60">Phone</dt>
                <dd className="font-semibold">{service.provider.phone}</dd>
              </div>
            ) : null}
          </dl>
          {user?.role === "CUSTOMER" ? (
            <form
              className="mt-6"
              onSubmit={async (event) => {
                event.preventDefault();
                setSending(true);
                setFormError("");
                try {
                  const { data } = await api.post("/requests", { serviceId: service.id, note });
                  navigate(`/requests/${data.data.id}`);
                } catch (requestError) {
                  setFormError(getErrorMessage(requestError, "Could not send the request."));
                } finally {
                  setSending(false);
                }
              }}
            >
              <label className="block text-sm font-semibold">
                What should they do?
                <textarea value={note} onChange={(event) => setNote(event.target.value)} required minLength={8} rows={3} className="mt-2 w-full rounded-2xl border-0 px-3 py-2 text-ink" placeholder="The tap under the kitchen sink will not stop dripping." />
              </label>
              {formError ? <p className="mt-2 text-sm text-coral">{formError}</p> : null}
              <button type="submit" disabled={sending} className="mt-3 w-full rounded-full bg-coral px-4 py-3 text-sm font-bold text-white">
                {sending ? "Sending..." : "Request this provider"}
              </button>
            </form>
          ) : user ? (
            <p className="mt-6 text-sm text-white/80">Customers request this service from their own account.</p>
          ) : (
            <Link
              to="/login"
              className="mt-6 block rounded-full bg-coral px-4 py-3 text-center text-sm font-bold text-white"
            >
              Log in to contact this pro
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
