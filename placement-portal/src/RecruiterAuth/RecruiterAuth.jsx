import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <div className="recruiter-auth">

            <div className="recruiter-auth-card">

                <h1>Recruiter Portal</h1>

                <p>
                    IIIT Kalyani Placement Portal
                </p>

                <div className="auth-tabs">

                    <button
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
                            placeholder="Company Email"
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

                        <button type="submit">
                            Recruiter Sign In
                        </button>

                    </form>

                ) : (

                    <form onSubmit={handleSignup}>

                        <input
                            type="text"
                            name="companyName"
                            placeholder="Company Name"
                            value={signupForm.companyName}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="text"
                            name="recruiterName"
                            placeholder="Recruiter Name"
                            value={signupForm.recruiterName}
                            onChange={handleSignupChange}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Company Email"
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

                        <button type="submit">
                            Create Recruiter Account
                        </button>

                    </form>

                )}

                {message && (
                    <p>
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

export default RecruiterAuth;