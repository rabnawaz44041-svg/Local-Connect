import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import ServiceCard from "../components/ServiceCard";
import { useAuth } from "../context/AuthContext";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    api
      .get("/services")
      .then(({ data }) => {
        if (!ignore) {
          setServices((data.data || []).filter((service) => service.provider?.id === user.id));
        }
      })
      .catch((requestError) => {
        if (!ignore) setError(getErrorMessage(requestError, "Could not load your services."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [user.id]);

  return (
    <div className="bg-[#f7f8f9]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {user?.role === "PROVIDER" && user.isVerified === false ? (
          <p className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Your profile is under review by our team.
          </p>
        ) : null}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-blue">Pro</p>
            <h1 className="mt-2 text-4xl font-extrabold">Your services</h1>
            <p className="mt-2 text-muted">Listings you publish appear in search for customers nearby.</p>
          </div>
          <Link to="/provider/services/new" className="inline-flex rounded-full bg-coral px-5 py-3 text-sm font-bold text-white">
            Publish a service
          </Link>
        </div>
        {loading ? <p className="mt-8 text-muted">Loading your services...</p> : null}
        {error ? <p className="mt-8 text-sm text-red-600">{error}</p> : null}
        {!loading && !error && services.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line bg-white p-6 text-muted">
            You have not published an active service yet.
          </p>
        ) : null}
        <div className="mt-6 space-y-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}
