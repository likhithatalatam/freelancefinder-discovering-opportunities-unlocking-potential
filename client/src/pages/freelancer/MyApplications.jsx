import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/freelancer/MyApplications.css";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:6001/fetch-applications");
      const myApps = res.data.filter((app) => app.freelancerId === userId);
      setApplications(myApps.reverse());
    } catch (err) {
      console.error("Error fetching applications", err);
    }
  };

  return (
    <div className="applications-page">
      <h3>My Applications</h3>
      <div className="applications-list">
        {applications.map((app) => (
          <div className="application-card" key={app._id}>
            <div className="application-left">
              <h3>{app.title}</h3>
              <p>{app.description}</p>
              <div className="skills">
                <strong>Skills</strong>
                <br />
                <div className="skill-badges">
                  {app.requiredSkills.map((skill, i) => (
                    <span key={i} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <p>
                <strong>Budget:</strong> ₹{app.budget}
              </p>
            </div>
            <div className="application-right">
              <h4>Proposal</h4>
              <p>{app.proposal}</p>
              <div className="skills">
                <strong>Skills</strong>
                <br />
                <div className="skill-badges">
                  {app.freelancerSkills.map((skill, i) => (
                    <span key={i} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {/* <p>
                <strong>Estimated Time:</strong> {app.estimatedTime}
              </p> */}
              <p>
                <strong>Proposed Budget:</strong> ₹{app.bidAmount}
              </p>
              <p>
                <strong>Status:</strong> {app.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;
