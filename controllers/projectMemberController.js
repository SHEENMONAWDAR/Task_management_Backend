import db from "../db.js";


export const addProjectMember = (req, res) => {
  const { project_id, user_id, role } = req.body;
  console.log("📩 Inserting member:", { project_id, user_id, role });


  if (!project_id || !user_id) {
    return res.status(400).json({ message: "project_id and user_id are required" });
  }


  const checkSql = `SELECT * FROM st_project_members WHERE project_id = ? AND user_id = ?`;
  db.query(checkSql, [project_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });

    if (results.length > 0) {
      return res.status(400).json({ message: "User is already a member of this project" });
    }

    const sql = `INSERT INTO st_project_members (project_id, user_id, role)
                 VALUES (?, ?, ?)`;
    db.query(sql, [project_id, user_id, role], (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });

      res.status(201).json({
        message: "✅ Member added successfully",
        member_id: result.insertId,
      });
    });
  });
};




export const getProjectMembers = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT pm.id, u.name, u.email, u.image, pm.role, pm.added_at
    FROM st_project_members pm
    JOIN st_users u ON pm.user_id = u.id
    WHERE pm.project_id = ?;
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching project members:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};


export const updateProjectMemberRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) return res.status(400).json({ message: "Role is required" });

  const validRoles = ["Owner", "Manager", "Editor", "Viewer"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  const sql = `UPDATE st_project_members SET role = ? WHERE id = ?`;

  db.query(sql, [role, id], (err, result) => {
    if (err) {
      console.error("❌ Error updating member role:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "✅ Member role updated successfully" });
  });
};


export const removeProjectMember = (req, res) => {
  const { projectId } = req.params;

  const sql = "DELETE FROM st_project_members WHERE project_id = ?";
  db.query(sql, [projectId], (err, result) => {
    if (err) {
      console.error("❌ Error removing member:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "🗑️ Member removed successfully" });
  });
};
