// controllers/taskController.js
import db from "../db.js";
import fs from "fs";
import multer from "multer";
import path from "path";



// --- Ensure upload folder exists ---
const uploadDir = "task_attachments";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created upload directory:", uploadDir);
}

// --- File Upload Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

/**
 * Helper: Update project progress percentage based on task statuses
 */
const updateProjectProgress = async (projectId) => {
  try {
    const sql = `
      SELECT 
        ROUND(
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100,
          2
        ) AS progress_percentage
      FROM st_tasks
      WHERE project_id = ?
    `;

    const [results] = await db.promise().query(sql, [projectId]);
    const progress = results[0]?.progress_percentage || 0;

    await db.promise().query("UPDATE st_projects SET progress = ? WHERE id = ?", [
      progress,
      projectId,
    ]);

    console.log(`✅ Project ${projectId} progress updated to ${progress}%`);
    return progress;
  } catch (err) {
    console.error("❌ Error updating project progress:", err);
    throw err;
  }
};

/**
 * Get all tasks (includes Project_types and Attachments)
 */
export const getAllTasks = async (req, res) => {
  try {
    const sql = `
SELECT 
  t.*, 
  p.name AS project_name, 
  COALESCE(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'image', u.image
      )
    ),
    JSON_ARRAY()
  ) AS users
FROM st_tasks t
LEFT JOIN st_projects p ON t.project_id = p.id
LEFT JOIN st_task_assignees au ON t.id = au.task_id
LEFT JOIN st_users u ON au.user_id = u.id
GROUP BY t.id;
    `;

    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ getAllTasks error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getTasksByStatustodo = async (req, res) => {
  try {
    const sql = `
SELECT 
  t.*, 
  p.progress AS project_progress,
  p.name AS project_name,
  p.progress AS task_progress,
  t.Attachments AS task_attachments,
  COALESCE(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'image', u.image
      )
    ),
    JSON_ARRAY()
  ) AS users,
  COUNT(*) OVER() AS total_tasks
FROM st_tasks t
LEFT JOIN st_projects p ON t.project_id = p.id
LEFT JOIN st_task_assignees au ON t.id = au.task_id
LEFT JOIN st_users u ON au.user_id = u.id
WHERE t.status = 'todo'
GROUP BY t.id;

    `;

    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ getTasksByStatustodo error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getTasksByStatusinprogress = async (req, res) => {
  try {
    const sql = `
SELECT 
  t.*, 
  p.progress AS project_progress,
  p.name AS project_name, 
    p.progress AS task_progress,
    COALESCE(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'image', u.image
      )
    ),
    JSON_ARRAY()
  ) AS users,
  COUNT(t.id) OVER() AS total_tasks
FROM st_tasks t
LEFT JOIN st_projects p ON t.project_id = p.id
LEFT JOIN st_task_assignees au ON t.id = au.task_id
LEFT JOIN st_users u ON au.user_id = u.id
where t.status = 'in-progress'
GROUP BY t.id;
    `;

    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ getTasksByStatustodo error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const getTasksByStatusdone = async (req, res) => {
  try {
    const sql = `
SELECT 
  t.*, 
  p.progress AS project_progress,
  p.name AS project_name, 
  p.progress AS task_progress,
  COALESCE(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'image', u.image
      )
    ),
    JSON_ARRAY()
  ) AS users,
  COUNT(t.id) OVER() AS total_tasks
FROM st_tasks t
LEFT JOIN st_projects p ON t.project_id = p.id
LEFT JOIN st_task_assignees au ON t.id = au.task_id
LEFT JOIN st_users u ON au.user_id = u.id
where t.status = 'done'
GROUP BY t.id;
    `;

    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ getTasksByStatustodo error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single task by ID
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db
      .promise()
      .query("SELECT * FROM st_tasks WHERE id = ?", [id]);

    if (results.length === 0)
      return res.status(404).json({ message: "Task not found" });

    res.status(200).json(results[0]);
  } catch (error) {
    console.error("❌ getTaskById error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new task (includes Project_types, Attachments)
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      Project_types,
      status = "todo",
      project_id,
      created_by,
      parent_task_id,
      due_date,
      priority
    } = req.body;
    const Attachments = req.file ? `task_attachments/${req.file.filename}` : null;
    if (!title || !project_id) {
      return res
        .status(400)
        .json({ message: "Title and project_id are required" });
    }

    const sql = `
  INSERT INTO st_tasks 
    (title, description, Project_types, Attachments, status, project_id, created_by, parent_task_id, due_date, priority)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

    const [result] = await db.promise().query(sql, [
      title,
      description,
      Project_types || null,
      Attachments || null,
      status,
      project_id,
      created_by || null,
      parent_task_id || null,
      due_date || null,
      priority || "low",
    ]);




    // Update project progress after creating task
    const progress = await updateProjectProgress(project_id);

    res.status(201).json({
      message: "✅ Task created successfully",
      taskId: result.insertId,
      progressUpdated: progress,
    });
  } catch (error) {
    console.error("❌ createTask error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update existing task (can update Project_types & Attachments)
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      Project_types,
      status,
      project_id,
      assigned_to,
      parent_task_id,
      due_date,
    } = req.body;
    const Attachments = req.file ? `task_attachments/${req.file.filename}` : null;
    if (!id) return res.status(400).json({ message: "Task ID is required" });

    const sql = `
      UPDATE st_tasks 
      SET 
        title = ?, 
        description = ?, 
        Project_types = ?, 
        Attachments = ?, 
        status = ?, 
        assigned_to = ?, 
        parent_task_id = ?, 
        due_date = ?, 
        project_id = ?
      WHERE id = ?
    `;

    const [result] = await db.promise().query(sql, [
      title || null,
      description || null,
      Project_types || null,
      Attachments || null,
      status || null,
      assigned_to || null,
      parent_task_id || null,
      due_date || null,
      project_id || null,
      id,
    ]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Task not found" });

    // If project_id passed or task belongs to a project, update progress.
    // Prefer to use provided project_id; if not provided, look up the task's project_id.
    let projIdToUpdate = project_id;
    if (!projIdToUpdate) {
      const [rows] = await db
        .promise()
        .query("SELECT project_id FROM st_tasks WHERE id = ?", [id]);
      projIdToUpdate = rows[0]?.project_id;
    }

    const progress = projIdToUpdate
      ? await updateProjectProgress(projIdToUpdate)
      : null;

    res.status(200).json({
      message: "✅ Task updated successfully",
      progressUpdated: progress,
    });
  } catch (error) {
    console.error("❌ updateTask error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete task by ID (fetches project_id first to update project progress)
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Task ID is required" });

    // Get project_id before deletion
    const [rows] = await db
      .promise()
      .query("SELECT project_id FROM st_tasks WHERE id = ?", [id]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Task not found" });

    const project_id = rows[0].project_id;

    // Delete the task
    const [result] = await db
      .promise()
      .query("DELETE FROM st_tasks WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Task not found" });

    const progress = project_id ? await updateProjectProgress(project_id) : null;

    res.status(200).json({
      message: "✅ Task deleted successfully",
      progressUpdated: progress,
    });
  } catch (error) {
    console.error("❌ deleteTask error:", error);
    res.status(500).json({ error: error.message });
  }
};
