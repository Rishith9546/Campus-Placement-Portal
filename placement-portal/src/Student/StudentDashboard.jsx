import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentDashBoard.css";
import { Headers } from "./Headers.jsx";

function StudentDashboard() {

    const navigate = useNavigate();

    const [student, setStudent] = useState({
        id: null,
        name: "",
        email: "",
        rollNo: "",
        phone: "",
        branch: "",
        cgpa: "",
        skills: "",
        profilePhoto: null,
        resume: null
    });

    const [profilePhoto, setProfilePhoto] =
        useState("/student-photo.jpg");

    const [showEdit, setShowEdit] =
        useState(false);

    const [formData, setFormData] = useState({
        rollNo: "",
        phone: "",
        branch: "",
        cgpa: "",
        skills: ""
    });

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const getStudentProfile = async () => {

            const token =
                localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {

                const response =
                    await axios.get(
                        "http://localhost:8080/api/student/profile",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                setStudent({
                    id: response.data.id ?? null,
                    name: response.data.name ?? "",
                    email: response.data.email ?? "",
                    rollNo: response.data.rollNo ?? "",
                    phone: response.data.phone ?? "",
                    branch: response.data.branch ?? "",
                    cgpa: response.data.cgpa ?? "",
                    skills: response.data.skills ?? "",
                    profilePhoto:
                        response.data.profilePhoto ?? null,
                    resume:
                        response.data.resume ?? null
                });

                setFormData({
                    rollNo:
                        response.data.rollNo || "",
                    phone:
                        response.data.phone || "",
                    branch:
                        response.data.branch || "",
                    cgpa:
                        response.data.cgpa || "",
                    skills:
                        response.data.skills || ""
                });

                if (response.data.profilePhoto) {

                    setProfilePhoto(
                        `http://localhost:8080/api/student/photo/${encodeURIComponent(
                            response.data.profilePhoto
                        )}`
                    );

                } else {

                    setProfilePhoto(
                        "/student-photo.jpg"
                    );
                }

            } catch (error) {

                console.error(
                    "Error getting student profile:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };

        getStudentProfile();

    }, []);

    const handleProfilePhoto = async (event) => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            return;
        }

        const imageURL =
            URL.createObjectURL(file);

        setProfilePhoto(imageURL);

        const uploadData =
            new FormData();

        uploadData.append(
            "photo",
            file
        );

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response =
                await axios.post(
                    "http://localhost:8080/api/student/photo",
                    uploadData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const filename =
                response.data?.profilePhoto;

            if (filename) {

                setProfilePhoto(
                    `http://localhost:8080/api/student/photo/${encodeURIComponent(
                        filename
                    )}`
                );

                setStudent(prev => ({
                    ...prev,
                    profilePhoto: filename
                }));
            }

        } catch (error) {

            console.error(
                "Photo upload error:",
                error
            );

            setProfilePhoto(
                "/student-photo.jpg"
            );
        }
    };

    const handleResume = async (event) => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            return;
        }

        const uploadData =
            new FormData();

        uploadData.append(
            "resume",
            file
        );

        try {

            const token =
                localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response =
                await axios.post(
                    "http://localhost:8080/api/student/resume",
                    uploadData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const filename =
                response.data?.resume;

            if (!filename) {
                return;
            }

            setStudent(prev => ({
                ...prev,
                resume: filename
            }));

        } catch (error) {

            console.error(
                "Resume upload error:",
                error
            );
        }
    };

    const viewResume = async () => {

        const filename =
            student.resume;

        if (!filename) {
            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const response =
                await axios.get(
                    `http://localhost:8080/api/student/resume/${encodeURIComponent(
                        filename
                    )}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },
                        responseType: "blob"
                    }
                );

            const pdfUrl =
                URL.createObjectURL(
                    response.data
                );

            window.open(
                pdfUrl,
                "_blank"
            );

        } catch (error) {

            console.error(
                "Error opening resume:",
                error
            );
        }
    };

    const openEdit = () => {

        setFormData({
            rollNo:
                student.rollNo || "",

            phone:
                student.phone || "",

            branch:
                student.branch || "",

            cgpa:
                student.cgpa || "",

            skills:
                student.skills || ""
        });

        setShowEdit(true);
    };

    const closeEdit = () => {
        setShowEdit(false);
    };

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveDetails = async () => {

        const token =
            localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const response =
                await axios.post(
                    "http://localhost:8080/api/student/profile",

                    {
                        rollNo:
                        formData.rollNo,

                        phone:
                        formData.phone,

                        branch:
                        formData.branch,

                        cgpa:
                        formData.cgpa,

                        skills:
                        formData.skills
                    },

                    {
                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setStudent(prev => ({
                ...prev,
                ...response.data,

                profilePhoto:
                    response.data.profilePhoto ??
                    prev.profilePhoto,

                resume:
                    response.data.resume ??
                    prev.resume
            }));

            setFormData({
                rollNo:
                    response.data.rollNo || "",

                phone:
                    response.data.phone || "",

                branch:
                    response.data.branch || "",

                cgpa:
                    response.data.cgpa || "",

                skills:
                    response.data.skills || ""
            });

            const savedPhoto =
                response.data.profilePhoto ||
                student.profilePhoto;

            if (savedPhoto) {

                setProfilePhoto(
                    `http://localhost:8080/api/student/photo/${encodeURIComponent(
                        savedPhoto
                    )}`
                );
            }

            setShowEdit(false);

        } catch (error) {

            console.error(
                "Error saving profile:",
                error
            );
        }
    };

    const logout = () => {

        localStorage.removeItem("token");

        window.location.href = "/";
    };

    if (loading) {

        return (
            <div className="loading">
                Loading student profile...
            </div>
        );
    }

    return (
        <>
            <Headers />

            <div className="profile-card">

                <div className="profile-header">

                    <div className="photo-container">

                        <img
                            src={
                                profilePhoto ||
                                "/student-photo.jpg"
                            }
                            alt={
                                student.name ||
                                "Student"
                            }
                            className="student-photo"
                            onError={(event) => {
                                event.currentTarget.src =
                                    "/student-photo.jpg";
                            }}
                        />

                        <label className="change-photo">

                            ✏️ Change Photo

                            <input
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleProfilePhoto
                                }
                                hidden
                            />

                        </label>

                    </div>

                    <div>

                        <h2>
                            Welcome, {student.name} 👋
                        </h2>

                    </div>

                </div>

                <div className="profile-details">

                    <p>
                        <strong>Name:</strong>{" "}
                        {student.name ||
                            "Not available"}
                    </p>

                    <p>
                        <strong>Roll No:</strong>{" "}
                        {student.rollNo ||
                            "Not added"}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {student.email ||
                            "Not available"}
                    </p>

                    <p>
                        <strong>Phone:</strong>{" "}
                        {student.phone ||
                            "Not added"}
                    </p>

                    <p>
                        <strong>Branch:</strong>{" "}
                        {student.branch ||
                            "Not added"}
                    </p>

                    <p>
                        <strong>CGPA:</strong>{" "}
                        {student.cgpa ||
                            "Not added"}
                    </p>

                    <p>
                        <strong>Skills:</strong>{" "}
                        {student.skills ||
                            "Not added"}
                    </p>

                </div>

                <div className="resume-section">

                    <h3>
                        Resume
                    </h3>

                    {student.resume ? (

                        <p className="resume-name">
                            📄 {student.resume} ✅
                        </p>

                    ) : (

                        <p className="no-resume">
                            Resume not uploaded ❌
                        </p>

                    )}

                    <div className="resume-buttons">

                        <label className="upload-btn">

                            📤{" "}
                            {student.resume
                                ? "Replace Resume"
                                : "Upload Resume"
                            }

                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={
                                    handleResume
                                }
                                hidden
                            />

                        </label>

                        {student.resume && (

                            <button
                                type="button"
                                className="view-resume-btn"
                                onClick={viewResume}
                            >
                                👁 View Resume
                            </button>

                        )}

                    </div>

                </div>

                <div className="profile-buttons">

                    <button
                        className="edit-btn"
                        onClick={openEdit}
                    >
                        ✏️ Edit Details
                    </button>

                </div>

            </div>

            <div className="placement-section">

                <h2>
                    Placement
                </h2>

                <div className="placement-buttons">

                    <button
                        className="placement-btn jobs-btn"
                        onClick={() =>
                            navigate("/viewjobs")
                        }
                    >

                        <span>
                            💼
                        </span>

                        <strong>
                            VIEW JOBS
                        </strong>

                        <small>
                            Find available jobs
                        </small>

                    </button>

                    <button
                        className="placement-btn application-btn"
                        onClick={() =>
                            navigate("/application")
                        }
                    >

                        <span>
                            📋
                        </span>

                        <strong>
                            APPLICATIONS
                        </strong>

                        <small>
                            Track your applications
                        </small>

                    </button>

                </div>

            </div>

            {showEdit && (

                <div className="popup-overlay">

                    <div className="edit-popup">

                        <div className="popup-header">

                            <h2>
                                Edit Details
                            </h2>

                            <button
                                className="close-btn"
                                onClick={closeEdit}
                            >
                                ✕
                            </button>

                        </div>

                        <div className="edit-form">

                            <div className="form-group">

                                <label>
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        student.name || ""
                                    }
                                    disabled
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Roll No
                                </label>

                                <input
                                    type="text"
                                    name="rollNo"
                                    value={
                                        formData.rollNo
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={
                                        student.email || ""
                                    }
                                    disabled
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Phone
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Branch
                                </label>

                                <input
                                    type="text"
                                    name="branch"
                                    value={
                                        formData.branch
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    CGPA
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    name="cgpa"
                                    value={
                                        formData.cgpa
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                            <div className="form-group full-width">

                                <label>
                                    Skills
                                </label>

                                <input
                                    type="text"
                                    name="skills"
                                    value={
                                        formData.skills
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Java, Python, React, SQL"
                                />

                            </div>

                        </div>

                        <div className="popup-footer">

                            <button
                                className="cancel-btn"
                                onClick={closeEdit}
                            >
                                Cancel
                            </button>

                            <button
                                className="save-btn"
                                onClick={saveDetails}
                            >
                                Save Changes
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}

export default StudentDashboard;