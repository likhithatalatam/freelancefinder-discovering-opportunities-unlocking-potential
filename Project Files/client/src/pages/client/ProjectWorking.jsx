import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { GeneralContext } from "../../context/GeneralContext";
import "../../styles/client/ProjectWorking.css";

const ProjectWorking = () => {
  const { socket } = useContext(GeneralContext);
  const { id: projectId } = useParams();
  const userId = localStorage.getItem("userId");

  const [project, setProject] = useState({});
  const [chats, setChats] = useState({ messages: [] });
  const [message, setMessage] = useState("");

  const isChatEnabled = ["Assigned", "Completed"].includes(project.status);

  useEffect(() => {
    fetchProject();
    fetchChats();

    socket.emit("join-chat-room-client", { projectId });

    socket.on("message-from-user", (incoming) => {
      setChats((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), incoming],
      }));
    });

    return () => socket.off("message-from-user");
  }, [projectId]);

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

    // Emit to socket
    socket.emit("new-message", { projectId, senderId: userId, message, time });

    // Instantly update local chat UI
    setChats((prev) => ({
      ...prev,
      messages: [
        ...(prev?.messages || []),
        { senderId: userId, text: message, time },
      ],
    }));

    setMessage("");
  };

  const approveSubmission = async () => {
    await axios.get(`http://localhost:6001/approve-submission/${projectId}`);
    alert("✅ Submission approved. Project marked completed.");
    fetchProject();
  };

  const rejectSubmission = async () => {
    await axios.get(`http://localhost:6001/reject-submission/${projectId}`);
    alert("❌ Submission rejected. Freelancer can resubmit.");
    fetchProject();
  };

  return (
    <div className="project-working-page">
      {/* LEFT: Project Info */}
      <div className="project-details-box">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <p>Status: {project.status}</p>
        <p>Budget: ₹{project.budget}</p>

        {project.skills?.length > 0 && (
          <div className="skills-box">
            <h6>Required Skills:</h6>
            <ul>
              {project.skills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submission Section */}
        {isChatEnabled && (
          <div className="submission-box mt-3">
            <h5>Submission</h5>
            {!project.submission ? (
              <p className="text-muted">⚠️ No submissions yet.</p>
            ) : (
              <>
                <p>
                  <strong>Project Link:</strong>{" "}
                  <a
                    href={project.projectLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {project.projectLink}
                  </a>
                </p>
                <p>
                  <strong>Manual Link:</strong>{" "}
                  <a href={project.manualLink} target="_blank" rel="noreferrer">
                    {project.manualLink}
                  </a>
                </p>
                <p>
                  <strong>Description:</strong> {project.submissionDescription}
                </p>
                {!project.submissionAccepted ? (
                  <div className="action-buttons mt-2">
                    <button
                      className="btn btn-success me-2"
                      onClick={approveSubmission}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={rejectSubmission}
                    >
                      ❌ Reject
                    </button>
                  </div>
                ) : (
                  <p className="text-success mt-2">🎉 Submission Approved</p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Chat */}
      <div className="project-chat-box">
        <h5>Chat with Freelancer</h5>
        <div className="chat-messages">
          {!isChatEnabled ? (
            <p className="text-muted text-center mt-2">
              ❌ Chat disabled. Project not assigned.
            </p>
          ) : chats?.messages?.length === 0 ? (
            <p className="text-muted text-center">No messages yet.</p>
          ) : (
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
            ))
          )}
        </div>

        {isChatEnabled && (
          <div className="chat-input-box">
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
        )}
      </div>
    </div>
  );
};

export default ProjectWorking;
