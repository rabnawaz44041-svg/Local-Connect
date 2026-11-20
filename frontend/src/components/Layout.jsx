import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SiteFooter from "./SiteFooter";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const dashboardPath = user?.role === "PROVIDER" ? "/provider/dashboard" : "/customer/dashboard";

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-[1.65rem] font-extrabold tracking-tight text-leaf">
            LocalConnect
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {user && user.role !== "ADMIN" ? <NavLink to="/requests" className="nav-link">Requests</NavLink> : null}
            {user?.role === "PROVIDER" ? (
              <NavLink to="/provider/dashboard" className="nav-link">
                Your services
              </NavLink>
            ) : (
              <Link to="/signup/provider" className="nav-link">
                Join as a pro
              </Link>
            )}
            {user?.role === "ADMIN" ? (
              <button type="button" onClick={handleLogout} className="nav-link">
                Log out
              </button>
            ) : user ? (
              <>
                <NavLink to={dashboardPath} className="nav-link">
                  Account
                </NavLink>
                <button type="button" onClick={handleLogout} className="nav-link">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Log in
                </Link>
                <Link to="/signup" className="lift rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-leaf-dark">
                  Sign up
                </Link>
              </>
            )}
          </nav>
          <button type="button" className="rounded-full border border-line px-3 py-2 text-sm font-semibold md:hidden" onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
        </div>
        {open ? (
          <div className="flex flex-col gap-3 border-t border-line bg-white px-4 py-4 text-sm font-semibold md:hidden">
            {user && user.role !== "ADMIN" ? <Link to="/requests" onClick={() => setOpen(false)}>Requests</Link> : null}
            <Link to="/signup/provider" onClick={() => setOpen(false)}>Join as a pro</Link>
            {user ? (
              <button type="button" className="text-left" onClick={handleLogout}>Log out</button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
            )}
          </div>
        ) : null}
      </header>
      <main key={location.pathname} className="page-enter flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
