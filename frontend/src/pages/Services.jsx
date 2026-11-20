import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import SearchForm from "../components/SearchForm";
import ServiceCard from "../components/ServiceCard";

export default function Services() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const location = params.get("location") || "";
  const category = params.get("category") || "";
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    api
      .get("/services", { params: { q, location, category } })
      .then(({ data }) => {
        if (!ignore) setServices(data.data || []);
      })
      .catch((requestError) => {
        if (!ignore) setError(getErrorMessage(requestError, "Could not load pros."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [q, location, category]);

  const title = category || q || "Local pros";
  const place = location ? ` near ${location}` : "";

  return (
    <div className="bg-white">
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <SearchForm key={`${q}-${location}`} initialQuery={q || category} initialLocation={location} variant="bar" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {title}
          {place}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {loading
            ? "Looking for matching pros..."
            : error
              ? "Search could not reach the server."
              : `${services.length} active ${services.length === 1 ? "service" : "services"}`}
        </p>
        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
        {!loading && !error && services.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line bg-white p-6 text-muted">
            No pros match that search yet. Try another project or city.
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
