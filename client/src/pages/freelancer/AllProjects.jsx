import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/freelancer/AllProjects.css";

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const skills = [
    "Data Science",
    "ML",
    "AI",
    "Deep Learning",
    "Python",
    "Javascript",
    "Django",
    "HTML",
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:6001/fetch-projects");
      const filtered = response.data.filter(
        (proj) => proj.status === "Available" || proj.freelancerId === userId
      );
      setProjects(filtered.reverse());
      setFilteredProjects(filtered.reverse());
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    filterProjects(query, selectedSkills);
  };

  const handleSkillFilter = (skill) => {
    const updatedSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updatedSkills);
    filterProjects(search, updatedSkills);
  };

  const filterProjects = (query, skills) => {
    let result = [...projects];
    if (query) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }
    if (skills.length > 0) {
      result = result.filter((p) =>
        skills.every((skill) => p.skills.includes(skill))
      );
    }
    setFilteredProjects(result);
  };

  return (
    <div className="all-projects-container">
      <div className="left-filter-box">
        <h5>Filters</h5>
        <h6>Skills</h6>
        {skills.map((skill) => (
          <div key={skill} className="skills">
            <input
              type="checkbox"
              id={skill}
              value={skill}
              checked={selectedSkills.includes(skill)}
              onChange={() => handleSkillFilter(skill)}
            />
            <label htmlFor={skill}> {skill}</label>
          </div>
        ))}
      </div>

      <div className="projects-list-box">
        <h2 className="text-center">All Projects</h2>
        <input
          type="text"
          className="form-control my-3"
          placeholder="Search by title or description..."
          value={search}
          onChange={handleSearch}
        />

        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              className="single-project-list"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <h5 style={{ color: "steelblue" }}>{project.title}</h5>
              <p className="text-muted">
                {new Date(project.postedDate).toLocaleString()}
              </p>
              <p>{project.description}</p>
              <div className="skill-tags">
                {project.skills.map((skill) => (
                  <span key={skill} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-muted">
                <strong>Status:</strong> {project.status} |{" "}
                <strong>Budget:</strong> ₹{project.budget}
              </p>
            </div>
          ))
        ) : (
          <p>No matching projects found.</p>
        )}
      </div>
    </div>
  );
};

export default AllProjects;
