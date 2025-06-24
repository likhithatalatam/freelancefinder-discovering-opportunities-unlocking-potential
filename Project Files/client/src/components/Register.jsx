import React, { useContext } from "react";
import { GeneralContext } from "../context/GeneralContext";

const Register = ({ setAuthType }) => {
  const { setUsername, setEmail, setPassword, setUsertype, register } =
    useContext(GeneralContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register();
    } catch (err) {
      console.error("Registration failed:", err.message);
    }
  };

  return (
    <form className="authForm" onSubmit={handleRegister}>
      <h2>Register</h2>

      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control"
          id="floatingUsername"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="floatingUsername">Username</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="floatingEmail"
          placeholder="name@example.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingEmail">Email address</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="floatingPassword"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>

      <div className="mb-3">
        <select
          className="form-select"
          onChange={(e) => setUsertype(e.target.value)}
          required
        >
          <option value="">Select user type</option>
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary w-100 mb-2">
        Sign up
      </button>

      <p className="text-center">
        Already registered?{" "}
        <span
          style={{ cursor: "pointer", color: "#0d6efd" }}
          onClick={() => setAuthType("login")}
        >
          Login
        </span>
      </p>
    </form>
  );
};

export default Register;
