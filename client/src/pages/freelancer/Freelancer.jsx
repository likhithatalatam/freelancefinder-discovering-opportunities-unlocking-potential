import React, { useEffect, useState } from "react";
import "../../styles/freelancer/freelancer.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Freelancer = () => {
  const navigate = useNavigate();

  const [freelancerData, setFreelancerData] = useState({});
  const [skills, setSkills] = useState([]);
  const [description, setDescription] = useState("");
  const [freelancerId, setFreelancerId] = useState("");
  const [updateSkills, setUpdateSkills] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [isDataUpdateOpen, setIsDataUpdateOpen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserData(userId);
      fetchApplications(userId);
    }
  }, []);

  const fetchUserData = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:6001/fetch-freelancer/${id}`
      );
      const data = res.data;

      setFreelancerData(data);
      setFreelancerId(data.userId);
      setSkills(data.skills || []);
      setDescription(data.description || "");
      setUpdateSkills((data.skills || []).join(", "));
      setUpdateDescription(data.description || "");
    } catch (err) {
      console.error("Error fetching freelancer data", err);
    }
  };

  const fetchApplications = async (id) => {
    try {
      const res = await axios.get("http://localhost:6001/fetch-applications");
      const filtered = res.data.filter((app) => app.freelancerId === id);
      setApplicationsCount(filtered.length);
    } catch (err) {
      console.error("Error fetching applications", err);
    }
  };

  const updateUserData = async () => {
    console.log("freelancerId before API call:", freelancerId); // ✅ Step 1: log it here

    try {
      await axios.post("http://localhost:6001/update-freelancer", {
        freelancerId,
        updateSkills,
        description: updateDescription,
      });

      await fetchUserData(freelancerId);
      setIsDataUpdateOpen(false);
      alert("Skills have been updated");
    } catch (err) {
      console.error("Error updating freelancer data", err);
      alert("Failed to update skills");
    }
  };

  return (
    <>
      {freelancerData ? (
        <div className="freelancer-home">
          <div className="home-cards">
            <div className="home-card">
              <h4>Current Projects</h4>
              <p>{freelancerData.currentProjects?.length || 0}</p>
              <button onClick={() => navigate("/my-projects")}>
                View Projects
              </button>
            </div>
            <div className="home-card">
              <h4>Completed Projects</h4>
              <p>{freelancerData.completedProjects?.length || 0}</p>
              <button onClick={() => navigate("/my-projects")}>
                View Projects
              </button>
            </div>
            <div className="home-card">
              <h4>Applications</h4>
              <p>{applicationsCount}</p>
              <button onClick={() => navigate("/my-applications")}>
                View Applications
              </button>
            </div>
            <div className="home-card">
              <h4>Funds</h4>
              <p>Available: ₹ {freelancerData.funds || 0}</p>
            </div>
          </div>

          <div className="freelancer-details">
            {!isDataUpdateOpen ? (
              <div className="freelancer-details-data">
                <span>
                  <h4>My Skills</h4>
                  <div className="skills">
                    {skills.map((skill) => (
                      <h5 className="skill" key={skill}>
                        {skill}
                      </h5>
                    ))}
                  </div>
                </span>
                <span>
                  <h4>Description</h4>
                  <p>{description}</p>
                </span>
                <button onClick={() => setIsDataUpdateOpen(true)}>
                  Update
                </button>
              </div>
            ) : (
              <div className="freelancer-details-form">
                <label>Update Skills (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={updateSkills}
                  onChange={(e) => setUpdateSkills(e.target.value)}
                />
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                />
                <div className="mt-2">
                  <button
                    className="btn btn-success me-2"
                    onClick={updateUserData}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsDataUpdateOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-center mt-5">Loading freelancer data...</p>
      )}
    </>
  );
};

export default Freelancer;
