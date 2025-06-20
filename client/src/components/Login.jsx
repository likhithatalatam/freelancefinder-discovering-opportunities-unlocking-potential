import React, { useContext } from "react";
import { GeneralContext } from "../context/GeneralContext";

const Login = ({ setAuthType }) => {
  const { setEmail, setPassword, login } = useContext(GeneralContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login();
    } catch (err) {
      console.error("❌ Login failed:", err.message);
    }
  };

  return (
    <form className="authForm" onSubmit={handleLogin}>
      <h2>Login</h2>

      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="floatingInput"
          placeholder="name@example.com"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingInput">Email address</label>
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

      <button type="submit" className="btn btn-primary w-100 mb-2">
        Sign in
      </button>

      <p className="text-center">
        Not registered?{" "}
        <span
          style={{ cursor: "pointer", color: "#0d6efd" }}
          onClick={() => setAuthType("register")}
        >
          Register
        </span>
      </p>
    </form>
  );
};

export default Login;
