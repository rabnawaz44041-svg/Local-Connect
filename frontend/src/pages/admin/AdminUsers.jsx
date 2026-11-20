import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";

export default function AdminUsers() {
  const [query, setQuery] = useState({ role: "", country: "", status: "", email: "" });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const load = async (next = query) => {
    const { data } = await api.get("/admin/users", { params: next });
    setRows(data.data.users || []);
  };

  useEffect(() => {
    load().catch((requestError) => setError(getErrorMessage(requestError, "Could not load users.")));
  }, []);

  const suspend = async (person) => {
    await api.patch(`/admin/users/${person.id}/status`, { isSuspended: !person.isSuspended });
    await load();
  };

  const remove = async (person) => {
    await api.delete(`/admin/users/${person.id}`);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <form className="mt-4 grid gap-2 sm:grid-cols-4" onSubmit={(event) => { event.preventDefault(); load().catch((requestError) => setError(getErrorMessage(requestError))); }}>
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Search email" value={query.email} onChange={(event) => setQuery({ ...query, email: event.target.value })} />
        <select className="rounded-lg border px-3 py-2 text-sm" value={query.role} onChange={(event) => setQuery({ ...query, role: event.target.value })}>
          <option value="">All roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="PROVIDER">Provider</option>
        </select>
        <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Country" value={query.country} onChange={(event) => setQuery({ ...query, country: event.target.value })} />
        <select className="rounded-lg border px-3 py-2 text-sm" value={query.status} onChange={(event) => setQuery({ ...query, status: event.target.value })}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white sm:col-span-4" type="submit">Apply filters</button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 overflow-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>{["Name", "Email", "Role", "Country / city", "Joined", "Status", "Actions"].map((heading) => <th key={heading} className="px-3 py-2 font-medium">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((person) => (
              <tr key={person.id} className="border-t">
                <td className="px-3 py-2">{person.name}</td>
                <td className="px-3 py-2">{person.email}</td>
                <td className="px-3 py-2">{person.role}</td>
                <td className="px-3 py-2">{person.country || "—"} / {person.city || "—"}</td>
                <td className="px-3 py-2">{new Date(person.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">{person.isSuspended ? "Suspended" : "Active"}</td>
                <td className="px-3 py-2">
                  <button type="button" className="mr-3 font-semibold text-indigo-600" onClick={() => suspend(person)}>{person.isSuspended ? "Activate" : "Suspend"}</button>
                  <button type="button" className="font-semibold text-red-600" onClick={() => remove(person)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
