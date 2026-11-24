import "./Application.css";

export function Filter({ selectedFilter, setSelectedFilter, setShowFilter }) {
    const filters = ["All", "Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Interviewed", "Selected", "Rejected"];

    return (
        <div className="filter-box" id="application-filter-panel" role="dialog" aria-label="Filter applications">
            <div className="filter-header">
                <div><h3>Filter applications</h3><p>Choose an application status</p></div>
                <button type="button" className="filter-close" aria-label="Close filters" onClick={() => setShowFilter(false)}>×</button>
            </div>
            <div className="filter-options" role="group" aria-label="Application status">
                {filters.map((filter) => (
                    <button
                        type="button"
                        key={filter}
                        className={`filter-option${selectedFilter === filter ? " selected" : ""}`}
                        aria-pressed={selectedFilter === filter}
                        onClick={() => setSelectedFilter(filter)}
                    >
                        <span>{filter === "All" ? "All statuses" : filter}</span>
                        <span className="filter-radio" aria-hidden="true">{selectedFilter === filter ? "✓" : ""}</span>
                    </button>
                ))}
            </div>
            <div className="filter-footer">
                <button type="button" className="filter-clear" onClick={() => setSelectedFilter("All")}>Clear</button>
                <button type="button" className="filter-save" onClick={() => setShowFilter(false)}>Show results</button>
            </div>
        </div>
    );
}
