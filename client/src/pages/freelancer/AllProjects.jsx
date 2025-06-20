import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/freelancer/AllProjects.css";

const AllProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [displayProjects, setDisplayProjects] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:6001/fetch-projects");
      const data = res.data;

      setProjects(data);
      setDisplayProjects([...data].reverse());

      const skills = [];
      data.forEach((project) => {
        project.skills?.forEach((skill) => {
          if (!skills.includes(skill)) {
            skills.push(skill);
          }
        });
      });

      setAllSkills(skills);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCategoryCheckBox = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setCategoryFilter([...categoryFilter, value]);
    } else {
      setCategoryFilter(categoryFilter.filter((skill) => skill !== value));
    }
  };

  useEffect(() => {
    if (categoryFilter.length > 0) {
      const filtered = projects.filter((project) =>
        categoryFilter.every((skill) => project.skills.includes(skill))
      );
      setDisplayProjects(filtered.reverse());
    } else {
      setDisplayProjects([...projects].reverse());
    }
  }, [categoryFilter, projects]);

  return (
    <>
      {projects.length > 0 ? (
        <div className="all-projects-page">
          <div className="projects-filterrs">
            <h3>Filters</h3>
            <hr />
            <div className="filters">
              <h5>Skills</h5>
              <div className="filters-options">
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
            </div>
          </div>

          <div className="projects-list">
            <h3>All Projects</h3>
            <hr />
            {displayProjects.map((project) => (
              <div
                className="listed-project"
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <div className="listed-project-head">
                  <h3>{project.title}</h3>
                  <p>{String(project.postedDate).slice(0, 24)}</p>
                </div>
                <h5>Budget ₹ {project.budget}</h5>
                <p>{project.description}</p>
                <div className="skills">
                  {project.skills?.map((skill) => (
                    <h6 key={skill}>{skill}</h6>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center">No projects available right now.</p>
      )}
    </>
  );
};

export default AllProjects;
