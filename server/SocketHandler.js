import { Chat, Project } from "./Schema.js";
import { v4 as uuid } from "uuid";

const SocketHandler = (socket) => {
  //Freelancer joins chat room
  socket.on("join-chat-room", async ({ projectId, freelancerId }) => {
    try {
      const project = await Project.findById(projectId);
      if (project && project.freelancerId === freelancerId) {
        socket.join(projectId);
        console.log(`Freelancer joined room: ${projectId}`);

        // Notify others in the room
        socket.broadcast.to(projectId).emit("user-joined-room");

        // Ensure chat exists
        let chat = await Chat.findById(projectId);
        if (!chat) {
          chat = new Chat({ _id: projectId, messages: [] });
          await chat.save();
        }

        // Send existing chat messages
        socket.emit("messages-updated", { chat });
      }
    } catch (error) {
      console.error("Error joining freelancer chat room:", error.message);
    }
  });

  // Client joins chat room
  socket.on("join-chat-room-client", async ({ projectId }) => {
    try {
      const project = await Project.findById(projectId);
      if (project && ["Assigned", "Completed"].includes(project.status)) {
        socket.join(projectId);
        console.log(`Client joined room: ${projectId}`);

        socket.broadcast.to(projectId).emit("user-joined-room");

        let chat = await Chat.findById(projectId);
        if (!chat) {
          chat = new Chat({ _id: projectId, messages: [] });
          await chat.save();
        }

        socket.emit("messages-updated", { chat });
      }
    } catch (error) {
      console.error("Error joining client chat room:", error.message);
    }
  });

  // Manual refresh of messages
  socket.on("update-messages", async ({ projectId }) => {
    try {
      const chat = await Chat.findById(projectId);
      if (chat) {
        console.log(`Updating chat for ${projectId}`);
        socket.emit("messages-updated", { chat });
      }
    } catch (error) {
      console.error("Error updating messages:", error.message);
    }
  });

  // New message in room
  socket.on("new-message", async ({ projectId, senderId, message, time }) => {
    try {
      const newMsg = {
        id: uuid(),
        senderId,
        text: message,
        time,
      };

      await Chat.findByIdAndUpdate(
        projectId,
        { $push: { messages: newMsg } },
        { new: true, upsert: true }
      );

      const updatedChat = await Chat.findById(projectId);

      // Emit to sender
      socket.emit("messages-updated", { chat: updatedChat });

      // Emit to other participants
      socket.to(projectId).emit("message-from-user", newMsg);
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  });
};

export default SocketHandler;
