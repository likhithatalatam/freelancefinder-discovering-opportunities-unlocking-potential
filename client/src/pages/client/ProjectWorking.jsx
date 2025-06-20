import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { GeneralContext } from "../../context/GeneralContext";
import "../../styles/client/ProjectWorking.css";

const ProjectWorking = () => {
  const { socket } = useContext(GeneralContext);
  const { id: projectId } = useParams();

  const [project, setProject] = useState({});
  const [clientId, setClientId] = useState(localStorage.getItem("userId"));
  const [chats, setChats] = useState({});
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [manual, setManual] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");

  useEffect(() => {
    fetchProject(projectId);
    fetchChats(projectId);
  }, [projectId]);

  useEffect(() => {
    socket.on("message-from-user", fetchChats);

    return () => {
      socket.off("message-from-user", fetchChats);
    };
  }, [socket]);

  const fetchProject = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:6001/fetch-project/${id}`
      );
      setProject(response.data);

      // Join socket room only after project is loaded
      socket.emit("join-chat-room-client", {
        projectId: id,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:6001/fetch-chats/${projectId}`
      );
      setChats(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = () => {
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
      alert("Project marked as completed.");
    } catch (err) {
      console.log(err);
    }
  };

  const rejectSubmission = async () => {
    try {
      await axios.get(`http://localhost:6001/reject_submission/${projectId}`);
      fetchProject(projectId);
      alert("Submission rejected.");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="project-working-page">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <p>Budget: ₹{project.budget}</p>
      <p>Deadline: {project.deadline}</p>
      <p>Status: {project.status}</p>

      {project.submission && (
        <div className="submission-box">
          <h4>Project Submission</h4>
          <p>Description: {project.submissionDescription}</p>
          <p>
            Project Link:{" "}
            <a
              href={project.projectlink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.projectlink}
            </a>
          </p>
          <p>
            Manual Link:{" "}
            <a
              href={project.manuallink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.manuallink}
            </a>
          </p>
          {!project.submissionAccepted ? (
            <div className="action-buttons">
              <button className="btn btn-success" onClick={approveSubmission}>
                Approve
              </button>
              <button className="btn btn-danger" onClick={rejectSubmission}>
                Reject
              </button>
            </div>
          ) : (
            <p className="text-success mt-2">Submission Accepted</p>
          )}
        </div>
      )}

      <div className="chat-section mt-4">
        <h5>Chat with Freelancer</h5>
        <div className="chat-box">
          {chats?.messages?.map((chat, i) => (
            <div
              className={`chat-message ${
                chat.senderId === clientId ? "own" : ""
              }`}
              key={i}
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
  );
};

export default ProjectWorking;
