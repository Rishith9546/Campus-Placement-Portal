import "./HomePage.css";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const portals = [
  {
    title: "Student",
    description: "Discover roles, apply with confidence, and follow every application.",
    action: "Enter student portal",
    icon: GraduationCap,
    className: "student-portal",
    path: "/studentAuth",
  },
  {
    title: "Recruiter",
    description: "Share opportunities and connect with the next generation of talent.",
    action: "Enter recruiter portal",
    icon: Building2,
    className: "recruiter-portal",
    path: "/recruiterAuth",
  },
  {
    title: "Administrator",
    description: "Access portal operations and placement activity at a glance.",
    action: "Admin sign in",
    icon: ShieldCheck,
    className: "admin-portal",
    path: "/adminAuth",
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="homepage">
      <div className="landing-shell">
        <header className="landing-header">
          <Link className="brand" to="/" aria-label="IIIT Kalyani Placement Portal home">
            <span className="brand-mark"><BriefcaseBusiness size={19} strokeWidth={2.2} /></span>
            <span className="brand-copy">
              <strong>Placement Portal</strong>
              <span>IIIT Kalyani</span>
            </span>
          </Link>
          <div className="campus-label"><span className="status-dot" /> Campus careers, connected</div>
        </header>

        <section className="hero" aria-labelledby="landing-title">
          <div className="hero-copy">
            <div className="hero-kicker"><Sparkles size={15} /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1 id="landing-title">Make your next move <span>count.</span></h1>
            <p className="tagline">
              One place for IIIT Kalyani students and recruiters to find the right opportunity and make it happen.
            </p>
            <a className="explore-link" href="#portals">Choose your portal <ArrowDown size={16} /></a>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-glow" />
            <div className="opportunity-card">
              <div className="opportunity-topline"><span className="opportunity-icon"><BriefcaseBusiness size={17} /></span><span className="match-pill">A good fit</span></div>
              <span className="opportunity-label">YOUR CAREER, IN MOTION</span>
              <strong>Find the opportunity<br />that fits your ambition.</strong>
              <div className="opportunity-divider" />
              <div className="opportunity-footer"><span><UsersRound size={15} /> Students &amp; recruiters</span><ArrowUpRight size={18} /></div>
            </div>
            <div className="floating-note"><span className="note-check">✓</span><span><strong>One connected campus</strong><small>From first search to offer</small></span></div>
            <div className="visual-spark spark-a">✳</div>
            <div className="visual-spark spark-b">✦</div>
          </div>
        </section>

        <section className="portal-section" id="portals" aria-labelledby="portal-heading">
          <div className="portal-heading-row">
            <div>
              <p className="section-eyebrow">GET STARTED</p>
              <h2 id="portal-heading">Choose your portal</h2>
            </div>
            <p className="portal-hint">Select the option that best describes you.</p>
          </div>
          <div className="portal-grid">
            {portals.map(({ title, description, action, icon: Icon, className, path }, index) => (
              <motion.button
                key={title}
                className={`portal-card ${className}`}
                onClick={() => navigate(path)}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="portal-icon"><Icon size={22} strokeWidth={1.9} /></span>
                <span className="portal-title">{title}</span>
                <span className="portal-description">{description}</span>
                <span className="portal-action">{action}<ArrowUpRight size={17} /></span>
              </motion.button>
            ))}
          </div>
        </section>

        <footer className="landing-footer">
          <span>IIIT Kalyani <span className="footer-separator">/</span> Career opportunities, within reach.</span>
          <span className="footer-status"><span className="status-dot" /> Placement community</span>
        </footer>
      </div>
    </main>
  );
}

export default HomePage;
