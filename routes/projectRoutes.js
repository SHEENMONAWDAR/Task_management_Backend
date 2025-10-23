import express from "express";
import { getAllProjectswithuserId,createProject,getProject,updateProject,deleteProject,upload,getProjectsWithDetails,
    

 } from "../controllers/projectController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.get("/", getAllProjects);
router.get("/userprojects/:userId",getAllProjectswithuserId)
router.get("/", getProjectsWithDetails);
router.get("/:id", getProject);
router.post("/", upload.single("project_logo"), createProject);
router.put("/:id", upload.single("project_logo"), updateProject);
router.delete("/:id", deleteProject);



export default router;