import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/freelancer/AllProjects.css";

const AdminProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [displayProjects, setDisplayProjects] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:6001/fetch-projects");
      const projectList = response.data;

      setProjects(projectList);
      setDisplayProjects([...projectList].reverse());

      // Extract all unique skills
      const skillsSet = new Set();
      projectList.forEach((project) => {
        project.skills?.forEach((skill) => skillsSet.add(skill));
      });
      setAllSkills(Array.from(skillsSet));
    } catch (err) {
      console.log("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCategoryCheckBox = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setCategoryFilter([...categoryFilter, value]);
    } else {
      setCategoryFilter(categoryFilter.filter((s) => s !== value));
    }
  };

  useEffect(() => {
    if (categoryFilter.length > 0) {
      const filtered = projects.filter((project) =>
        categoryFilter.every((skill) => project.skills?.includes(skill))
      );
      setDisplayProjects([...filtered].reverse());
    } else {
      setDisplayProjects([...projects].reverse());
    }
  }, [categoryFilter, projects]);

  return (
    <div className="all-projects-page">
      <div className="project-filters">
        <h3>Filters</h3>
        <hr />
        <div className="filters">
          <h5>Skills</h5>
          {allSkills.length > 0 ? (
            <div className="filter-options">
              {allSkills.map((skill) => (
                <div className="form-check" key={skill}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={skill}
                    id={`skill-${skill}`}
                    onChange={handleCategoryCheckBox}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`skill-${skill}`}
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p>No skills available</p>
          )}
        </div>
      </div>
      <div className="admin">
        <div className="projects-list">
          <h3>All Projects</h3>
          <hr />
          {displayProjects.map((project) => (
            <div className="listed-project" key={project._id}>
              <div className="listed-project-head">
                <h3>{project.title}</h3>
                <p>
                  {new Date(project.postedDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <h5>Budget ₹ {project.budget}</h5>
              <h5>Client Name: {project.clientName}</h5>
              <h5>Client Email: {project.clientEmail}</h5>
              <p>{project.description}</p>
              <div className="skills">
                {project.skills?.map((skill) => (
                  <h6 key={skill}>{skill}</h6>
                ))}
              </div>
              <h5>Budget: ₹ {project.budget}</h5>
              <h5 className="last">Status: {project.status}</h5>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
