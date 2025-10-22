import express from "express";
import { createComment,getComment } from "../controllers/commentController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";



const router = express.Router();

router.post("/", verifyToken,createComment);
router.get("/:id", verifyToken,  getComment);
// router.put("/:id",verifyToken,  updateProjectMemberRole)
// router.delete("/projectmembers/:id", verifyToken,  removeProjectMember);

export default router;