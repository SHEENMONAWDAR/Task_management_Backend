import db from "../db.js";


export const getAllUsers = (req, res) => {
  try {
    const sql = "SELECT * FROM st_users";

    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }
      return res.status(200).json(results);
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};



export const getUser = (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT id, name, email, role, is_active, image FROM st_users WHERE id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(results[0]);
  });
};



export const updateUser = (req, res) => {
  try {

    const { id } = req.params;
    const { role, is_active } = req.body;

    const sql = `
      UPDATE st_users 
      SET role = COALESCE(?, role), is_active = COALESCE(?, is_active)
      WHERE id = ?
    `;

    db.query(sql, [role, is_active, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User updated successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
