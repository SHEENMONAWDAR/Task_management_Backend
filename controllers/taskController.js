import db from "../db.js";


const updateProjectProgress = (projectId) => {
  const sql = `
    SELECT 
      ROUND(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)/COUNT(*)*100, 2) AS progress_percentage
    FROM st_tasks
    WHERE project_id = ?
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) return console.error("❌ Progress update error:", err);

    // SQL returns progress_percentage directly
    const progress = results[0].progress_percentage || 0;

    db.query(
      "UPDATE st_projects SET progress = ? WHERE id = ?",
      [progress, projectId],
      (err2) => {
        if (err2) console.error("❌ Error updating project progress:", err2);
        else console.log(`✅ Project ${projectId} progress updated to ${progress}%`);
      }
    );
  });
};


export const getAllTasks = (req, res) => {
  try {
    const sql = `
      SELECT t.*, p.name AS project_name, u.name AS assigned_user
      FROM st_tasks t
      LEFT JOIN st_projects p ON t.project_id = p.id
      LEFT JOIN st_users u ON t.assigned_to = u.id
    `;

    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(results)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getTaskById = (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM st_tasks WHERE id = ?";

    db.query(sql, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Task not found" });

      res.status(200).json(results[0]);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const createTask = (req, res) => {
  try {
    const {
      title,
      description,
      status = "todo",
      project_id,
      assigned_to,
      created_by,
      parent_task_id,
      due_date,
    } = req.body;

    if (!title || !project_id) {
      return res
        .status(400)
        .json({ message: "Title and project_id are required" });
    }

    const sql = `
      INSERT INTO st_tasks 
      (title, description, status, project_id, assigned_to, created_by, parent_task_id, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        title,
        description,
        status,
        project_id,
        assigned_to,
        created_by,
        parent_task_id,
        due_date,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Database error:", err);
          return res.status(500).json({ error: err.message });
        }

        updateProjectProgress(project_id);

        res.status(201).json({
          message: "✅ Task created successfully",
          taskId: result.insertId,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateTask = (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      project_id,
      assigned_to,
      parent_task_id,
      due_date,
    } = req.body;

    if (!id) return res.status(400).json({ message: "Task ID is required" });

    const sql = `
      UPDATE st_tasks 
      SET title = ?, description = ?, status = ?, assigned_to = ?, parent_task_id = ?, due_date = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [title, description, status, assigned_to, parent_task_id, due_date, id],
      (err, result) => {
        if (err) {
          console.error("❌ Database error:", err);
          return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Task not found" });

        if (project_id) updateProjectProgress(project_id);

        res.status(200).json({ message: "✅ Task updated successfully" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteTask = (req, res) => {
  try {
    const { id } = req.params;
    const { project_id } = req.body;

    if (!id) return res.status(400).json({ message: "Task ID is required" });

    const sql = `DELETE FROM st_tasks WHERE id = ?`;

    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Task not found" });

      if (project_id) updateProjectProgress(project_id);

      res.status(200).json({ message: "✅ Task deleted successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
