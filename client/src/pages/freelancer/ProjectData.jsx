import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/freelancer/ProjectData.css";
import { GeneralContext } from "../../context/GeneralContext";

const ProjectData = () => {
  const { socket } = useContext(GeneralContext);
  const params = useParams();
  const chatEndRef = useRef(null);

  const [project, setProject] = useState({});
  const [clientId, setClientId] = useState("");
  const [freelancerId] = useState(localStorage.getItem("userId"));
  const [projectId] = useState(params.id);
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [manualLink, setManualLink] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    fetchProject(projectId);
    if (socket) {
      joinSocketRoom();
      socket.on("message-from-user", fetchChats);
    }
    fetchChats();

    return () => {
      if (socket) socket.off("message-from-user");
    };
  }, [socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const joinSocketRoom = () => {
    socket.emit("join-chat-room", {
      projectId,
      freelancerId,
    });
  };

  const fetchProject = async (id) => {
    try {
      const res = await axios.get(`http://localhost:6001/fetch-project/${id}`);
      setProject(res.data);
      setClientId(res.data.clientId);
    } catch (err) {
      console.error("❌ Error fetching project:", err);
    }
  };

  const handleBidding = async () => {
    try {
      await axios.post("http://localhost:6001/add-bid", {
        projectId,
        freelancerId,
        bidAmount,
        proposal,
        estimatedTime,
      });
      setProposal("");
      setBidAmount(0);
      setEstimatedTime("");
      alert("✅ Bidding successful!");
    } catch (err) {
      console.error(err);
      alert("❌ Bidding failed!");
    }
  };

  const handleProjectSubmission = async () => {
    try {
      await axios.post("http://localhost:6001/submit-project", {
        projectId,
        freelancerId,
        projectLink,
        manualLink,
        description: submissionDescription,
      });
      setProjectLink("");
      setManualLink("");
      setSubmissionDescription("");
      alert("✅ Submission successful!");
    } catch (err) {
      console.error(err);
      alert("❌ Submission failed!");
    }
  };

  const handleMessageSend = () => {
    if (!message.trim()) return;
    socket.emit("new-message", {
      projectId,
      senderId: freelancerId,
      message,
      time: new Date(),
    });
    setMessage("");
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:6001/fetch-chats/${projectId}`
      );
      setChats(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch chats:", err);
    }
  };

  return (
    <div className="project-data-page">
      <div className="project-data-container">
        {/* Project Info */}
        <div className="project-data">
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <span>
            <h5>Required skills</h5>
            <div className="required-skills">
              {project.skills?.map((skill) => (
                <p key={skill}>{skill}</p>
              ))}
            </div>
          </span>
          <span>
            <h5>Budget</h5>
            <h6>₹ {project.budget}</h6>
          </span>
        </div>

        {/* Bidding Section */}
        {project.status === "Available" && (
          <div className="project-form-body">
            <h4>Send Proposal</h4>
            <div className="form-floating mb-3">
              <input
                type="number"
                className="form-control"
                placeholder="Bid Amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <label>Bid Amount (₹)</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Estimated Time"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
              <label>Estimated Time</label>
            </div>
            <div className="form-floating mb-3">
              <textarea
                className="form-control"
                placeholder="Proposal"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
              />
              <label>Proposal</label>
            </div>
            <button className="btn btn-primary" onClick={handleBidding}>
              Submit Proposal
            </button>
          </div>
        )}

        {/* Submission Section */}
        {project.status === "Assigned" && (
          <div className="project-form-body">
            <h4>Submit Project</h4>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Project Link"
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
              />
              <label>Project Link</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Manual Link"
                value={manualLink}
                onChange={(e) => setManualLink(e.target.value)}
              />
              <label>Manual/Documentation Link</label>
            </div>
            <div className="form-floating mb-3">
              <textarea
                className="form-control"
                placeholder="Submission Description"
                value={submissionDescription}
                onChange={(e) => setSubmissionDescription(e.target.value)}
              />
              <label>Description</label>
            </div>
            <button
              className="btn btn-success"
              onClick={handleProjectSubmission}
            >
              Submit Work
            </button>
          </div>
        )}

        {/* Chat Section */}
        <div className="chat-section">
          <h4>Chat</h4>
          <div className="chat-box">
            {chats.map((chat, index) => (
              <div
                key={index}
                className={`chat-message ${
                  chat.senderId === freelancerId
                    ? "my-message"
                    : "their-message"
                }`}
              >
                <p>{chat.message}</p>
                <span>{new Date(chat.time).toLocaleString()}</span>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="btn btn-secondary mt-2"
              onClick={handleMessageSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectData;
