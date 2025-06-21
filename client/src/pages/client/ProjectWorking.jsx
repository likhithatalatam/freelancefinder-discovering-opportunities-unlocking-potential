import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { GeneralContext } from "../../context/GeneralContext";
import "../../styles/client/ProjectWorking.css";

const ProjectWorking = () => {
  const { socket } = useContext(GeneralContext);
  const { id: projectId } = useParams();
  const [project, setProject] = useState({});
  const [clientId] = useState(localStorage.getItem("userId"));
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProject(projectId);
    socket.emit("join-chat-room-client", { projectId });

    fetchChats();

    socket.on("message-from-user", fetchChats);
    return () => socket.off("message-from-user", fetchChats);
  }, [projectId]);

  const fetchProject = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:6001/fetch-project/${id}`
      );
      setProject(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:6001/fetch-chats/${projectId}`
      );
      setChats(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const time = new Date().toISOString();
    socket.emit("new-message", {
      projectId,
      senderId: clientId,
      message,
      time,
    });
    setMessage("");
  };

  const approveSubmission = async () => {
    try {
      await axios.get(`http://localhost:6001/approve-submission/${projectId}`);
      fetchProject(projectId);
      alert("✅ Project marked as completed.");
    } catch (err) {
      console.log(err);
    }
  };

  const rejectSubmission = async () => {
    try {
      await axios.get(`http://localhost:6001/reject-submission/${projectId}`);
      fetchProject(projectId);
      alert("❌ Submission rejected.");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="project-working-page">
      <div className="project-chat-container">
        <div className="project-info">
          <h3 className="project-title">{project.title}</h3>
          <p>{project.description}</p>
          {project.skills && project.skills.length > 0 && (
            <div className="skills-section">
              <h5>Required Skills</h5>
              <ul className="skills-list">
                {project.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
          <p>Budget: ₹{project.budget}</p>
          <p>Status: {project.status}</p>

          {project.submission && (
            <div className="submission-box">
              <h4>Project Submission</h4>
              <p>Description: {project.submissionDescription}</p>
              <p>
                Project Link:{" "}
                <a href={project.projectLink} target="_blank" rel="noreferrer">
                  {project.projectLink}
                </a>
              </p>
              <p>
                Manual Link:{" "}
                <a href={project.manualLink} target="_blank" rel="noreferrer">
                  {project.manualLink}
                </a>
              </p>
              {!project.submissionAccepted ? (
                <div className="action-buttons">
                  <button
                    className="btn btn-success"
                    onClick={approveSubmission}
                  >
                    Approve
                  </button>
                  <button className="btn btn-danger" onClick={rejectSubmission}>
                    Reject
                  </button>
                </div>
              ) : (
                <p className="text-success">Submission Accepted</p>
              )}
            </div>
          )}
        </div>

        <div className="chat-section">
          <h5>Chat with Freelancer</h5>
          <div className="chat-box">
            {chats?.messages?.map((chat, i) => (
              <div
                key={i}
                className={`chat-message ${
                  chat.senderId === clientId ? "own" : ""
                }`}
              >
                <p>{chat.text}</p>
                <span>{new Date(chat.time).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorking;
