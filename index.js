import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Import routes
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import subtaskRoutes from './routes/subtaskRoutes.js'
import userRoutes from "./routes/userRoutes.js";
import projectMemberRoutes from "./routes/projectMemberRoutes.js";
import taskAssigneesRoutes from './routes/taskAssigneeRoutes.js';
import commentRoutes from './routes/commentRoutes.js'
import taskStatusRoutes from './routes/taskStatusRoutes.js'


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'))
app.use('/project_logos', express.static('project_logos'))
app.use('/task_attachments', express.static('task_attachments'))






app.use("/api", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use('/api/subtasks',subtaskRoutes)
app.use('/api/projectmembers',projectMemberRoutes)
app.use('/api/taskmembers',taskAssigneesRoutes)
app.use('/api/comments',commentRoutes)
app.use('/api',taskStatusRoutes)

app.listen(process.env.PORT, () =>
  console.log(` Server running on port ${process.env.PORT}`)
);
