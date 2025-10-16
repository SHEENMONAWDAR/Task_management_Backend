import express from "express";
import {
  addTaskAssignee,
  getTaskAssignees,
  removeTaskAssignee,
  getUserAssignedTasks,
} from "../controllers/taskAssigneeController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/", verifyToken, isAdmin, addTaskAssignee);

router.get("/assignees/:taskId", verifyToken, isAdmin, getTaskAssignees);

router.delete("/assignee/:id", verifyToken, isAdmin, removeTaskAssignee);

router.get("/user-tasks/:userId", verifyToken, isAdmin, getUserAssignedTasks);

export default router;
