import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";

export default function AdminReviews() {
  const [filters, setFilters] = useState({ maxRating: "", providerId: "", from: "", to: "" });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const load = async (next = filters) => {
    const params = {};
    if (next.maxRating) params.maxRating = next.maxRating;
    if (next.providerId) params.providerId = next.providerId;
    if (next.from) params.from = next.from;
    if (next.to) params.to = next.to;
    const { data } = await api.get("/admin/reviews", { params });
    setRows(data.data || []);
  };

  useEffect(() => {
    load().catch((requestError) => setError(getErrorMessage(requestError, "Could not load reviews.")));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Reviews</h1>
      <form className="mt-4 grid gap-2 sm:grid-cols-4" onSubmit={(event) => { event.preventDefault(); load().catch((requestError) => setError(getErrorMessage(requestError))); }}>
        <label className="text-sm">Max rating
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={filters.maxRating} onChange={(event) => setFilters({ ...filters, maxRating: event.target.value })} placeholder="2" />
        </label>
        <label className="text-sm">Provider id
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={filters.providerId} onChange={(event) => setFilters({ ...filters, providerId: event.target.value })} />
        </label>
        <label className="text-sm">From
          <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        </label>
        <label className="text-sm">To
          <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
        </label>
        <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white sm:col-span-4" type="submit">Filter</button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 overflow-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>{["Reviewer", "Provider", "Rating", "Text", "Date", "Actions"].map((heading) => <th key={heading} className="px-3 py-2 font-medium">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td className="px-3 py-4 text-gray-500" colSpan={6}>No reviews yet. Reviews appear after a completed job.</td></tr> : rows.map((review) => (
              <tr key={review.id} className="border-t">
                <td className="px-3 py-2">{review.customer?.name}</td>
                <td className="px-3 py-2">{review.provider?.businessName || review.provider?.name}</td>
                <td className="px-3 py-2">{review.rating}</td>
                <td className="px-3 py-2">{review.hidden ? "(hidden) " : ""}{review.body}</td>
                <td className="px-3 py-2">{new Date(review.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <button type="button" className="mr-3 font-semibold text-indigo-600" onClick={async () => { await api.patch(`/admin/reviews/${review.id}/hide`, { hidden: !review.hidden }); await load(); }}>Hide</button>
                  <button type="button" className="font-semibold text-red-600" onClick={async () => { await api.delete(`/admin/reviews/${review.id}`); await load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
