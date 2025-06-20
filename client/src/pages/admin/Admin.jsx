import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/admin/admin.css";

const Admin = () => {
  const navigate = useNavigate();

  const [projectsCount, setProjectsCount] = useState(0);
  const [completedProsCount, setCompletedProsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    fetchProjects();
    fetchApplications();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:6001/fetch-projects");
      const allProjects = res.data;
      setProjectsCount(allProjects.length);
      const completed = allProjects.filter((pro) => pro.status === "Completed");
      setCompletedProsCount(completed.length);
    } catch (err) {
      console.error("❌ Failed to fetch projects:", err.message);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:6001/fetch-applications");
      setApplicationsCount(res.data.length);
    } catch (err) {
      console.error("❌ Failed to fetch applications:", err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:6001/fetch-users");
      setUsersCount(res.data.length);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err.message);
    }
  };

  return (
    <div className="admin-home-page">
      <div className="admin-home-cards">
        <div className="admin-home-card">
          <h5>Projects</h5>
          <h6>{projectsCount}</h6>
        </div>
        <div className="admin-home-card">
          <h5>Completed Projects</h5>
          <h6>{completedProsCount}</h6>
        </div>
        <div className="admin-home-card">
          <h5>Applications</h5>
          <h6>{applicationsCount}</h6>
        </div>
        <div className="admin-home-card">
          <h5>Users</h5>
          <h6>{usersCount}</h6>
        </div>
      </div>
    </div>
  );
};

export default Admin;
