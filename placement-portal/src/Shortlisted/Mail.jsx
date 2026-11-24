
import { useState } from "react";
import axios from "axios";
import "./Mail.css";

export function Mail({ selectedApplicant, setOpenMail }) {

    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);

    const sendEmail = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:8080/api/email/send",
                {
                    to: selectedApplicant.student.email,
                    subject: subject,
                    body: body
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Email sent successfully!");

            setOpenMail(false);

        } catch (error) {
            console.error("Email sending failed:", error);
            alert("Failed to send email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mail-overlay">
            <div className="mail-popup">

                <div className="mail-header">
                    <div>
                        <h2>📩 Send Email</h2>
                        <p>Send a message to the shortlisted student</p>
                    </div>

                    <button
                        className="mail-close"
                        onClick={() => setOpenMail(false)}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={sendEmail}>

                    <div className="mail-field">
                        <label>To</label>
                        <input
                            type="email"
                            value={selectedApplicant.student.email}
                            readOnly
                        />
                    </div>

                    <div className="mail-field">
                        <label>Student Name</label>
                        <input
                            type="text"
                            value={selectedApplicant.student.name}
                            readOnly
                        />
                    </div>

                    <div className="mail-field">
                        <label>Subject</label>
                        <input
                            type="text"
                            placeholder="Enter email subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mail-field">
                        <label>Message</label>
                        <textarea
                            placeholder="Write your message here..."
                            rows="6"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mail-actions">
                        <button
                            type="button"
                            onClick={() => setOpenMail(false)}
                            className="mail-cancel"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="mail-send"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "📩 Send Email"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
