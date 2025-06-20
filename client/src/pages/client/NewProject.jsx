import React, { useState } from "react";
import axios from "axios";
import "../../styles/client/newproject.css";
import { useNavigate } from "react-router-dom";

const NewProject = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:6001/new-project", {
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        skills: skills.split(",").map((skill) => skill.trim()),
        clientId: localStorage.getItem("userId"),
      });

      if (response.data.message === "Project added") {
        alert("Project added successfully");
        navigate("/client");
      } else {
        alert("Project creation failed");
      }
    } catch (err) {
      console.error("Error submitting project:", err);
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="new-project-page">
      <div className="new-project-form">
        <h2>Post New Project</h2>

        <div className="form-control">
          <label htmlFor="title">Project Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter project title"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="description">Project Description</label>
          <input
            type="text"
            id="description"
            placeholder="Enter project description"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="budget">Project Budget</label>
          <input
            type="number"
            id="budget"
            placeholder="Enter budget"
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="skills">Required Skills</label>
          <input
            type="text"
            id="skills"
            placeholder="e.g., React, Node.js, MongoDB"
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        <p>* Separate each skill with a comma (e.g., HTML, CSS, JS)</p>

        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default NewProject;
