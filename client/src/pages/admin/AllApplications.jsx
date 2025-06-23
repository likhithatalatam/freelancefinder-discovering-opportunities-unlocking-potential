import React, { useEffect, useState } from "react";
import "../../styles/admin/allApplications.css";
import axios from "axios";

const AllApplications = () => {
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

  return (
    <div className="user-applications-page">
      <h3>All Applications</h3>

      <div className="user-applications-body">
        {applications.map((application, index) => (
          <div className="user-application" key={index}>
            <div className="user-application-body">
              {/* LEFT SIDE */}
              <div className="user-application-half">
                <h4>{application.title}</h4>
                <p>{application.description}</p>

                <span>
                  <h5>Skills</h5>
                  <div className="application-skills">
                    {(application.requiredSkills || []).map((skill, i) => (
                      <p key={i}>{skill}</p>
                    ))}
                  </div>
                </span>

                <h6>Budget: ₹ {application.budget}</h6>
                <h5>
                  <b>Client:</b> {application.clientName}
                </h5>
                <h5>
                  <b>Client ID:</b> {application.clientId}
                </h5>
                <h5>
                  <b>Client Email:</b> {application.clientEmail}
                </h5>
              </div>

              <div className="vertical-line"></div>

              {/* RIGHT SIDE */}
              <div className="user-application-half">
                <span>
                  <h5>Proposal</h5>
                  <p>{application.proposal}</p>
                </span>

                <span>
                  <h5>Skills</h5>
                  <div className="application-skills">
                    {(application.freelancerSkills || []).map((skill, i) => (
                      <p key={i}>{skill}</p>
                    ))}
                  </div>
                </span>

                <h6>Bid Amount: ₹ {application.bidAmount}</h6>
                <h5>
                  <b>Freelancer:</b> {application.freelancerName}
                </h5>
                <h5>
                  <b>Freelancer ID:</b> {application.freelancerId}
                </h5>
                <h5>
                  <b>Freelancer Email:</b> {application.freelancerEmail}
                </h5>

                <h6>
                  Status:{" "}
                  <b
                    style={{
                      color:
                        application.status === "Accepted" ? "green" : "red",
                    }}
                  >
                    {application.status}
                  </b>
                </h6>
              </div>
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllApplications;
