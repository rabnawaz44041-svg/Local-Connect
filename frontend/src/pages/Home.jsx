import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import Icon from "../components/Icons";
import { categories, heroImage, projects } from "../data/catalog";
import { useAuth } from "../context/AuthContext";
import { formatDistance, formatPrice } from "../utils/format";
import { detectRegion } from "../utils/location";

const radii = [10, 25, 50, 100];

export default function Home() {
  const { user } = useAuth();
  const [problem, setProblem] = useState("");
  const [radiusKm, setRadiusKm] = useState(25);
  const [region, setRegion] = useState(null);
  const [regionError, setRegionError] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.latitude != null && user?.longitude != null) {
      setRegion({
        location: user.location,
        city: user.city,
        country: user.country,
        countryCode: user.countryCode,
        latitude: user.latitude,
        longitude: user.longitude,
      });
      return;
    }

    let ignore = false;
    detectRegion()
      .then((value) => {
        if (!ignore) setRegion(value);
      })
      .catch((failure) => {
        if (!ignore) setRegionError(failure.message || "Location is unavailable.");
      });
    return () => {
      ignore = true;
    };
  }, [user]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!region) {
      setError(regionError || "Location is required before matching.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/discover", {
        problem,
        radiusKm,
        latitude: region.latitude,
        longitude: region.longitude,
      });
      setResult(data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not analyze that problem."));
    } finally {
      setLoading(false);
    }
  };

  const countryCode = region?.countryCode;

  return (
    <div className="bg-white">
      <section className="relative min-h-[640px] overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />
        <div className="relative mx-auto flex min-h-[640px] max-w-6xl flex-col justify-center px-4 py-16 text-white">
          <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            For every job near you.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-white/90">
            Describe the problem. A local model finds the service, then you hire someone nearby. Payment stays locked until the work is done.
          </p>
          <form onSubmit={onSubmit} className="mt-8 max-w-2xl rounded-2xl bg-white p-2 text-ink shadow-2xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="flex flex-1 items-center gap-2 px-3">
                <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
                <input
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  required
                  minLength={8}
                  placeholder="Describe your project or problem"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted"
                />
              </label>
              <label className="flex items-center gap-2 px-3 md:w-44">
                <Icon name="pin" className="h-5 w-5 shrink-0 text-muted" />
                <span className="truncate py-3 text-sm">{region ? region.city || region.location : "Locating"}</span>
              </label>
              <label className="px-3 text-sm font-semibold md:w-28">
                <select
                  value={radiusKm}
                  onChange={(event) => setRadiusKm(Number(event.target.value))}
                  className="w-full bg-transparent py-3 outline-none"
                  aria-label="Radius"
                >
                  {radii.map((value) => (
                    <option key={value} value={value}>
                      {value} km
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-leaf px-6 py-3 text-sm font-bold text-white hover:bg-leaf-dark disabled:opacity-60"
              >
                {loading ? "Finding..." : "Find a pro"}
              </button>
            </div>
          </form>
          <p className="mt-4 flex items-center gap-2 text-sm text-white/85">
            <Icon name="lock" className="h-4 w-4" />
            Payment stays with LocalConnect until you confirm the job is finished.
          </p>
          {error || regionError ? <p className="mt-3 max-w-xl text-sm font-semibold text-white">{error || regionError}</p> : null}
          {result ? (
            <div className="mt-4 max-w-2xl rounded-2xl bg-white p-4 text-ink shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">The model understood</p>
              <h2 className="mt-1 text-2xl font-extrabold">{result.analysis.requiredService}</h2>
              <p className="mt-1 text-sm text-muted">
                {result.analysis.category} · {result.analysis.urgency} urgency · within {result.radiusKm} km
              </p>
              {result.results.length === 0 ? (
                <p className="mt-3 text-sm font-semibold text-coral">No providers in this radius offer that service yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {result.results.map((service) => (
                    <Link key={service.id} to={`/services/${service.id}`} className="block rounded-xl border border-line p-3 hover:border-leaf">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-coral">Match #{service.rank}</p>
                          <p className="font-extrabold">{service.title}</p>
                          <p className="text-sm text-muted">{service.provider?.name} · {formatDistance(service.distanceKm, countryCode)}</p>
                        </div>
                        <p className="font-extrabold text-leaf">{formatPrice(service.price, service.currency)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-4xl font-extrabold tracking-tight">
          Pros for every project in <span className="text-leaf">your area.</span>
        </h2>
        <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setProblem(`I need help with ${item.label.toLowerCase()}`)}
              className="flex w-24 shrink-0 flex-col items-center gap-2 text-center text-sm font-semibold hover:text-leaf"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-sky text-leaf">
                <Icon name={item.icon} />
              </span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <button
              key={project.title}
              type="button"
              onClick={() => setProblem(`I need ${project.title.toLowerCase()}`)}
              className="group relative h-52 overflow-hidden rounded-2xl text-left"
            >
              <img src={project.image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute inset-x-3 bottom-3 rounded-xl bg-black/55 px-3 py-2 text-sm font-semibold text-white">
                {project.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-sky/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          {[
            ["Get to a hire faster.", "Describe the job in your own words. The model names the service."],
            ["Only see local pros.", "Results stay inside the radius around your detected city."],
            ["Pay when it is done.", "The provider accepts, you lock the price, and it is released after completion."],
          ].map(([title, copy]) => (
            <article key={title}>
              <h3 className="text-2xl font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
