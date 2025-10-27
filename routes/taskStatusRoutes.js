import express from "express";
import {
getTaskStatusMonthly,
getTaskStatusMonthlyByprojectId
} from "../controllers/taskStatusController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/taskmonthlystatus/:userId", verifyToken,getTaskStatusMonthly);
router.post("/taskmonthlystatusByProjectId/:projectId", verifyToken,getTaskStatusMonthlyByprojectId);

export default router;