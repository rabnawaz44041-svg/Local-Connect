import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-muted">That link does not match a LocalConnect page.</p>
      <Link to="/" className="mt-6 inline-flex font-semibold text-blue">
        Go to the homepage
      </Link>
    </div>
  );
}
