import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/client/ProjectWorking.css";
import axios from "axios";

const WorkingProject = () => {
  const { id } = useParams(); // projectId from route
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:6001/fetch-project/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch project details:", err);
    }
  };

  const handleApproveSubmission = async () => {
    try {
      await axios.get(`http://localhost:6001/approve-submission/${id}`);
      alert("✅ Submission approved");
      fetchProjectDetails(); // refresh
    } catch (err) {
      console.error(err);
      alert("❌ Approval failed");
    }
  };

  const handleRejectSubmission = async () => {
    try {
      await axios.get(`http://localhost:6001/reject_submission/${id}`);
      alert("🚫 Submission rejected");
      fetchProjectDetails();
    } catch (err) {
      console.error(err);
      alert("❌ Rejection failed");
    }
  };

  if (!project) return <p>Loading project...</p>;

  return (
    <div className="working-project-page">
      <h2>{project.title}</h2>
      <p>
        <strong>Description:</strong> {project.description}
      </p>
      <p>
        <strong>Status:</strong> {project.status}
      </p>
      <p>
        <strong>Freelancer:</strong> {project.freelancerName}
      </p>
      <p>
        <strong>Budget:</strong> ₹{project.budget}
      </p>

      {project.submission ? (
        <>
          <h4 className="mt-4">📤 Submitted Work</h4>
          <p>
            <strong>Description:</strong> {project.submissionDescription}
          </p>
          <p>
            <strong>Project Link:</strong>{" "}
            <a href={project.projectlink} target="_blank" rel="noreferrer">
              {project.projectlink}
            </a>
          </p>
          <p>
            <strong>Manual:</strong>{" "}
            <a href={project.manuallink} target="_blank" rel="noreferrer">
              {project.manuallink}
            </a>
          </p>

          {!project.submissionAccepted ? (
            <div className="mt-3">
              <button
                className="btn btn-success me-3"
                onClick={handleApproveSubmission}
              >
                ✅ Approve Submission
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRejectSubmission}
              >
                ❌ Reject Submission
              </button>
            </div>
          ) : (
            <p className="text-success mt-3">✔️ Submission Approved</p>
          )}
        </>
      ) : (
        <p className="mt-4">🚧 No submission yet.</p>
      )}
    </div>
  );
};

export default WorkingProject;
