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

    setChats((prev) => ({
      ...prev,
      messages: [
        ...(prev?.messages || []),
        { senderId: userId, text: message, time },
      ],
    }));

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
    setLink("");
    setManual("");
    setDescription("");
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

        {project.skills?.length > 0 && (
          <div className="skills-list">
            <strong>Required Skills</strong>
            <ul>
              {project.skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="p">
          Budget <br /> ₹{project.budget}
        </p>

        {/* 📝 Proposal Form - Show if not assigned */}
        {!isAssignedFreelancer && (
          <div className="proposal-form mt-3">
            <h5>Submit Proposal</h5>
            <div className="inputs">
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
            </div>
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

        {/* 📤 Submission Form - Show if assigned */}
        {isAssignedFreelancer && (
          <div className="submission-form mt-4">
            <h5>Submit Project</h5>

            {project.submissionAccepted ? (
              <p className="text-success mt-2">
                ✅ Project marked completed by client.
              </p>
            ) : project.submission ? (
              <>
                <input
                  type="text"
                  placeholder="Project Link"
                  value=""
                  className="form-control my-1"
                  disabled
                />
                <input
                  type="text"
                  placeholder="Manual Link"
                  value=""
                  className="form-control my-1"
                  disabled
                />
                <textarea
                  rows="3"
                  placeholder="Describe your work"
                  value=""
                  className="form-control my-1"
                  disabled
                />
                <button className="btn btn-secondary" disabled>
                  Already submitted. Awaiting approval.
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Project Link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="form-control my-1"
                />
                <input
                  type="text"
                  placeholder="Manual Link"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  className="form-control my-1"
                />
                <textarea
                  rows="3"
                  placeholder="Describe your work"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control my-1"
                />
                <button
                  className="btn btn-success"
                  onClick={handleSubmitProject}
                >
                  Submit Project
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Chat Box */}
      <div className="project-chat-box">
        <h5>Chat with Client</h5>
        <div className="chat-messages">
          {!isAssignedFreelancer && (
            <p className="text-muted">
              <i>❌ You are not assigned to this project. Chat is disabled.</i>
            </p>
          )}
          {isAssignedFreelancer &&
            chats?.messages?.map((chat, i) => (
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

        {isAssignedFreelancer && (
          <div className="chat-input-box">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-control"
            />
            <button onClick={sendMessage} className="btn">
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectData;
