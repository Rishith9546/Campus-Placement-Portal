import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./AdminAuth.css";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost:8080/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || (response.status === 401 ? "Invalid email or password." : "Admin access was denied."));
        return;
      }
      if (data.role !== "ROLE_ADMIN" || !data.token) {
        setMessage("This account does not have administrator access.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("adminEmail", form.email.trim());
      navigate("/admin");
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-portal auth-portal--admin">
      <div className="auth-layout">
        <aside className="auth-story">
          <Link className="auth-brand" to="/"><span className="auth-brand-mark">P</span><span className="auth-brand-copy"><strong>Placement Portal</strong><small>IIIT Kalyani</small></span></Link>
          <div className="auth-story-copy"><span className="auth-story-kicker">CAMPUS PLACEMENTS, IN VIEW</span><h2>Keep the whole process on track.</h2><p>Review portal activity and support a smoother placement experience across the campus.</p></div>
          <div className="auth-story-foot"><span aria-hidden="true">+</span><span>Operations at a glance.</span></div>
        </aside>
        <section className="auth-content">
        <Link className="auth-home-link" to="/">Back to portal selection</Link>
        <form className="auth-admin-card" onSubmit={handleSubmit}>
        <p className="auth-story-kicker">ADMINISTRATOR ACCESS</p>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subtitle">Sign in with your administrator account to continue.</p>
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="username" required value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })} />
        {message && <p className="admin-auth-message" role="alert">{message}</p>}
        <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in as admin"}</button>
      </form>
        <nav className="auth-role-links" aria-label="Other portal sign-ins"><Link to="/studentAuth">Student</Link><Link to="/recruiterAuth">Recruiter</Link><Link aria-current="page" to="/adminAuth">Administrator</Link></nav>
        </section>
      </div>
    </main>
  );
}
