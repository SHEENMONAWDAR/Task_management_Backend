import express from "express";
import {
  addTaskAssignee,
  getTaskAssignees,
  removeTaskAssigneesByTask,
  getUserAssignedTasks,
} from "../controllers/taskAssigneeController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/", verifyToken, isAdmin, addTaskAssignee);

router.get("/:taskId", verifyToken, isAdmin, getTaskAssignees);

router.delete("/:taskId", verifyToken, isAdmin, removeTaskAssigneesByTask);

router.get("/:userId", verifyToken, isAdmin, getUserAssignedTasks);

export default router;
