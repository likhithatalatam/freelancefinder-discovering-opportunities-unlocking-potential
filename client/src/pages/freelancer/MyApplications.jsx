import React, { useEffect, useState } from "react";
import "../../styles/freelancer/MyApplications.css";
import axios from "axios";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:6001/fetch-applications"
      );
      setApplications(response.data.reverse());
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const userId = localStorage.getItem("userId");

  const filteredApplications = applications.filter(
    (application) => application.freelancerId === userId
  );

  return (
    <div className="user-applications-page">
      <h3>My Applications</h3>
      <div className="user-applications-body">
        {filteredApplications.map((application) => (
          <div className="user-application" key={application._id}>
            <div className="user-application-body">
              <div className="user-application-half">
                <h4>{application.title}</h4>
                <p>{application.description}</p>
                <span>
                  <h5>Required Skills</h5>
                  <div className="application-skills">
                    {application.requiredSkills?.map((skill) => (
                      <p key={skill}>{skill}</p>
                    ))}
                  </div>
                </span>
                <h6>Project Budget - ₹ {application.budget}</h6>
              </div>
              <div className="user-application-half">
                <span>
                  <h5>Your Proposal</h5>
                  <p>{application.proposal}</p>
                </span>
                <span>
                  <h5>Your Skills</h5>
                  <div className="application-skills">
                    {(application.freelancerSkills || []).map((skill) => (
                      <p key={skill}>{skill}</p>
                    ))}
                  </div>
                </span>
                <span>
                  <h6>Bid Amount - ₹ {application.bidAmount}</h6>
                  <h6>
                    Status: <b>{application.status}</b>
                  </h6>
                </span>
                <hr />
              </div>
            </div>
          </div>
        ))}
        {filteredApplications.length === 0 && (
          <p className="text-center">No applications found.</p>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
