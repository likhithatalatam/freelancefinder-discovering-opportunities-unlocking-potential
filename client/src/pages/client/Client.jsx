import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/client/client.css";
import { useNavigate } from "react-router-dom";

const Client = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [displayProjects, setDisplayProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:6001/fetch-projects");
      const clientId = localStorage.getItem("userId");
      const filtered = response.data.filter((pro) => pro.clientId === clientId);
      setProjects(filtered);
      setDisplayProjects([...filtered].reverse());
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedProject(value);
    if (value === "") {
      setDisplayProjects([...projects].reverse());
    } else {
      const filtered = projects.filter((project) => project.status === value);
      setDisplayProjects([...filtered].reverse());
    }
  };

  return (
    <div className="client-projects-page">
      <div className="client-projects-list">
        <div className="head">
          <label htmlFor="projectStatus" className="status">
            My projects
          </label>
          <select
            id="projectStatus"
            onChange={handleFilterChange}
            value={selectedProject}
          >
            <option value="">All</option>
            <option value="Completed">Completed</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
          </select>
        </div>
        {/* ✅ Moved inside client-projects-list */}
        <div className="projects-list">
          {displayProjects.length > 0 ? (
            displayProjects.map((project) => (
              <div
                className="project-card"
                key={project._id}
                onClick={() => navigate(`/client/projects/${project._id}`)}
              >
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <p>Budget: ₹{project.budget}</p>
                <p>Status: {project.status}</p>
              </div>
            ))
          ) : (
            <p>No projects found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Client;
