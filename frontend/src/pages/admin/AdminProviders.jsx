import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";

export default function AdminProviders() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/admin/providers");
    setRows(data.data.providers || []);
  };

  useEffect(() => {
    load().catch((requestError) => setError(getErrorMessage(requestError, "Could not load providers.")));
  }, []);

  const act = async (id, action) => {
    await api.patch(`/admin/providers/${id}/${action}`, { reason: "" });
    await load();
  };

  const bulk = async (action) => {
    if (!selected.length) return;
    await api.patch("/admin/providers/bulk", { ids: selected, action });
    setSelected([]);
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Providers</h1>
        <div className="flex gap-2">
          <button type="button" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white" onClick={() => bulk("approve")}>Approve selected</button>
          <button type="button" className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600" onClick={() => bulk("reject")}>Reject selected</button>
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 overflow-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>{["", "Business", "Categories", "City", "Rating", "Verification", "Actions"].map((heading) => <th key={heading} className="px-3 py-2 font-medium">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((provider) => (
              <tr key={provider.id} className="border-t">
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selected.includes(provider.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, provider.id] : selected.filter((id) => id !== provider.id))} />
                </td>
                <td className="px-3 py-2">{provider.businessName || provider.name}</td>
                <td className="px-3 py-2">{(provider.categories || []).join(", ") || "—"}</td>
                <td className="px-3 py-2">{provider.city || "—"}</td>
                <td className="px-3 py-2">{provider.rating == null ? "—" : provider.rating.toFixed(1)}</td>
                <td className="px-3 py-2">{provider.isVerified ? "Approved" : "Pending"}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button type="button" className="mr-3 font-semibold text-indigo-600" onClick={() => act(provider.id, "approve")}>Approve</button>
                  <button type="button" className="mr-3 font-semibold text-red-600" onClick={() => act(provider.id, "reject")}>Reject</button>
                  <button type="button" className="font-semibold" onClick={() => setDetail(provider)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail ? (
        <section className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <div className="flex justify-between"><h2 className="text-lg font-semibold">{detail.businessName || detail.name}</h2><button type="button" onClick={() => setDetail(null)}>Close</button></div>
          <p className="mt-2">{detail.bio || "No bio yet."}</p>
          <p className="mt-2">Services: {(detail.offeredServices || []).join(", ") || "—"}</p>
          <p className="mt-2">Rate: {detail.hourlyRate || "—"} {detail.currency || ""}</p>
          {detail.profilePhoto ? <img alt="" src={detail.profilePhoto} className="mt-3 h-24 w-24 rounded-full object-cover" /> : null}
          {detail.rejectionReason ? <p className="mt-2 text-red-600">Last rejection: {detail.rejectionReason}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
