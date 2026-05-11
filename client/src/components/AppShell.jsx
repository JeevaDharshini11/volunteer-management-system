import React from "react";
import { CalendarDays, ClipboardList, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearStoredAuth, getStoredUser } from "../utils/authStorage.js";

export default function AppShell() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isAdmin = user.role === "admin";

  const links = [
    { to: isAdmin ? "/admin" : "/volunteer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/events", label: "Events", icon: CalendarDays },
    { to: "/tasks", label: "Tasks", icon: ClipboardList },
    ...(isAdmin ? [{ to: "/volunteers", label: "Volunteers", icon: UsersRound }] : [])
  ];

  function logout() {
    clearStoredAuth();
    navigate("/auth");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Volunteer System</p>
          <h1>{isAdmin ? "Admin Console" : "Volunteer Hub"}</h1>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost-button" onClick={logout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">{user.status || "approved"}</p>
            <h2>{user.name}</h2>
          </div>
          <span className="role-pill">{user.role}</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
