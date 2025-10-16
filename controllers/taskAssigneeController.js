import db from "../db.js";


export const addTaskAssignee = (req, res) => {
  const { task_id, user_id } = req.body;

  if (!task_id || !user_id) {
    return res.status(400).json({ message: "task_id and user_id are required" });
  }

  const sql = `INSERT INTO st_task_assignees (task_id, user_id) VALUES (?, ?)`;

  db.query(sql, [task_id, user_id], (err, result) => {
    if (err) {
      console.error("❌ Error adding assignee:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(201).json({
      message: "✅ Assignee added successfully",
      assignee_id: result.insertId,
    });
  });
};


export const getTaskAssignees = (req, res) => {
  const { taskId } = req.params;

  const sql = `
    SELECT ta.id, u.name, u.email, u.image
    FROM st_task_assignees ta
    JOIN st_users u ON ta.user_id = u.id
    WHERE ta.task_id = ?
  `;

  db.query(sql, [taskId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching assignees:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};


export const removeTaskAssignee = (req, res) => {
  const { id } = req.params; 

  const sql = "DELETE FROM st_task_assignees WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error removing assignee:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assignee not found" });
    }

    res.status(200).json({ message: "🗑️ Assignee removed successfully" });
  });
};


export const getUserAssignedTasks = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT t.id, t.title, t.status, t.due_date, p.name AS project_name
    FROM st_tasks t
    JOIN st_task_assignees ta ON t.id = ta.task_id
    JOIN st_projects p ON t.project_id = p.id
    WHERE ta.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user's tasks:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};
