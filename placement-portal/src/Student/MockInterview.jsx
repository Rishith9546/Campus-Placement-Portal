
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MockInterview.css";

const API_URL = "http://localhost:8080/api/mock-interview";

function MockInterview() {
    const location = useLocation();
    const navigate = useNavigate();

    const settings = location.state || {};

    const topic = settings.topic || "Java";
    const difficulty = settings.difficulty || "Medium";
    const questionCount = Number(settings.questionCount || 5);

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    console.log(results)

    const token = localStorage.getItem("token");

    useEffect(() => {
        let cancelled = false;

        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError("");

                if (!location.state?.topic) {
                    navigate("/viewjobs?practice=1", { replace: true });
                    return;
                }

                if (!token) {
                    throw new Error(
                        "Please log in before starting the interview."
                    );
                }

                const response = await fetch(`${API_URL}/questions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        topic,
                        difficulty,
                        questionCount
                    })
                });

                if (!response.ok) {
                    throw new Error(
                        await response.text() ||
                        "Unable to generate questions."
                    );
                }

                const data = await response.json();

                if (
                    !Array.isArray(data.questions) ||
                    data.questions.length === 0
                ) {
                    throw new Error("No questions were generated.");
                }

                if (!cancelled) {
                    setQuestions(data.questions);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchQuestions();

        return () => {
            cancelled = true;
        };
    }, [topic, difficulty, questionCount, token, location.state, navigate]);

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.values(answers).filter((answer) => answer.trim()).length;

    const handleAnswerChange = (value) => {
        if (!currentQuestion) return;

        setAnswers((previous) => ({
            ...previous,
            [currentIndex]: value
        }));
    };

    const submitInterview = async () => {
        if (!questions.length) return;

        const unanswered = questions.findIndex(
            (_, index) => !(answers[index] || "").trim()
        );

        if (unanswered !== -1) {
            setCurrentIndex(unanswered);
            setError(
                `Please answer question ${unanswered + 1} before submitting.`
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const submittedAnswers = questions.map((question, index) => ({
                question: question.question,
                answer: answers[index] || ""
            }));

            const response = await fetch(`${API_URL}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic,
                    difficulty,
                    answers: submittedAnswers
                })
            });

            if (!response.ok) {
                throw new Error(
                    await response.text() ||
                    "Unable to evaluate your answers."
                );
            }

            const data = await response.json();
            setResults(data);

            // Remove the temporary answers from React state.
            setAnswers({});
        } catch (err) {
            setError(err.message || "Evaluation failed.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="mock-page">
                <div className="mock-loading" role="status" aria-live="polite">
                    <span className="mock-prep-eyebrow">AI MOCK INTERVIEW</span>
                    <div className="mock-prep-spinner-wrap"><div className="mock-spinner"></div><span>AI</span></div>
                    <h1>Preparing your interview</h1>
                    <p>Generating your questions now. This may take a moment.</p>
                    <div className="mock-prep-settings" aria-label="Selected interview settings">
                        <div><small>TOPIC</small><strong>{topic}</strong></div>
                        <div><small>QUESTIONS</small><strong>{questionCount}</strong></div>
                        <div><small>DIFFICULTY</small><strong>{difficulty}</strong></div>
                    </div>
                    <span className="mock-prep-note">Keep this page open while we prepare your session.</span>
                    <button className="mock-prep-back" type="button" onClick={() => navigate("/viewjobs?practice=1", { replace: true })}>Back to interview setup</button>
                </div>
            </div>
        );
    }

    if (error && questions.length === 0) {
        return (
            <div className="mock-page">
                <div className="mock-error-card">
                    <h2>Unable to start interview</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/viewjobs?practice=1", { replace: true })}>
                        Back to interview setup
                    </button>
                </div>
            </div>
        );
    }

    if (results) {
        const feedback = Array.isArray(results.answerFeedback)
            ? results.answerFeedback
            : [];
        const maxScore = Number(results.maxScore) || 10;
        const numericScore = Number(results.score) || 0;
        const scorePercent = Math.max(0, Math.min(100, Math.round((numericScore / maxScore) * 100)));

        return (
            <div className="mock-page">
                <div className="mock-results">
                    <button
                        className="mock-back-btn"
                        onClick={() => navigate("/viewjobs")}
                    >
                        ← Back to View Jobs
                    </button>

                    <div className="results-heading">
                        <span className="mock-eyebrow">
                            INTERVIEW COMPLETED
                        </span>
                        <h1>Interview complete</h1>
                        <p>
                            {topic} · {difficulty} difficulty
                        </p>
                    </div>

                    <div className="score-card">
                        <div className="score-card-main">
                            <div className="score-card-copy">
                                <span className="score-overline">YOUR PERFORMANCE</span>
                                <h2>Overall score</h2>
                                <p>{topic} <span>·</span> {difficulty} difficulty</p>
                            </div>
                            <div className="score-ring" style={{ "--score-progress": `${scorePercent}%` }} role="img" aria-label={`Score ${numericScore} out of ${maxScore}`}>
                                <div><strong>{numericScore}</strong><small>/ {maxScore}</small></div>
                            </div>
                        </div>
                        <div className="score-progress-track" role="progressbar" aria-label="Interview score percentage" aria-valuenow={scorePercent} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${scorePercent}%` }} /></div>
                        <div className="score-card-footer"><span>{results.totalQuestions ?? feedback.length} questions evaluated</span><strong>{scorePercent}%</strong></div>
                    </div>

                    <div className="results-grid">
                        <section className="feedback-card">
                            <h3>💪 Strengths</h3>
                            {Array.isArray(results.strengths) &&
                            results.strengths.length > 0 ? (
                                <ul>
                                    {results.strengths.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No strengths were returned.</p>
                            )}
                        </section>

                        <section className="feedback-card">
                            <h3>🎯 Areas to Improve</h3>
                            {Array.isArray(results.weaknesses) &&
                            results.weaknesses.length > 0 ? (
                                <ul>
                                    {results.weaknesses.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No weaknesses were returned.</p>
                            )}
                        </section>

                        <section className="feedback-card full-width">
                            <h3>📚 Suggestions</h3>
                            {Array.isArray(results.suggestions) &&
                            results.suggestions.length > 0 ? (
                                <ul>
                                    {results.suggestions.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No suggestions were returned.</p>
                            )}
                        </section>
                    </div>

                    <section className="answer-review">
                        <h2>Question-wise Feedback</h2>

                        {feedback.map((item, index) => (
                            <article
                                className="answer-feedback"
                                key={index}
                            >
                                <div className="feedback-top">
                                    <h3>Question {index + 1}</h3>
                                    <span className="feedback-score">
                                        {item.score ?? 0} /{" "}
                                        {item.maxScore ?? 10}
                                    </span>
                                </div>
                                <p className="feedback-question">
                                    {item.question}
                                </p>
                                <p>{item.feedback}</p>
                            </article>
                        ))}
                    </section>

                    <button
                        className="mock-primary-btn"
                        onClick={() =>
                            navigate("/viewjobs", { replace: true })
                        }
                    >
                        Back to View Jobs <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="mock-page">
                <p>No questions are available.</p>
                <button onClick={() => navigate("/viewjobs")}>
                    Back to View Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="mock-page">
            <div className="mock-interview-container">
                    <button
                    className="mock-back-btn"
                    onClick={() => navigate("/viewjobs")}
                >
                    ← Exit Interview
                </button>

                <div className="mock-header">
                    <span className="mock-eyebrow">
                        AI MOCK INTERVIEW
                    </span>
                    <h1>{topic} Interview</h1>
                    <p>
                        Difficulty: <strong>{difficulty}</strong>
                    </p>
                </div>

                <div className="question-progress">
                    <div className="progress-label">
                        <span>
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <span>
                            {answeredCount} of {questions.length} answered
                        </span>
                    </div>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${
                                    ((currentIndex + 1) / questions.length) *
                                    100
                                }%`
                            }}
                        ></div>
                    </div>
                </div>

                <nav className="question-steps" aria-label="Interview questions">
                    {questions.map((question, index) => {
                        const isAnswered = Boolean((answers[index] || "").trim());
                        return <button
                            type="button"
                            key={`${index}-${question.question}`}
                            className={`${index === currentIndex ? "is-current" : ""}${isAnswered ? " is-answered" : ""}`}
                            aria-label={`Go to question ${index + 1}${isAnswered ? ", answered" : ", not answered"}`}
                            aria-current={index === currentIndex ? "step" : undefined}
                            onClick={() => { setError(""); setCurrentIndex(index); }}
                            disabled={submitting}
                        >{isAnswered ? "✓" : index + 1}</button>;
                    })}
                </nav>

                <div className="question-card">
                    <span className="question-number">
                        QUESTION {currentIndex + 1}
                    </span>

                    <h2>{currentQuestion.question}</h2>

                    <label htmlFor="interview-answer">
                        Your Answer
                    </label>

                    <textarea
                        id="interview-answer"
                        value={answers[currentIndex] || ""}
                        onChange={(event) =>
                            handleAnswerChange(event.target.value)
                        }
                        placeholder="Write your answer here..."
                        rows={8}
                        aria-label={`Answer to question ${currentIndex + 1}`}
                    />

                    <p className="answer-hint">
                        Explain your approach clearly. Your answer will be
                        evaluated when you finish the interview.
                    </p>
                </div>

                {error && <div className="mock-error">{error}</div>}

                <div className="question-navigation">
                    <button
                        className="mock-secondary-btn"
                        disabled={currentIndex === 0 || submitting}
                        onClick={() => {
                            setError("");
                            setCurrentIndex((index) => index - 1);
                        }}
                    >
                        ← Previous
                    </button>

                    {currentIndex < questions.length - 1 ? (
                        <button
                            className="mock-primary-btn"
                            disabled={submitting}
                            onClick={() => {
                                setError("");
                                setCurrentIndex((index) => index + 1);
                            }}
                        >
                            Next Question →
                        </button>
                    ) : (
                        <button
                            className="mock-primary-btn"
                            disabled={submitting}
                            onClick={submitInterview}
                        >
                            {submitting
                                ? "Evaluating..."
                                : "Submit Interview"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MockInterview;
