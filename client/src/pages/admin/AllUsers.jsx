import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/allUsers.css";

const AllUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:6001/fetch-users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  return (
    <div className="all-users-page">
      <h3>All Users</h3>
      <div className="all-users">
        {users?.map((user) => (
          <div className="user" key={user._id}>
            <div className="user-info">
              <span>
                <b>User ID</b>
                <p>{user._id}</p>
              </span>
              <span>
                <b>Username</b>
                <p>{user.username}</p>
              </span>
              <span>
                <b>Email</b>
                <p>{user.email}</p>
              </span>
              <span>
                <b>User Role</b>
                <p>{user.usertype}</p>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
