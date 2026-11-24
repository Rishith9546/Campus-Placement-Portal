import axios from "axios";

const API = "http://localhost:8080/api";

export async function scheduleInterviewInvite(applicationId, candidateName) {
  const input = window.prompt(
    `Enter the interview meeting link for ${candidateName || "this applicant"}. The link will be emailed to the applicant.`
  );
  if (input === null) return false;

  const interviewLink = input.trim();
  if (!interviewLink) {
    throw new Error("An interview meeting link is required.");
  }

  await axios.post(`${API}/recruiter/pipeline/applications/${applicationId}/schedule-interview`,
    { interviewLink },
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
  return true;
}
