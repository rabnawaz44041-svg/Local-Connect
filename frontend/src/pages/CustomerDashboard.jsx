import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-semibold text-blue">Customer</p>
      <h1 className="mt-2 text-4xl font-extrabold">Hello, {user.name}</h1>
      <p className="mt-4 leading-7 text-muted">
        Describe the problem on the home page. The local model decides the service, then shows providers near your saved region.
        Reviews open only after a completed booking, which is the next piece.
      </p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-leaf px-5 py-3 text-sm font-bold text-white">
        Describe a problem
      </Link>
    </div>
  );
}
