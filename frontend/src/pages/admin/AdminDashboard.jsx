import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data.data)).catch((requestError) => {
      setError(getErrorMessage(requestError, "Could not load the dashboard."));
    });
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="text-sm text-gray-500">Loading dashboard…</p>;

  const roleCount = (role) => stats.users.find((item) => item.role === role)?._count._all || 0;
  const cards = [
    ["Total users", `${roleCount("CUSTOMER") + roleCount("PROVIDER") + roleCount("ADMIN")} (${roleCount("CUSTOMER")} customers, ${roleCount("PROVIDER")} pros)`],
    ["Active providers", stats.activeProviders],
    ["Pending verifications", stats.pendingVerifications],
    ["Reviews", `${stats.reviewCount} · avg ${stats.averageRating ? stats.averageRating.toFixed(1) : "—"}`],
    ["LLM queries today", stats.llmQueriesToday],
    ["Countries active", stats.countriesActive],
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={label} className={`rounded-2xl bg-white p-4 shadow-sm ${label === "Pending verifications" && stats.pendingVerifications > 0 ? "ring-2 ring-red-500" : ""}`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Latest signups</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {stats.latestUsers.map((person) => (
              <li key={person.id}>{person.name} · {person.role} · {person.city || "—"}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Latest reviews</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {stats.latestReviews.length === 0 ? <li>No reviews yet.</li> : stats.latestReviews.map((review) => (
              <li key={review.id}>{review.customer?.name} rated {review.provider?.businessName || review.provider?.name} {review.rating}/5</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
