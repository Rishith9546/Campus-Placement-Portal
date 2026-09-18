import { useState } from "react";

export function ViewProfile({ selectedApplicant, setSelectedApplicant }) {

    return (
        <>
            {selectedApplicant && (

                <div
                    className="profile-popup-overlay"
                    onClick={() => {
                        setSelectedApplicant(null);
                    }}
                >

                    <div
                        className="profile-popup"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >

                        <button
                            className="profile-popup-close"
                            onClick={() => {
                                setSelectedApplicant(null);
                            }}
                        >
                            ×
                        </button>


                        {selectedApplicant.student.profilePhoto ? (

                            <img
                                className="profile-popup-photo"
                                src={`http://localhost:8080/api/student/photo/${encodeURIComponent(
                                    selectedApplicant.student.profilePhoto
                                )}`}
                                alt={selectedApplicant.student.name}
                            />

                        ) : (

                            <div className="profile-popup-no-photo">
                                No Photo
                            </div>

                        )}


                        <h2>
                            Student Profile
                        </h2>


                        <div className="profile-popup-details">

                            <p>
                                <strong>Name:</strong>{" "}
                                {selectedApplicant.student.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedApplicant.student.email}
                            </p>

                            <p>
                                <strong>Phone:</strong>{" "}
                                {selectedApplicant.student.phone}
                            </p>

                            <p>
                                <strong>Branch:</strong>{" "}
                                {selectedApplicant.student.branch}
                            </p>

                            <p>
                                <strong>CGPA:</strong>{" "}
                                {selectedApplicant.student.cgpa}
                            </p>

                            <p>
                                <strong>Skills:</strong>{" "}
                                {selectedApplicant.job.skills}
                            </p>

                            <p>
                                <strong>Applied On:</strong>{" "}
                                {new Date(
                                    selectedApplicant.appliedAt
                                ).toLocaleDateString("en-GB")}
                            </p>

                        </div>


                        <button
                            className="close-profile-button"
                            onClick={() => {
                                setSelectedApplicant(null);
                            }}
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}
        </>
    );
}