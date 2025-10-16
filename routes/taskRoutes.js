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

router.get("/", getAllTasks,verifyToken, isAdmin);
router.get("/todo", getTasksByStatustodo,verifyToken, isAdmin);
router.get("/inprogress", getTasksByStatusinprogress,verifyToken, isAdmin);
router.get("/done", getTasksByStatusdone,verifyToken, isAdmin);
router.get("/task/:id", getTaskById,verifyToken, isAdmin);
router.post("/",upload.single("task_attachments"), createTask,verifyToken, isAdmin);
router.put("/updatetask/:id",upload.single("task_attachments"), updateTask,verifyToken, isAdmin);
router.delete("/tasks/:id", deleteTask,verifyToken, isAdmin);

export default router;
