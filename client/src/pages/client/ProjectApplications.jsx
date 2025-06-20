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
      alert("Application approved");
      fetchApplications();
    } catch (err) {
      alert("Operation failed!");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.get(`http://localhost:6001/reject-application/${id}`);
      alert("Application rejected");
      fetchApplications();
    } catch (err) {
      alert("Operation failed!");
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
            <div className="client-application-half">
              <p>
                <strong>Title:</strong> {application.title}
              </p>
              <p>
                <strong>Name:</strong> {application.name}
              </p>
              <p>
                <strong>Email:</strong> {application.email}
              </p>
              <p>
                <strong>Phone:</strong> {application.phone}
              </p>
              <p>
                <strong>Address:</strong> {application.address}
              </p>
              <h6>
                <strong>Budget:</strong> ₹{application.budget}
              </h6>
            </div>

            <div className="vertical-line"></div>

            <div className="client-application-half">
              <span>
                <h5>Proposal</h5>
                <p>{application.proposal}</p>
              </span>

              <span>
                <h5>Skills</h5>
                <div className="application-skills">
                  {application.freelancerSkills?.map((skill, i) => (
                    <p key={i}>{skill}</p>
                  ))}
                </div>
              </span>

              <h6>Proposed Budget: ₹{application.bidAmount}</h6>

              <div className="approve-btns">
                {application.status === "Pending" ? (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(application._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(application._id)}
                    >
                      Decline
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
