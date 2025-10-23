import express from "express";
import {
getTaskStatusMonthly
} from "../controllers/taskStatusController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/taskmonthlystatus/:userId", verifyToken,getTaskStatusMonthly);

export default router;