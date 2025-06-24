import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [usertype, setUsertype] = useState(localStorage.getItem("usertype"));

  useEffect(() => {
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("usertype", usertype);
  }, [userId, username, email, usertype]);

  const logout = () => {
    localStorage.clear();
    setUserId(null);
    setUsername("");
    setEmail("");
    setUsertype("");
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        username,
        setUsername,
        email,
        setEmail,
        usertype,
        setUsertype,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Add this line
export default UserProvider;
