import { useState } from "react";
import './Application.css'

export function Filter({
                           selectedFilter,
                           setSelectedFilter,
                           setShowFilter
                       }) {

    const filters = [
        "All",
        "Applied",
        "Shortlisted",
        "Rejected"
    ];

    const handleRemove = () => {
        setSelectedFilter("");
    };

    const handleSave = () => {
        setShowFilter(false);
    };

    return (
        <div className="filter-box">

            <div className="filter-header">

                <h3>Filter Applications</h3>

                <button
                    className="filter-close"
                    onClick={() => setShowFilter(false)}
                >
                    ×
                </button>

            </div>


            <div className="filter-options">

                {filters.map((filter) => (

                    <div
                        key={filter}
                        className={`filter-option ${
                            selectedFilter === filter
                                ? "selected"
                                : ""
                        }`}
                        onClick={() => setSelectedFilter(filter)}
                    >

                        <span>{filter}</span>

                        {selectedFilter === filter && (
                            <button
                                className="filter-remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove();
                                }}
                            >
                                ×
                            </button>
                        )}

                    </div>

                ))}

            </div>


            <button
                className="filter-save"
                onClick={handleSave}
            >
                Save
            </button>

        </div>
    );
}