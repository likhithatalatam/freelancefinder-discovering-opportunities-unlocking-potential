import { Chat, Project } from "./Schema.js";
import { v4 as uuid } from "uuid";

const SocketHandler = (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // ✅ Freelancer joins chat room
  socket.on("join-chat-room", async ({ projectId, freelancerId }) => {
    try {
      const project = await Project.findById(projectId);
      if (project && project.freelancerId === freelancerId) {
        socket.join(projectId);
        console.log(`👨‍💻 Freelancer joined room ${projectId}`);

        let chat = await Chat.findById(projectId);
        if (!chat) {
          chat = new Chat({ _id: projectId, messages: [] });
          await chat.save();
        }

        socket.emit("messages-updated", { chat });
      }
    } catch (err) {
      console.error("❌ Freelancer join failed:", err.message);
    }
  });

  // ✅ Client joins chat room
  socket.on("join-chat-room-client", async ({ projectId }) => {
    try {
      const project = await Project.findById(projectId);
      if (["Assigned", "Completed"].includes(project.status)) {
        socket.join(projectId);
        console.log(`👤 Client joined room ${projectId}`);

        let chat = await Chat.findById(projectId);
        if (!chat) {
          chat = new Chat({ _id: projectId, messages: [] });
          await chat.save();
        }

        socket.emit("messages-updated", { chat });
      }
    } catch (err) {
      console.error("❌ Client join failed:", err.message);
    }
  });

  // ✅ Manual message fetch request
  socket.on("update-messages", async ({ projectId }) => {
    try {
      const chat = await Chat.findById(projectId);
      if (chat) {
        socket.emit("messages-updated", { chat });
      }
    } catch (err) {
      console.error("❌ Fetch messages error:", err.message);
    }
  });

  // ✅ Send new message
  socket.on("new-message", async ({ projectId, senderId, message, time }) => {
    try {
      const messageData = {
        id: uuid(),
        text: message,
        senderId,
        time,
      };

      // Push to DB
      await Chat.findByIdAndUpdate(
        projectId,
        { $push: { messages: messageData } },
        { new: true, upsert: true }
      );

      // Get updated chat
      const updatedChat = await Chat.findById(projectId);

      // Send to sender
      socket.emit("messages-updated", { chat: updatedChat });

      // Broadcast to others in room
      socket.broadcast.to(projectId).emit("message-from-user", messageData);
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
    }
  });

  // ✅ On disconnect
  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
};

export default SocketHandler;
