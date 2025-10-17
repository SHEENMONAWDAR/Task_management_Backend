import db from "../db.js";


export const getSubtasks = (req, res) => {
  const { parent_task_id } = req.params;
  const sql = "SELECT * FROM st_tasks WHERE parent_task_id = ?";

  db.query(sql, [parent_task_id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching subtasks:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }

    res.status(200).json(results);
  });
};


export const createSubtask = (req, res) => {
  try {
    const {
      title,
      description,
      status = "todo",
      project_id,
      created_by,
      due_date,
      parent_task_id,
    } = req.body;

    if (!title || !project_id || !parent_task_id) {
      return res.status(400).json({
        message: "Title, project_id, and parent_task_id are required",
      });
    }

    const sql = `
      INSERT INTO st_tasks 
      (title, description, status, project_id, created_by, parent_task_id, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [title, description, status, project_id, created_by, parent_task_id, due_date],
      (err, result) => {
        if (err) {
          console.error("❌ Error creating subtask:", err);
          return res.status(500).json({ message: "Database error", error: err.message });
        }

        res.status(201).json({
          message: "✅ Subtask created successfully",
          subtask_id: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateSubtask = (req, res) => {
  const { id } = req.params;
  const { title, description, status, due_date } = req.body;

  const sql = `
    UPDATE st_tasks
    SET title = ?, description = ?, status = ?, due_date = ?
    WHERE id = ? AND parent_task_id IS NOT NULL
  `;

  db.query(sql, [title, description, status, due_date, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Subtask not found" });

    res.status(200).json({ message: "Subtask updated successfully" });
  });
};


export const deleteSubtask = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM st_tasks WHERE id = ? AND parent_task_id IS NOT NULL";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting subtask:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Subtask not found or invalid" });

    res.status(200).json({ message: "✅ Subtask deleted successfully" });
  });
};