import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";

const steps = ["Request", "Accept", "Lock payment", "Release"];

function stepIndex(status) {
  if (status === "OPEN") return 0;
  if (status === "ACCEPTED") return 1;
  if (status === "FUNDED") return 2;
  if (status === "RELEASED") return 3;
  return -1;
}

export default function RequestDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("50000");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([api.get(`/requests/${id}`), api.get("/wallet")])
      .then(([requestResponse, walletResponse]) => {
        if (ignore) return;
        setRequest(requestResponse.data.data);
        setWallets(walletResponse.data.data || []);
      })
      .catch((requestError) => {
        if (!ignore) setError(getErrorMessage(requestError, "Could not load this request."));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const act = async (path) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post(path);
      setRequest(data.data);
      setMessage(data.message || "Updated.");
      const walletResponse = await api.get("/wallet");
      setWallets(walletResponse.data.data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "That step could not be completed."));
    } finally {
      setBusy(false);
    }
  };

  const addFunds = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/wallet/topup", { amount: Number(topUpAmount), currency: request.currency });
      const walletResponse = await api.get("/wallet");
      setWallets(walletResponse.data.data || []);
      setMessage("Test funds added. This does not charge a real card.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not add funds."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-12 text-muted">Loading request...</p>;
  if (!request) {
    return <p className="mx-auto max-w-3xl px-4 py-12 text-coral">{error || "Request not found."}</p>;
  }

  const index = stepIndex(request.status);
  const isCustomer = user?.id === request.customerId;
  const balance = wallets.find((wallet) => wallet.currency === request.currency)?.balance || 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/requests" className="text-sm font-semibold text-leaf">All requests</Link>
      <h1 className="mt-3 text-4xl font-extrabold">{request.service?.title}</h1>
      <p className="mt-2 text-muted">{request.note}</p>
      <p className="mt-4 text-2xl font-extrabold text-leaf">{formatPrice(request.amount, request.currency)}</p>

      {index >= 0 ? (
        <ol className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((label, step) => (
            <li key={label} className={`rounded-2xl px-3 py-3 text-sm font-bold ${step <= index ? "bg-leaf text-white" : "bg-white text-muted"}`}>
              {step + 1}. {label}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold">{request.status === "REJECTED" ? "The provider declined this request." : "This request was cancelled."}</p>
      )}

      {message ? <p className="mt-4 text-sm font-semibold text-leaf">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-semibold text-coral">{error}</p> : null}

      <div className="mt-6 rounded-[1.75rem] bg-white p-6 shadow-sm">
        {request.status === "OPEN" && !isCustomer ? (
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={() => act(`/requests/${id}/accept`)} className="rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white">Accept request</button>
            <button type="button" disabled={busy} onClick={() => act(`/requests/${id}/reject`)} className="rounded-full border border-line px-5 py-3 text-sm font-bold">Decline</button>
          </div>
        ) : null}
        {request.status === "OPEN" && isCustomer ? (
          <button type="button" disabled={busy} onClick={() => act(`/requests/${id}/cancel`)} className="rounded-full border border-line px-5 py-3 text-sm font-bold">Cancel request</button>
        ) : null}
        {request.status === "ACCEPTED" && isCustomer ? (
          <div>
            <p className="text-sm text-muted">Your {request.currency} balance: {formatPrice(balance, request.currency)}. Locking moves this amount to the platform. The provider is paid only when you confirm the job is done.</p>
            <button type="button" disabled={busy || balance < request.amount} onClick={() => act(`/requests/${id}/fund`)} className="mt-4 rounded-full bg-coral px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Lock payment in escrow</button>
            {balance < request.amount ? (
              <form onSubmit={addFunds} className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-sm font-semibold">
                  Add test funds
                  <input value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} className="mt-1 block rounded-2xl border border-line px-3 py-2" />
                </label>
                <button type="submit" disabled={busy} className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white">Add {request.currency}</button>
              </form>
            ) : null}
          </div>
        ) : null}
        {request.status === "ACCEPTED" && !isCustomer ? <p className="text-sm text-muted">You accepted. Waiting for the customer to lock payment.</p> : null}
        {request.status === "FUNDED" && isCustomer ? (
          <button type="button" disabled={busy} onClick={() => act(`/requests/${id}/release`)} className="rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white">Job is done — release payment</button>
        ) : null}
        {request.status === "FUNDED" && !isCustomer ? <p className="text-sm text-muted">Payment is locked with the platform. It reaches you when the customer confirms completion.</p> : null}
        {request.status === "RELEASED" ? <p className="text-sm font-semibold text-leaf">The locked payment has been released to {request.provider?.name}.</p> : null}
      </div>
    </div>
  );
}
