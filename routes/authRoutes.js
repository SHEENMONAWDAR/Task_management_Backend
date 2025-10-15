import express from "express";
import multer from "multer";
import { loginUser, registerUser } from "../controllers/authController.js";

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Routes
router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);

export default router;
