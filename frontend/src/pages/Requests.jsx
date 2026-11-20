import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { formatPrice } from "../utils/format";

const labels = {
  OPEN: "Waiting for the provider",
  ACCEPTED: "Accepted — payment not locked yet",
  FUNDED: "Payment locked in escrow",
  RELEASED: "Paid to the provider",
  REJECTED: "Declined",
  CANCELLED: "Cancelled",
};

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/requests")
      .then(({ data }) => setRequests(data.data || []))
      .catch((requestError) => setError(getErrorMessage(requestError, "Could not load requests.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Requests</h1>
      <p className="mt-2 text-muted">One job moves through four steps: request, accept, lock payment, release when the work is done.</p>
      {loading ? <p className="mt-8 text-muted">Loading...</p> : null}
      {error ? <p className="mt-8 text-sm font-semibold text-coral">{error}</p> : null}
      {!loading && !error && requests.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-white p-6 text-muted shadow-sm">No requests yet. Describe a problem, open a provider, and send a request.</p>
      ) : null}
      <div className="mt-6 space-y-3">
        {requests.map((item) => (
          <Link key={item.id} to={`/requests/${item.id}`} className="block rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold">{item.service?.title}</h2>
                <p className="mt-1 text-sm text-muted">{item.provider?.name} · {labels[item.status]}</p>
              </div>
              <p className="font-extrabold text-leaf">{formatPrice(item.amount, item.currency)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
