import React, { useEffect } from "react";
import "../styles/landing.css";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("usertype"); // Make sure the key is consistent
    if (userType === "freelancer") {
      navigate("/freelancer");
    } else if (userType === "client") {
      navigate("/client");
    } else if (userType === "admin") {
      navigate("/admin");
    }
  }, [navigate]);

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="landing-nav">
          <h3>SB Works</h3>
          <button onClick={() => navigate("/authenticate")}>Sign In</button>
        </div>
        <div className="landing-hero-text">
          <h1>Empower Your Journey: Elevate Your Craft on SB Works</h1>
          <p>
            Dive into a realm of endless possibilities with SB Works. Unleash
            your creativity, skills, and passion as you embark on a freelancing
            journey like never before.
          </p>
          <button onClick={() => navigate("/authenticate")}>Join Now</button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
