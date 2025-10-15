import express from "express";
import { addProjectMember, getProjectMembers, removeProjectMember,updateProjectMemberRole } from "../controllers/projectMemberController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken,addProjectMember);
router.get("/:id", verifyToken,  getProjectMembers);
router.put("/:id",verifyToken,  updateProjectMemberRole)
router.delete("/projectmembers/:id", verifyToken,  removeProjectMember);

export default router;
