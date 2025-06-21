import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { GeneralContext } from "../../context/GeneralContext";
import "../../styles/freelancer/ProjectData.css";

const ProjectData = () => {
  const { socket } = useContext(GeneralContext);
  const { id: projectId } = useParams();
  const userId = localStorage.getItem("userId");

  const [project, setProject] = useState({});
  const [chats, setChats] = useState([]);
  const [message, setMessage] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [proposal, setProposal] = useState("");

  const isAssignedFreelancer = project?.freelancerId === userId;
  const alreadyApplied = project?.bids?.includes(userId);

  useEffect(() => {
    fetchProject();
    fetchChats();
  }, []);

  useEffect(() => {
    if (isAssignedFreelancer) {
      socket.emit("join-chat-room", { projectId, freelancerId: userId });
    }
    socket.on("message-from-user", fetchChats);
    return () => socket.off("message-from-user", fetchChats);
  }, [project]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(
        `http://localhost:6001/fetch-project/${projectId}`
      );
      setProject(res.data);
    } catch (err) {
      console.error("Error fetching project", err);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:6001/fetch-chats/${projectId}`
      );
      setChats(res.data || []);
    } catch (err) {
      console.error("Error fetching chats", err);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const time = new Date().toISOString();
    socket.emit("new-message", {
      projectId,
      senderId: userId,
      message,
      time,
    });
    setMessage("");
  };

  const handleProposalSubmit = async () => {
    try {
      if (!bidAmount || !estimatedTime || !proposal) {
        alert("Please fill all proposal fields.");
        return;
      }

      await axios.post("http://localhost:6001/make-bid", {
        clientId: project.clientId,
        freelancerId: userId,
        projectId,
        proposal,
        bidAmount,
        estimatedTime,
      });

      alert("Proposal sent successfully!");
      setBidAmount("");
      setEstimatedTime("");
      setProposal("");
      fetchProject();
    } catch (err) {
      console.error("Failed to submit proposal", err);
      alert("Proposal failed to send.");
    }
  };

  return (
    <div className="project-data-layout">
      <div className="project-details-section">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <p>
          <strong>Status:</strong> {project.status}
        </p>
        <p>
          <strong>Budget:</strong> ₹{project.budget}
        </p>
        <div className="tag-container">
          {project.skills?.map((s, i) => (
            <span key={i} className="tag">
              {s}
            </span>
          ))}
        </div>

        {!isAssignedFreelancer && !alreadyApplied && (
          <div className="proposal-form">
            <h4>Send Proposal</h4>
            <div className="proposal-grid">
              <input
                type="text"
                placeholder="Budget"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <input
                type="text"
                placeholder="Estimated time (days)"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>
            <textarea
              rows={4}
              placeholder="Describe your proposal"
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
            />
            <button onClick={handleProposalSubmit}>Submit Proposal</button>
          </div>
        )}
      </div>

      <div className="project-chat-section">
        <h5>Chat with the client</h5>
        <div className="chat-box">
          {chats?.messages?.map((msg, i) => (
            <div
              className={`chat-bubble ${msg.senderId === userId ? "own" : ""}`}
              key={i}
            >
              <p>{msg.text}</p>
              <span>{new Date(msg.time).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="chat-input-box">
          {!isAssignedFreelancer && (
            <p>Chat will be enabled if the project is assigned to you!!</p>
          )}
          <input
            type="text"
            placeholder="Type message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isAssignedFreelancer}
          />
          <button onClick={sendMessage} disabled={!isAssignedFreelancer}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectData;
