import { Chat, Project } from "./Schema.js";
import { v4 as uuid } from "uuid";

const SocketHandler = (socket) => {
  // 📌 Freelancer joins a project chat room
  socket.on("join-chat-room", async ({ projectId, freelancerId }) => {
    try {
      const project = await Project.findById(projectId);
      if (project && project.freelancerId === freelancerId) {
        socket.join(projectId);
        console.log(`✅ Freelancer joined room: ${projectId}`);

        socket.broadcast.to(projectId).emit("user-joined-room");

        let chat = await Chat.findById(projectId);
        if (!chat) {
          chat = new Chat({ _id: projectId, messages: [] });
          await chat.save();
        }

        socket.emit("messages-updated", { chat });
      }
    } catch (error) {
      console.error("❌ Error joining freelancer chat room:", error.message);
    }
  });

  // 📌 Client joins a project chat room
  socket.on("join-chat-room-client", async ({ projectId }) => {
    try {
      const project = await Project.findById(projectId);
      if (project && ["Assigned", "Completed"].includes(project.status)) {
        socket.join(projectId);
        console.log(`✅ Client joined room: ${projectId}`);

        socket.broadcast.to(projectId).emit("user-joined-room");

        let chat = await Chat.findById(projectId);
        if (!chat) {
          chat = new Chat({ _id: projectId, messages: [] });
          await chat.save();
        }

        socket.emit("messages-updated", { chat });
      }
    } catch (error) {
      console.error("❌ Error joining client chat room:", error.message);
    }
  });

  // 🔄 Refresh messages for this chat room
  socket.on("update-messages", async ({ projectId }) => {
    try {
      const chat = await Chat.findById(projectId);
      if (chat) {
        console.log(`🔄 Sending updated messages for room: ${projectId}`);
        socket.emit("messages-updated", { chat });
      }
    } catch (error) {
      console.error("❌ Error updating messages:", error.message);
    }
  });

  // 💬 Add a new chat message
  socket.on("new-message", async ({ projectId, senderId, message, time }) => {
    try {
      const messageData = { id: uuid(), text: message, senderId, time };

      await Chat.findByIdAndUpdate(
        projectId,
        { $push: { messages: messageData } },
        { new: true, upsert: true }
      );

      const updatedChat = await Chat.findById(projectId);

      // Send updated chat to sender and notify others in room
      socket.emit("messages-updated", { chat: updatedChat });
      socket.broadcast.to(projectId).emit("message-from-user", messageData);
    } catch (error) {
      console.error("❌ Error sending message:", error.message);
    }
  });
};

export default SocketHandler;
