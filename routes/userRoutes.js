import express from "express";
import { getAllUsers, updateUser,getUser } from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllUsers);

router.put("/:id", verifyToken, isAdmin, updateUser);

router.get("/me", verifyToken, getUser);

export default router;
