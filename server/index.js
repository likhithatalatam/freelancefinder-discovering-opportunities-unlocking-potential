import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import http from "http";
import { Server } from "socket.io";
import SocketHandler from "./SocketHandler.js";
import { Application, Chat, Freelancer, Project, User } from "./Schema.js";

const app = express();
const server = http.createServer(app);
const PORT = 6001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected");
  SocketHandler(socket);
});

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/freelancefinder", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Routes

    app.post("/register", async (req, res) => {
      try {
        const { username, email, password, usertype } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
          username,
          email,
          password: hashedPassword,
          usertype,
        }).save();

        if (usertype === "freelancer") {
          await new Freelancer({ userId: newUser._id }).save();
        }

        res.status(200).json(newUser);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({ msg: "Incorrect credentials" });

        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/fetch-freelancer/:id", async (req, res) => {
      try {
        const freelancer = await Freelancer.findOne({ userId: req.params.id });
        res.status(200).json(freelancer);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    //FIXED: Update freelancer route
    app.post("/update-freelancer", async (req, res) => {
      try {
        console.log("Incoming Update Request Body:", req.body);

        const { freelancerId, updateSkills, description } = req.body;
        const freelancer = await Freelancer.findOne({ userId: freelancerId });

        if (!freelancer) {
          return res.status(404).json({ error: "Freelancer not found" });
        }

        freelancer.skills = updateSkills.split(",").map((s) => s.trim());
        freelancer.description = description;

        await freelancer.save();

        console.log("Freelancer updated:", freelancer);
        res.status(200).json(freelancer);
      } catch (err) {
        console.error("Error in /update-freelancer:", err.message);
        res.status(500).json({ error: err.message });
      }
    });
    // Projects
    app.get("/fetch-project/:id", async (req, res) => {
      try {
        const project = await Project.findById(req.params.id);
        res.status(200).json(project);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/fetch-projects", async (req, res) => {
      try {
        const projects = await Project.find();
        res.status(200).json(projects);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post("/new-project", async (req, res) => {
      try {
        console.log("New Project Payload:", req.body);

        const {
          title,
          description,
          budget,
          skills,
          clientId,
          clientName,
          clientEmail,
        } = req.body;

        const newProject = new Project({
          title,
          description,
          budget,
          skills: Array.isArray(skills)
            ? skills
            : typeof skills === "string"
            ? skills.split(",").map((s) => s.trim())
            : [],

          clientId,
          clientName,
          clientEmail,
          postedDate: new Date(),
        });

        await newProject.save();

        console.log("Project created:", newProject);
        res.status(200).json({ message: "Project created" });
      } catch (err) {
        console.error("Error creating project:", err.message);
        res.status(500).json({ error: err.message });
      }
    });
    // Applications
    app.post("/make-bid", async (req, res) => {
      try {
        const {
          clientId,
          freelancerId,
          projectId,
          proposal,
          bidAmount,
          estimatedTime,
        } = req.body;

        const freelancer = await User.findById(freelancerId);
        const freelancerData = await Freelancer.findOne({
          userId: freelancerId,
        });
        const project = await Project.findById(projectId);
        const client = await User.findById(clientId);

        const application = new Application({
          projectId,
          clientId,
          clientName: client.username,
          clientEmail: client.email,
          freelancerId,
          freelancerName: freelancer.username,
          freelancerEmail: freelancer.email,
          freelancerSkills: freelancerData.skills,
          title: project.title,
          description: project.description,
          budget: project.budget,
          requiredSkills: project.skills,
          proposal,
          bidAmount,
          estimatedTime,
        });

        await application.save();
        project.bids.push(freelancerId);
        project.bidAmounts.push(parseInt(bidAmount));
        freelancerData.applications.push(application._id);
        await project.save();
        await freelancerData.save();

        res.status(200).json({ message: "Bid submitted" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/fetch-applications", async (req, res) => {
      try {
        const applications = await Application.find();
        res.status(200).json(applications);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/approve-application/:id", async (req, res) => {
      try {
        const application = await Application.findById(req.params.id);
        const project = await Project.findById(application.projectId);
        const freelancer = await Freelancer.findOne({
          userId: application.freelancerId,
        });
        const user = await User.findById(application.freelancerId);

        application.status = "Accepted";
        await application.save();

        project.freelancerId = freelancer.userId;
        project.freelancerName = user.username;
        project.budget = application.bidAmount;
        project.status = "Assigned";
        freelancer.currentProjects.push(project._id);

        await project.save();
        await freelancer.save();

        res.status(200).json({ message: "Application approved" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/project-application/:id", async (req, res) => {
      try {
        const application = await Application.findById(req.params.id);
        application.status = "Rejected";
        await application.save();
        res.status(200).json({ message: "Application rejected" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Submission
    // Submit Project (Freelancer)
    app.post("/submit-project", async (req, res) => {
      try {
        const { projectId, projectLink, manualLink, submissionDescription } =
          req.body;
        const project = await Project.findById(projectId);

        if (!project)
          return res.status(404).json({ error: "Project not found" });

        if (project.submissionAccepted) {
          return res
            .status(400)
            .json({ error: "Submission already accepted. Cannot resubmit." });
        }

        project.projectLink = projectLink;
        project.manualLink = manualLink;
        project.submissionDescription = submissionDescription;
        project.submission = true;

        await project.save();

        res.status(200).json({ message: "Submission saved" });
      } catch (err) {
        console.error("Error saving submission:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Approve Submission (Client)
    app.get("/approve-submission/:id", async (req, res) => {
      try {
        const project = await Project.findById(req.params.id);
        const freelancer = await Freelancer.findOne({
          userId: project.freelancerId,
        });

        if (!project || !freelancer)
          return res
            .status(404)
            .json({ error: "Project or freelancer not found" });

        project.submissionAccepted = true;
        project.status = "Completed";
        freelancer.currentProjects = freelancer.currentProjects.filter(
          (id) => id.toString() !== project._id.toString()
        );
        freelancer.completedProjects.push(project._id);
        freelancer.funds += parseInt(project.budget);

        await project.save();
        await freelancer.save();

        res.status(200).json({ message: "Submission approved" });
      } catch (err) {
        console.error("Error approving submission:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Reject Submission (Client)
    app.get("/reject-submission/:id", async (req, res) => {
      try {
        const project = await Project.findById(req.params.id);
        if (!project)
          return res.status(404).json({ error: "Project not found" });

        project.submission = false;
        project.projectLink = "";
        project.manualLink = "";
        project.submissionDescription = "";
        project.submissionAccepted = false;

        await project.save();

        res.status(200).json({
          message: "Submission rejected, freelancer may resubmit.",
        });
      } catch (err) {
        console.error("Error rejecting submission:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Users
    app.get("/fetch-users", async (req, res) => {
      try {
        const users = await User.find();
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/fetch-chats/:id", async (req, res) => {
      try {
        const chat = await Chat.findById(req.params.id);
        res.status(200).json(chat ? chat.messages : []);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
