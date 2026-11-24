import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const metrics = [
  ["Students", "students"],
  ["Recruiters", "recruiters"],
  ["Job postings", "jobs"],
  ["Applications", "applications"],
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || localStorage.getItem("role") !== "ROLE_ADMIN") {
      navigate("/adminAuth", { replace: true });
      return;
    }
    fetch("http://localhost:8080/api/admin/overview", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load the admin overview.");
      setSummary(data);
    }).catch((requestError) => setError(requestError.message || "Unable to connect to the server."));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div><p className="admin-eyebrow">IIIT KALYANI</p><h1>Portal overview</h1></div>
        <button onClick={logout}>Sign out</button>
      </header>
      <p className="admin-dashboard-intro">A snapshot of activity across the placement portal.</p>
      {error && <p className="admin-dashboard-error" role="alert">{error}</p>}
      {!summary && !error && <p>Loading overview…</p>}
      {summary && <section className="admin-metrics" aria-label="Portal statistics">
        {metrics.map(([label, key]) => <article className="admin-metric" key={key}>
          <p>{label}</p><strong>{summary[key]}</strong>
        </article>)}
      </section>}
    </main>
  );
}
