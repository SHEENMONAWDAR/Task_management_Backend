import express from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/alltasks", getAllTasks,verifyToken, isAdmin);
router.get("/task/:id", getTaskById,verifyToken, isAdmin);
router.post("/createtask", createTask,verifyToken, isAdmin);
router.put("/updatetask/:id", updateTask,verifyToken, isAdmin);
router.delete("/tasks/:id", deleteTask,verifyToken, isAdmin);

export default router;
