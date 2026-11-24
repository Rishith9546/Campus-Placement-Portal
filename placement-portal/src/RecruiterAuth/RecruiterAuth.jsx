import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RecruiterAuth.css";

export function RecruiterAuth() {

    const navigate = useNavigate();

    const [isSignin, setIsSignin] = useState(true);

    const [signinForm, setSigninForm] = useState({
        email: "",
        password: ""
    });

    const [signupForm, setSignupForm] = useState({
        companyName: "",
        recruiterName: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleSigninChange = (e) => {
        setSigninForm({
            ...signinForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSignupChange = (e) => {
        setSignupForm({
            ...signupForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSignin = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(signinForm)
                }
            );

            console.log("Login Status:", response.status);

            const text = await response.text();

            console.log("Login Response:", text);

            if (!response.ok) {

                setMessage(
                    "Login failed. Status: " + response.status
                );

                return;
            }

            const data = JSON.parse(text);

            if (data.role !== "ROLE_RECRUITER") {

                setMessage(
                    "This account is not a recruiter account."
                );

                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "role",
                data.role
            );

            navigate("/recruiterDashboard");

        } catch (error) {

            console.error("Login Error:", error);

            setMessage(
                "Unable to connect to server"
            );
        }
    };

    const handleSignup = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/recruiter/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(signupForm)
                }
            );

            const data = await response.json();

            if (response.ok) {

                setMessage(
                    "Recruiter account created successfully!"
                );

                setIsSignin(true);

                setSignupForm({
                    companyName: "",
                    recruiterName: "",
                    email: "",
                    password: ""
                });

            } else {

                setMessage(
                    data.message ||
                    "Recruiter signup failed"
                );
            }

        } catch (error) {

            console.error("Signup Error:", error);

            setMessage(
                "Unable to connect to server"
            );
        }
    };

    return (
        <main className="auth-portal auth-portal--recruiter">
          <div className="auth-layout">
            <aside className="auth-story">
              <Link className="auth-brand" to="/"><span className="auth-brand-mark">P</span><span className="auth-brand-copy"><strong>Placement Portal</strong><small>IIIT Kalyani</small></span></Link>
              <div className="auth-story-copy"><span className="auth-story-kicker">MEET YOUR NEXT GREAT HIRE</span><h2>Build a stronger team, starting here.</h2><p>Share opportunities with campus talent and manage your hiring journey in one place.</p></div>
              <div className="auth-story-foot"><span aria-hidden="true">+</span><span>Connect with emerging talent.</span></div>
            </aside>
            <section className="auth-content">
                <Link className="auth-home-link" to="/">Back to portal selection</Link>
                <h1 className="auth-heading">Recruiter portal</h1>
                <p className="auth-subtitle">Sign in to manage opportunities and applicants.</p>

                <div className="auth-tabs" aria-label="Recruiter account access">

                    <button
                        type="button"
                        aria-pressed={isSignin}
                        className={
                            isSignin ? "active" : ""
                        }
                        onClick={() => {
                            setIsSignin(true);
                            setMessage("");
                        }}
                    >
                        Sign In
                    </button>

                    <button
                        type="button"
                        aria-pressed={!isSignin}
                        className={
                            !isSignin ? "active" : ""
                        }
                        onClick={() => {
                            setIsSignin(false);
                            setMessage("");
                        }}
                    >
                        Sign Up
                    </button>

                </div>

                {isSignin ? (

                    <form onSubmit={handleSignin}>

                        <input
                            type="email"
                            name="email"
                            aria-label="Company email"
                            autoComplete="username"
                            placeholder="Company Email"
                            value={signinForm.email}
                            onChange={handleSigninChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            aria-label="Password"
                            autoComplete="current-password"
                            placeholder="Password"
                            value={signinForm.password}
                            onChange={handleSigninChange}
                            required
                        />

                        <button type="submit">
                            Recruiter Sign In
                        </button>

                    </form>

                ) : (

                    <form onSubmit={handleSignup}>

                        <input
                            type="text"
                            name="companyName"
                            aria-label="Company name"
                            autoComplete="organization"
                            placeholder="Company Name"
                            value={signupForm.companyName}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="text"
                            name="recruiterName"
                            aria-label="Recruiter name"
                            autoComplete="name"
                            placeholder="Recruiter Name"
                            value={signupForm.recruiterName}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            aria-label="Company email"
                            autoComplete="email"
                            placeholder="Company Email"
                            value={signupForm.email}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            aria-label="Password"
                            autoComplete="new-password"
                            placeholder="Password"
                            value={signupForm.password}
                            onChange={handleSignupChange}
                            required
                        />

                        <button type="submit">
                            Create Recruiter Account
                        </button>

                    </form>

                )}

                {message && (
                    <p className="auth-message" role="status">
                        {message}
                    </p>
                )}

              <nav className="auth-role-links" aria-label="Other portal sign-ins"><Link to="/studentAuth">Student</Link><Link aria-current="page" to="/recruiterAuth">Recruiter</Link><Link to="/adminAuth">Administrator</Link></nav>
            </section>
          </div>
        </main>
    );
}

export default RecruiterAuth;
