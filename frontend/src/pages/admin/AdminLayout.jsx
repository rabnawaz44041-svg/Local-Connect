import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { staffPath } from "../../config/staffPath";
import { useAuth } from "../../context/AuthContext";

const links = [
  [staffPath, "Dashboard"],
  [`${staffPath}/users`, "Users"],
  [`${staffPath}/providers`, "Providers"],
  [`${staffPath}/reviews`, "Reviews"],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 md:grid md:grid-cols-[220px_1fr]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <aside className="bg-gray-950 p-4 text-white">
        <p className="text-xs uppercase tracking-wide text-gray-400">Webmaster</p>
        <p className="mt-1 text-lg font-semibold">LocalConnect</p>
        <nav className="mt-6 flex gap-2 overflow-auto md:block md:space-y-1">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === staffPath}
              className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? "bg-indigo-600" : "text-gray-300"}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <button
            type="button"
            className="text-sm font-semibold text-indigo-600"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Log out
          </button>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
