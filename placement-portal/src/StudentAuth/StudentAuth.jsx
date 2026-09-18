import { useState } from "react";
import "./StudentAuth.css";
import { useNavigate } from "react-router-dom";

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
        <div className="student-auth">

            <div className="auth-card">

                <h1>Student Portal</h1>

                <p className="auth-subtitle">
                    IIIT Kalyani Placement Portal
                </p>

                {/* Sign In / Sign Up buttons */}

                <div className="auth-tabs">

                    <button
                        className={isSignin ? "active" : ""}
                        onClick={() => {
                            setIsSignin(true);
                            setMessage("");
                        }}
                    >
                        Sign In
                    </button>

                    <button
                        className={!isSignin ? "active" : ""}
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
                            placeholder="Email"
                            value={signinForm.email}
                            onChange={handleSigninChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
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
                            placeholder="Full Name"
                            value={signupForm.name}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={signupForm.email}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="password"
                            name="password"
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
                    <p className="auth-message">
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

export default StudentAuth;