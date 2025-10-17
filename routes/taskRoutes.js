import express from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  upload,
  getTasksByStatustodo,
  getTasksByStatusinprogress,
  getTasksByStatusdone
} from "../controllers/taskController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllTasks,verifyToken);
router.get("/todo", getTasksByStatustodo,verifyToken);
router.get("/inprogress", getTasksByStatusinprogress,verifyToken);
router.get("/done", getTasksByStatusdone,verifyToken);
router.get("/task/:id", getTaskById,verifyToken);
router.post("/",upload.single("task_attachments"), createTask,verifyToken);
router.put("/updatetask/:id",upload.single("task_attachments"), updateTask,verifyToken);
router.delete("/tasks/:id", deleteTask,verifyToken);

export default router;
