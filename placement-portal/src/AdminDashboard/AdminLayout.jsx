import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { adminNavigation, adminModuleDetails } from "./adminNavigation.js";
import "./AdminLayout.css";

const API = "http://localhost:8080/api";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionState, setSessionState] = useState("loading");
  const [sessionError, setSessionError] = useState("");
  const page = useMemo(() => {
    const active = [...adminNavigation].sort((a, b) => b.path.length - a.path.length)
      .find((item) => item.end ? location.pathname === item.path : location.pathname.startsWith(item.path));
    return active ? adminModuleDetails[active.key] || { title: active.label } : { title: "Overview" };
  }, [location.pathname]);

  const loadSession = async () => {
    setSessionState("loading");
    setSessionError("");
    try {
      const response = await fetch(`${API}/admin/session`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("adminEmail");
        navigate("/adminAuth", { replace: true });
        return;
      }
      if (!response.ok) throw new Error("Could not verify the administrator session.");
      const profile = await response.json();
      if (profile.role !== "ROLE_ADMIN") throw new Error("This account does not have administrator access.");
      setUser(profile);
      localStorage.setItem("adminEmail", profile.email || "");
      setSessionState("ready");
    } catch (error) {
      setSessionError(error.message || "Could not verify administrator access.");
      setSessionState("error");
    }
  };

  useEffect(() => { loadSession(); }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("adminEmail");
    navigate("/", { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);

  if (sessionState !== "ready") {
    return <main className="admin-session-state">
      {sessionState === "loading" ? <><span className="admin-loading-indicator" /><h1>Checking admin access</h1><p>Verifying your account with the portal.</p></> : <><span className="admin-session-error-mark">!</span><h1>Admin access unavailable</h1><p>{sessionError}</p><div><button onClick={loadSession}>Try again</button><button className="admin-session-secondary" onClick={() => navigate("/adminAuth", { replace: true })}>Return to admin sign in</button></div></>}
    </main>;
  }

  return <div className={`admin-shell${collapsed ? " is-collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}>
    {mobileOpen && <button className="admin-mobile-backdrop" onClick={closeMobile} aria-label="Close navigation menu" />}
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar-brand-row">
        <Link className="admin-brand" to="/admin" onClick={closeMobile} aria-label="Campus Placement Portal admin overview">
          <span className="admin-brand-mark">P</span><span className="admin-brand-text"><strong>Placement Portal</strong><small>ADMIN CONSOLE</small></span>
        </Link>
        <button className="admin-mobile-close" onClick={closeMobile} aria-label="Close navigation"><X size={19} /></button>
      </div>
      <div className="admin-nav-label">WORKSPACE</div>
      <nav className="admin-nav">
        {adminNavigation.map(({ label, path, icon: Icon, end }) => <NavLink
          key={path} to={path} end={end}
          className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
          title={collapsed ? label : undefined}
          onClick={closeMobile}
        ><Icon size={18} /><span>{label}</span><i aria-hidden="true" /></NavLink>)}
      </nav>
      <div className="admin-sidebar-footer">
        <div className="admin-security-note"><span className="admin-security-icon">✓</span><span><strong>Admin workspace</strong><small>Protected by your account role</small></span></div>
        <button className="admin-sidebar-logout" onClick={logout}><LogOut size={17} /><span>Sign out</span></button>
        <button className="admin-collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}<span>{collapsed ? "Expand" : "Collapse menu"}</span>
        </button>
      </div>
    </aside>

    <main className="admin-main">
      <header className="admin-header">
        <div className="admin-header-leading">
          <button className="admin-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <div className="admin-heading-copy"><div className="admin-breadcrumb"><span>Placement office</span><span>/</span><strong>{page.title}</strong></div><h1>{page.title}</h1></div>
        </div>
        <div className="admin-header-actions">
          <div className="admin-user-menu">
          <button className="admin-profile" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen} aria-label="Open administrator profile menu">
            <span className="admin-profile-avatar">{(user?.name || user?.email || "A").slice(0, 1).toUpperCase()}</span>
            <span className="admin-profile-copy"><strong>{user?.name || "Administrator"}</strong><small>{user?.email || "Admin account"}</small></span>
            <ChevronDown size={14} />
          </button>
          {profileMenuOpen && <div className="admin-profile-popover"><strong>{user?.name || "Administrator"}</strong><span>{user?.email}</span><small>Administrator account</small><button onClick={logout}><LogOut size={15} /> Sign out</button></div>}
          </div>
          <button className="admin-header-logout" onClick={logout}><LogOut size={16} /><span>Log out</span></button>
        </div>
      </header>
      <div className="admin-content"><Outlet /></div>
    </main>
  </div>;
}
