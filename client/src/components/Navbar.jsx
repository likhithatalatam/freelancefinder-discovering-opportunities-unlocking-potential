import React, { useContext } from "react";
import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";
import { GeneralContext } from "../context/GeneralContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(GeneralContext) || {};
  const usertype = localStorage.getItem("usertype");

  if (!usertype) {
    return null; // No navbar if not logged in
  }

  return (
    <div className="navbar">
      <h3>SB Works{usertype === "admin" && " (Admin)"}</h3>
      <div className="nav-options">
        {usertype === "freelancer" && (
          <>
            <p onClick={() => navigate("/freelancer")}>Dashboard</p>
            <p onClick={() => navigate("/all-projects")}>All Projects</p>
            <p onClick={() => navigate("/my-projects")}>My Projects</p>
            <p onClick={() => navigate("/my-applications")}>Applications</p>
          </>
        )}
        {usertype === "client" && (
          <>
            <p onClick={() => navigate("/client")}>Dashboard</p>
            <p onClick={() => navigate("/new-project")}>New Project</p>
            <p onClick={() => navigate("/project-applications")}>
              Applications
            </p>
          </>
        )}
        {usertype === "admin" && (
          <>
            <p onClick={() => navigate("/admin")}>Home</p>
            <p onClick={() => navigate("/all-users")}>All Users</p>
            <p onClick={() => navigate("/admin-projects")}>Projects</p>
            <p onClick={() => navigate("/admin-applications")}>Applications</p>
          </>
        )}
        <p onClick={logout}>Logout</p>
      </div>
    </div>
  );
};

export default Navbar;
