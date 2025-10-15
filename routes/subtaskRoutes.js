import express from "express";
import { getSubtasks,createSubtask,deleteSubtask,updateSubtask } from "../controllers/subtaskController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/allsubtasks/:parent_task_id", verifyToken, isAdmin, getSubtasks);
router.post("/createsubtask", verifyToken, isAdmin, createSubtask);
router.put("/updatesubtask/:id", verifyToken, isAdmin, updateSubtask);
router.delete("/deletesubtasks/:id", verifyToken, isAdmin, deleteSubtask);

export default router;
