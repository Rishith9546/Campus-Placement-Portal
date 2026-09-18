import "./HomePage.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function HomePage() {
    const navigate = useNavigate();
  return (
    <div className="homepage">
        <h2 className="logo">Placement Portal</h2>

      <section className="hero">
        <h1>IIIT Kalyani Placement Portal</h1>

        <p className="tagline">
          Connecting Students with Recruiters
        </p>

      </section>
      
         <div className="buttons">

  <motion.button
    className="student-btn"
    whileHover={{
      scale: 1.04,
      y: -5,
      backgroundColor: "#2563EB",
      color: "#FFFFFF",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.3 }}
      onClick={() => navigate("/studentAuth")}
  >
    Student Login
  </motion.button>

  <motion.button
    className="recruiter-btn"
    whileHover={{
      scale: 1.04,
      y: -5,
      backgroundColor: "#10B981",
      color: "#FFFFFF",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.3 }}
    onClick={() => navigate("/recruiterAuth")}
  >
    Recruiter Login
  </motion.button>
       </div>
    </div>
  );
}

export default HomePage;