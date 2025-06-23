import React, { createContext, useState } from "react";

import socketIoClient from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export const GeneralContext = createContext();

const GeneralContextProvider = ({ children }) => {
  const WS = "http://localhost:6001";
  const socket = socketIoClient(WS);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("");
  const login = async () => {
    try {
      const loginInputs = { email, password };
      await axios
        .post("http://localhost:6001/login", loginInputs)
        .then((res) => {
          localStorage.setItem("userId", res.data._id);
          localStorage.setItem("usertype", res.data.usertype);
          localStorage.setItem("username", res.data.username);
          localStorage.setItem("email", res.data.email);

          if (res.data.usertype === "freelancer") {
            navigate("/freelancer");
          } else if (res.data.usertype === "client") {
            navigate("/client");
          } else if (res.data.usertype === "admin") {
            navigate("/admin");
          }
        })
        .catch((err) => {
          alert("Login failed!");
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };
  const register = async () => {
    const inputs = { username, email, password, usertype };
    try {
      await axios
        .post("http://localhost:6001/register", inputs)
        .then((res) => {
          localStorage.setItem("userId", res.data._id);
          localStorage.setItem("usertype", res.data.usertype);
          localStorage.setItem("username", res.data.username);
          localStorage.setItem("email", res.data.email);

          if (res.data.usertype === "freelancer") {
            navigate("/freelancer");
          } else if (res.data.usertype === "client") {
            navigate("/client");
          } else if (res.data.usertype === "admin") {
            navigate("/admin");
          }
        })
        .catch((err) => {
          alert("Registration failed!");
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  };
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };
  return (
    <GeneralContext.Provider
      value={{
        socket,
        login,
        register,
        logout,
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        usertype,
        setUsertype,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;
