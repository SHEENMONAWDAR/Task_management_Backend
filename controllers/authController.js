import db from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// REGISTER USER
export const registerUser = (req, res) => {
  try {
    const { name, email, password, phone, } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }


    const image = req.file ? `uploads/${req.file.filename}` : null;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `
      INSERT INTO st_users 
      (name, email, password, phone, image)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, hashedPassword, phone, image], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Email already registered" });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// LOGIN USER
export const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const sql = "SELECT * FROM st_users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ message: "User not found" });

      const user = results[0];
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_admin: user.is_admin,
          is_active: user.is_active
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
