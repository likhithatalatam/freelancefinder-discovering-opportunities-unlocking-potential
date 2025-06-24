import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/client/newproject.css";

const NewProject = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientId = localStorage.getItem("userId");
    const clientName = localStorage.getItem("username");
    const clientEmail = localStorage.getItem("email");

    if (!title || !description || !budget || !skills) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:6001/new-project", {
        title,
        description,
        budget,
        skills: skills.split(",").map((s) => s.trim()),
        clientId,
        clientName,
        clientEmail,
      });

      alert("Project created successfully!");
      navigate("/client", { state: { refresh: Date.now() } });
    } catch (err) {
      console.error("Error creating project", err);
      alert("Failed to create project.");
    }
  };

  return (
    <div className="new-project-page">
      <h3>Post New Project</h3>
      <form className="new-project-form" onSubmit={handleSubmit}>
        <label>Project title</label>
        <input
          className="form-control"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Description</label>
        <textarea
          className="form-control"
          rows="5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="row-fields">
          <div className="form-group">
            <label>Budget (in ₹)</label>
            <input
              type="number"
              className="form-control"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter project budget"
            />
          </div>

          <div className="form-group">
            <label>Required Skills (comma separated)</label>
            <input
              type="text"
              className="form-control"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, Node.js"
            />
          </div>
        </div>

        <button className="btn btn-primary mt-3" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default NewProject;
