
import { Headers } from "./Headers.jsx";
import "./ViewJobs.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getJobs, getUser, searchJobs } from "./Functions/viewjobs.js";

function ViewJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [keyWord, setKeyWord] = useState("");
    const [popUp, setPopUp] = useState(false);

    // Mock interview settings
    const [topic, setTopic] = useState("Java");
    const [customTopic, setCustomTopic] = useState("");
    const [questionCount, setQuestionCount] = useState(10);
    const [difficulty, setDifficulty] = useState("Medium");
    const [topicError, setTopicError] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            const data = await getJobs();
            setJobs(data);
        };

        const fetchUser = async () => {
            const data = await getUser();
            setUsers(data);
        };

        fetchJobs();
        fetchUser();
    }, []);

    useEffect(() => {
        if (keyWord.trim() === "") {
            const fetchJobs = async () => {
                const data = await getJobs();
                setJobs(data);
            };

            fetchJobs();
            return;
        }

        const fetchSearchJobs = async () => {
            const data = await searchJobs(keyWord);
            setJobs(data);
        };

        fetchSearchJobs();
    }, [keyWord]);

    const startInterview = () => {
        const selectedTopic =
            topic === "Custom" ? customTopic.trim() : topic;

        if (!selectedTopic) {
            setTopicError("Please enter your custom topic.");
            return;
        }

        setTopicError("");

        setPopUp(false);

        navigate("/mock-interview", {
            state: {
                topic: selectedTopic,
                questionCount: Number(questionCount),
                difficulty: difficulty
            }
        });
    };

    return (
        <>
            <Headers />

            <button
                onClick={() => navigate("/dashboard")}
                className="Back"
            >
                ← Back to Profile
            </button>

            <div className="mock-button">
                <button
                    type="button"
                    className="start-interview-btn"
                    onClick={() => setPopUp(true)}
                >
                    <span>Start Mock Interview</span>
                    <span className="interview-arrow">→</span>
                </button>
            </div>

            {/* Mock Interview Configuration Popup */}
            {popUp && (
                <div
                    className="mock-interview-overlay"
                    onClick={() => setPopUp(false)}
                >
                    <div
                        className="mock-interview-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="close-popup"
                            onClick={() => setPopUp(false)}
                            aria-label="Close popup"
                        >
                            ×
                        </button>

                        <div className="modal-heading">
                            <span className="modal-label">
                                INTERVIEW PRACTICE
                            </span>

                            <h2>Configure Mock Interview</h2>

                            <p>
                                Customize your session before you begin.
                            </p>
                        </div>

                        <div className="interview-form">
                            {/* Topic */}
                            <div className="form-group">
                                <label htmlFor="interview-topic">
                                    Interview Topic
                                </label>

                                <select
                                    id="interview-topic"
                                    value={topic}
                                    onChange={(e) => {
                                        setTopic(e.target.value);
                                        setTopicError("");
                                    }}
                                >
                                    <option value="Java">Java</option>
                                    <option value="DSA">
                                        Data Structures & Algorithms
                                    </option>
                                    <option value="Spring Boot">
                                        Spring Boot
                                    </option>
                                    <option value="React">React.js</option>
                                    <option value="SQL">SQL & MySQL</option>
                                    <option value="Full Stack">
                                        Full Stack Development
                                    </option>
                                    <option value="Mixed">Mixed Topics</option>
                                    <option value="Custom">Custom Topic</option>
                                </select>

                                {topic === "Custom" && (
                                    <input
                                        type="text"
                                        className="custom-topic-input"
                                        placeholder="e.g. JWT Authentication"
                                        value={customTopic}
                                        onChange={(e) => {
                                            setCustomTopic(e.target.value);
                                            setTopicError("");
                                        }}
                                    />
                                )}

                                {topicError && (
                                    <p className="topic-error">
                                        {topicError}
                                    </p>
                                )}
                            </div>

                            {/* Number of questions */}
                            <div className="form-group">
                                <label htmlFor="question-count">
                                    Number of Questions
                                </label>

                                <select
                                    id="question-count"
                                    value={questionCount}
                                    onChange={(e) =>
                                        setQuestionCount(Number(e.target.value))
                                    }
                                >
                                    <option value={5}>5 Questions</option>
                                    <option value={10}>10 Questions</option>
                                    <option value={15}>15 Questions</option>
                                    <option value={20}>20 Questions</option>
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div className="form-group">
                                <label>Difficulty Level</label>

                                <div className="difficulty-options">
                                    {["Easy", "Medium", "Hard"].map(
                                        (level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                className={`difficulty ${
                                                    difficulty === level
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setDifficulty(level)
                                                }
                                                aria-pressed={
                                                    difficulty === level
                                                }
                                            >
                                                {level}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                className="begin-interview-btn"
                                onClick={startInterview}
                            >
                                Start Interview <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Job Search */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search jobs by title, skills, or company..."
                    value={keyWord}
                    onChange={(e) => setKeyWord(e.target.value)}
                />
            </div>

            {/* Existing Job Cards */}
            <div className="jobs-container">
                {jobs.map((job) => {
                    const data = (job.skills || "")
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean);

                    return (
                        <div
                            key={job.id}
                            className="job-card"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                            <div>
                                <h3>{job.title}</h3>
                                <p>
                                    {job.company} • {job.location}
                                </p>

                                {data.map((skill) => (
                                    <span key={skill}>{skill}</span>
                                ))}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/jobs/${job.id}`);
                                }}
                            >
                                View
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default ViewJobs;
