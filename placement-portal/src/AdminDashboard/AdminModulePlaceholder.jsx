import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { adminModuleDetails } from "./adminNavigation.js";
import "./AdminDashboard.css";

export default function AdminModulePlaceholder({ moduleKey }) {
  const module = adminModuleDetails[moduleKey] || { title: "Admin module", description: "This module will be implemented in a later step." };
  return <section className="admin-placeholder-page">
    <div className="admin-placeholder-icon"><Construction size={23} /></div>
    <span className="admin-eyebrow">ADMIN MODULE · PLANNED</span>
    <h2>{module.title}</h2>
    <p>{module.description}</p>
    <div className="admin-placeholder-status"><span /> No module actions are available yet. This page does not load or change records.</div>
    <Link className="admin-secondary-link" to="/admin"><ArrowLeft size={16} /> Back to overview</Link>
  </section>;
}
