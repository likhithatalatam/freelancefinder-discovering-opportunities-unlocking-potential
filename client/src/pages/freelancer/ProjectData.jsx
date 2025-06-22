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
  const [chats, setChats] = useState({ messages: [] });
  const [message, setMessage] = useState("");

  const [link, setLink] = useState("");
  const [manual, setManual] = useState("");
  const [description, setDescription] = useState("");

  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [proposalText, setProposalText] = useState("");

  const isAssignedFreelancer = project?.freelancerId === userId;
  const alreadyApplied = project?.bids?.includes(userId);

  useEffect(() => {
    fetchProject();
    fetchChats();
  }, [projectId]);

  useEffect(() => {
    if (isAssignedFreelancer) {
      socket.emit("join-chat-room", { projectId, freelancerId: userId });
    }

    socket.on("message-from-user", (incoming) => {
      setChats((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), incoming],
      }));
    });

    return () => socket.off("message-from-user");
  }, [socket, isAssignedFreelancer]);

  const fetchProject = async () => {
    const res = await axios.get(
      `http://localhost:6001/fetch-project/${projectId}`
    );
    setProject(res.data);
  };

  const fetchChats = async () => {
    const res = await axios.get(
      `http://localhost:6001/fetch-chats/${projectId}`
    );
    setChats({ messages: res.data || [] });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const time = new Date().toISOString();
    socket.emit("new-message", { projectId, senderId: userId, message, time });
    setMessage("");
  };

  const handleSubmitProject = async () => {
    await axios.post("http://localhost:6001/submit-project", {
      projectId,
      projectLink: link,
      manualLink: manual,
      submissionDescription: description,
    });
    alert("✅ Project submitted successfully!");
    fetchProject();
  };

  const handleProposalSubmit = async () => {
    try {
      await axios.post("http://localhost:6001/make-bid", {
        clientId: project.clientId,
        freelancerId: userId,
        projectId,
        proposal: proposalText,
        bidAmount,
        estimatedTime,
      });
      alert("✅ Proposal sent successfully!");
      fetchProject();
    } catch (err) {
      alert("❌ Proposal failed.");
      console.error(err);
    }
  };

  return (
    <div className="project-data-wrapper">
      {/* LEFT: Project Info + Proposal + Submission */}
      <div className="project-details-box">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <p>Status: {project.status}</p>
        <p>Budget: ₹{project.budget}</p>

        {project.skills?.length > 0 && (
          <div className="skills-list">
            <strong>Required Skills:</strong>
            <ul>
              {project.skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 📝 Proposal Form - Visible only if not assigned */}
        {!isAssignedFreelancer && (
          <div className="proposal-form mt-3">
            <h5>Submit Proposal</h5>
            <input
              type="number"
              placeholder="Your Bid (₹)"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="form-control my-1"
              disabled={alreadyApplied}
            />
            <input
              type="text"
              placeholder="Estimated Time (e.g., 3 days)"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="form-control my-1"
              disabled={alreadyApplied}
            />
            <textarea
              rows="3"
              placeholder="Describe your proposal"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              className="form-control my-1"
              disabled={alreadyApplied}
            />
            <button
              className="btn btn-success mt-2"
              onClick={handleProposalSubmit}
              disabled={alreadyApplied}
            >
              Send Proposal
            </button>
            {alreadyApplied && (
              <p className="text-muted mt-1">
                ✅ Already applied to this project.
              </p>
            )}
          </div>
        )}

        {/* 📤 Submission Form - Only if assigned */}
        {isAssignedFreelancer && (
          <>
            {project.submissionAccepted ? (
              <p className="text-success mt-3">
                ✅ Project marked completed by client.
              </p>
            ) : (
              <div className="submission-form mt-4">
                <h5>Submit Project</h5>
                <input
                  type="text"
                  placeholder="Project Link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="form-control my-1"
                  disabled={project.submission}
                />
                <input
                  type="text"
                  placeholder="Manual Link"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  className="form-control my-1"
                  disabled={project.submission}
                />
                <textarea
                  rows="3"
                  placeholder="Describe your work"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control my-1"
                  disabled={project.submission}
                />
                <button
                  className="btn btn-success"
                  onClick={handleSubmitProject}
                  disabled={project.submission}
                >
                  Submit Project
                </button>
                {project.submission && (
                  <p className="text-muted mt-2">
                    ✅ Submitted. Waiting for approval by client.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* RIGHT: Chat Box */}
      <div className="project-chat-box">
        <h5>Chat with Client</h5>
        <div className="chat-messages">
          {chats?.messages?.map((chat, i) => (
            <div
              key={i}
              className={`chat-message ${
                chat.senderId === userId ? "own" : ""
              }`}
            >
              <p>{chat.text}</p>
              <span>{new Date(chat.time).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="chat-input-box">
          {!isAssignedFreelancer && (
            <p className="text-muted">
              ❌ You are not assigned to this project.
            </p>
          )}
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control"
            disabled={!isAssignedFreelancer}
          />
          <button
            onClick={sendMessage}
            className="btn btn-primary mt-2"
            disabled={!isAssignedFreelancer}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectData;
