import { useState } from "react";
import "./StudentAuth.css";
import { Link, useNavigate } from "react-router-dom";

export function StudentAuth() {
    const navigate = useNavigate();

    const [isSignin, setIsSignin] = useState(true);

    const [signinForm, setSigninForm] = useState({
        email: "",
        password: ""
    });

    const [signupForm, setSignupForm] = useState({
        name: "",
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

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem("token", data.token);

   
                 navigate("/dashboard");

            } else {

                setMessage(
                    data.message || "Invalid email or password"
                );
            }

        } catch (error) {

            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    const handleSignup = async (e) => {

        e.preventDefault();

        try {

            const response = await fetch(
                "http://localhost:8080/api/auth/signup",
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

                setMessage("Account created successfully!");

                // Switch to Sign In
                setIsSignin(true);

                // Clear signup form
                setSignupForm({
                    name: "",
                    email: "",
                    password: ""
                });

            } else {

                setMessage(
                    data.message || "Signup failed"
                );
            }

        } catch (error) {

            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <main className="auth-portal auth-portal--student">
          <div className="auth-layout">
            <aside className="auth-story">
              <Link className="auth-brand" to="/"><span className="auth-brand-mark">P</span><span className="auth-brand-copy"><strong>Placement Portal</strong><small>IIIT Kalyani</small></span></Link>
              <div className="auth-story-copy"><span className="auth-story-kicker">YOUR CAREER STARTS HERE</span><h2>Make room for your next opportunity.</h2><p>Find roles that fit your goals, apply with confidence, and keep your placement journey moving.</p></div>
              <div className="auth-story-foot"><span aria-hidden="true">+</span><span>One campus. More possibilities.</span></div>
            </aside>
            <section className="auth-content">
                <Link className="auth-home-link" to="/">Back to portal selection</Link>
                <h1 className="auth-heading">Student portal</h1>
                <p className="auth-subtitle">Sign in to continue your placement journey.</p>

                {/* Sign In / Sign Up buttons */}

                <div className="auth-tabs" aria-label="Student account access">

                    <button
                        className={isSignin ? "active" : ""}
                        type="button"
                        aria-pressed={isSignin}
                        onClick={() => {
                            setIsSignin(true);
                            setMessage("");
                        }}
                    >
                        Sign In
                    </button>

                    <button
                        className={!isSignin ? "active" : ""}
                        type="button"
                        aria-pressed={!isSignin}
                        onClick={() => {
                            setIsSignin(false);
                            setMessage("");
                        }}
                    >
                        Sign Up
                    </button>

                </div>

                {/* SIGN IN */}

                {isSignin ? (

                    <form onSubmit={handleSignin}>

                        <input
                            type="email"
                            name="email"
                            aria-label="Email address"
                            autoComplete="username"
                            placeholder="Email"
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

                        <button
                            className="submit-btn"
                            type="submit"
                        >
                            Sign In
                        </button>

                    </form>

                ) : (

                    /* SIGN UP */

                    <form onSubmit={handleSignup}>

                        <input
                            type="text"
                            name="name"
                            aria-label="Full name"
                            autoComplete="name"
                            placeholder="Full Name"
                            value={signupForm.name}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            aria-label="Email address"
                            autoComplete="email"
                            placeholder="Email"
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

                        <button
                            className="submit-btn"
                            type="submit"
                        >
                            Create Account
                        </button>

                    </form>
                )}

                {message && (
                    <p className="auth-message" role="status">
                        {message}
                    </p>
                )}

              <nav className="auth-role-links" aria-label="Other portal sign-ins"><Link aria-current="page" to="/studentAuth">Student</Link><Link to="/recruiterAuth">Recruiter</Link><Link to="/adminAuth">Administrator</Link></nav>
            </section>
          </div>
        </main>
    );
}

export default StudentAuth;
