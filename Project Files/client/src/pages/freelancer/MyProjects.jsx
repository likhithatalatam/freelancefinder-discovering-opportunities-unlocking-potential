import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/freelancer/MyProjects.css";

const MyProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [displayProjects, setDisplayProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:6001/fetch-projects");
      const userId = localStorage.getItem("userId");
      const userProjects = response.data.filter(
        (pro) => pro.freelancerId === userId
      );

      setProjects(userProjects);
      setDisplayProjects([...userProjects].reverse());
    } catch (err) {
      console.error(err);
      setError("Failed to fetch projects. Please try again.");
    }
  };

  const handleFilterChange = (value) => {
    if (!value) {
      setDisplayProjects([...projects].reverse());
    } else if (value === "In Progress") {
      setDisplayProjects(
        projects.filter((p) => p.status?.toLowerCase() === "assigned").reverse()
      );
    } else if (value === "Completed") {
      setDisplayProjects(
        projects
          .filter((p) => p.status?.toLowerCase() === "completed")
          .reverse()
      );
    } else {
      setError("Invalid project status selected.");
    }
  };

  return (
    <div className="client-projects-page">
      <div className="client-projects-list">
        <div className="project-head">
          <div className="client-projects-header">My Projects</div>

          <select
            className="form-control my-2"
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">Choose project status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <hr />

        <div className="projects-display">
          {error ? (
            <p className="error-text">{error}</p>
          ) : displayProjects.length > 0 ? (
            displayProjects.map((project) => (
              <div
                className="listed-project"
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <div className="listed-project-head">
                  <h3>{project.title}</h3>
                  <p>{new Date(project.postedDate).toLocaleString()}</p>
                </div>
                <h5>Status: {project.status}</h5>
                <h5>Budget: ₹ {project.budget}</h5>
                <p>{project.description}</p>
                <div className="skills">
                  {project.skills?.map((skill) => (
                    <h6 key={skill}>{skill}</h6>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-projects-box">
              <p>No projects found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
