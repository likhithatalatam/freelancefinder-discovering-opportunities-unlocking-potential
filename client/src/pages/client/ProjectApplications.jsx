import React, { useEffect, useState } from "react";
import "../../styles/client/ClientApplications.css";
import axios from "axios";

const ProjectApplications = () => {
  const [applications, setApplications] = useState([]);
  const [displayApplications, setDisplayApplications] = useState([]);
  const [projectTitles, setProjectTitles] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:6001/fetch-applications"
      );
      const clientId = localStorage.getItem("userId");

      const clientApps = response.data.filter(
        (app) => app.clientId === clientId
      );
      setApplications(clientApps);
      setDisplayApplications([...clientApps].reverse());

      const titles = [...new Set(clientApps.map((app) => app.title))];
      setProjectTitles(titles);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.get(`http://localhost:6001/approve-application/${id}`);
      alert("✅ Application approved");
      fetchApplications();
    } catch (err) {
      alert("❌ Operation failed!");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.get(`http://localhost:6001/reject-application/${id}`);
      alert("❌ Application rejected");
      fetchApplications();
    } catch (err) {
      alert("❌ Operation failed!");
    }
  };

  const handleFilterChange = (value) => {
    setProjectFilter(value);
    if (value === "") {
      setDisplayApplications([...applications].reverse());
    } else {
      const filtered = applications.filter((app) => app.title === value);
      setDisplayApplications([...filtered].reverse());
    }
  };

  return (
    <div className="client-applications-page">
      {projectTitles.length > 0 && (
        <div className="application-filter">
          <h3>Applications</h3>
          <select
            className="form-control"
            value={projectFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">All Projects</option>
            {projectTitles.map((title, idx) => (
              <option key={idx} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      )}

      {displayApplications.length > 0 ? (
        displayApplications.map((application, idx) => (
          <div className="application-card" key={idx}>
            {/* Left Side: Project Details */}
            <div className="client-application-half">
              <h5>{application.title}</h5>
              <p>
                <strong>Description:</strong> {application.description}
              </p>
              <p>
                <strong>Status:</strong> {application.status}
              </p>
              <p>
                <strong>Budget:</strong> ₹{application.budget}
              </p>
              <p>
                <strong>Required Skills:</strong>
              </p>
              <ul>
                {application.requiredSkills?.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>

            <div className="vertical-line"></div>

            {/* Right Side: Freelancer Proposal */}
            <div className="client-application-half">
              <h5>Proposal by {application.freelancerName}</h5>
              <p>
                <strong>Email:</strong> {application.freelancerEmail}
              </p>
              <p>
                <strong>Estimated Time:</strong> {application.estimatedTime}
              </p>
              <p>
                <strong>Proposal:</strong> {application.proposal}
              </p>
              <h6>
                <strong>Bid Amount:</strong> ₹{application.bidAmount}
              </h6>
              <p>
                <strong>Skills:</strong>
              </p>
              <div className="application-skills">
                {application.freelancerSkills?.map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="approve-btns mt-2">
                {application.status === "Pending" ? (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(application._id)}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-danger ms-2"
                      onClick={() => handleReject(application._id)}
                    >
                      ❌ Reject
                    </button>
                  </>
                ) : (
                  <h6>
                    Status: <b>{application.status}</b>
                  </h6>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No applications found</p>
      )}
    </div>
  );
};

export default ProjectApplications;
