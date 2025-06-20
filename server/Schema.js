import mongoose from "mongoose";

// ===== User Schema =====
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  usertype: { type: String, required: true }, // 'client' | 'freelancer' | 'admin'
});

// ===== Freelancer Schema =====
const freelancerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  skills: { type: [String], default: [] },
  description: { type: String, default: "" },
  currentProjects: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "projects",
    default: [],
  },
  completedProjects: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "projects",
    default: [],
  },
  applications: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "applications",
    default: [],
  },
  funds: { type: Number, default: 0 },
});

// ===== Project Schema =====
const projectSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  clientName: String,
  clientEmail: String,
  title: { type: String, required: true },
  description: String,
  budget: Number,
  skills: [String],
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  bidAmounts: [Number],
  postedDate: { type: Date, default: Date.now },
  status: { type: String, default: "Available" }, // Available | Assigned | Completed
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  freelancerName: String,
  deadline: Date,
  submission: { type: Boolean, default: false },
  submissionAccepted: { type: Boolean, default: false },
  projectLink: { type: String, default: "" },
  manualLink: { type: String, default: "" },
  submissionDescription: { type: String, default: "" },
});

// ===== Application Schema =====
const applicationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "projects",
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  clientName: String,
  clientEmail: String,
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  freelancerName: String,
  freelancerEmail: String,
  freelancerSkills: [String],
  title: String,
  description: String,
  budget: Number,
  requiredSkills: [String],
  proposal: String,
  bidAmount: Number,
  estimatedTime: Number,
  status: { type: String, default: "Pending" }, // Pending | Accepted | Rejected
});

// ===== Chat Schema =====
const chatSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "projects",
  }, // projectId
  messages: [
    {
      id: String,
      text: String,
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
      time: String,
    },
  ],
});

// ===== Model Exports =====
export const User = mongoose.model("users", userSchema);
export const Freelancer = mongoose.model("freelancer", freelancerSchema);
export const Project = mongoose.model("projects", projectSchema);
export const Application = mongoose.model("applications", applicationSchema);
export const Chat = mongoose.model("chats", chatSchema);
