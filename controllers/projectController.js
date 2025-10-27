import db from "../db.js";
import fs from "fs";
import multer from "multer";
import path from "path";

// --- Ensure upload folder exists ---
const uploadDir = "project_logos";
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







export const getProjectsWithDetails = async (req, res) => {
  try {
    const { q, status } = req.query; // both optional query params
    const params = [];

    let sql = `
      SELECT 
        p.id AS project_id,
        p.name AS project_name,
        p.status AS project_status,
        p.description AS project_description,
        p.progress AS project_progress,
        p.due_date AS project_due_date,
        p.start_date AS project_start_date,
        p.priority AS project_priority,
        p.budget AS project_budget,
        p.owner_name AS project_owner_name,

        COUNT(DISTINCT t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS task_completed,

        COALESCE(
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', u2.id,
                'name', u2.name,
                'image', u2.image,
                'role', pm2.role
              )
            )
            FROM st_project_members pm2
            JOIN st_users u2 ON u2.id = pm2.user_id
            WHERE pm2.project_id = p.id
          ),
          JSON_ARRAY()
        ) AS users

      FROM st_projects p
      LEFT JOIN st_tasks t ON t.project_id = p.id
    `;

    const conditions = [];

    if (q && q.trim() !== "") {
      conditions.push(`p.name LIKE ?`);
      params.push(`%${q}%`);
    }

    if (status && status.trim() !== "") {
      conditions.push(`p.status = ?`);
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ` GROUP BY p.id;`;

    const [results] = await db.promise().query(sql, params);

    res.status(200).json(results);
  } catch (error) {
    console.error("ERROR fetching projects:", error);
    res.status(500).json({ error: error.message });
  }
};








export const getAllProjectswithuserId = (req, res) => {
  const { userId } = req.params
  const sql = `
  SELECT
  p.id AS project_id,
  p.name AS project_name,
  p.status AS project_status,
  p.description AS project_description,
  p.progress AS project_progress,
  p.due_date AS project_due_date,
  p.start_date AS project_start_date,
  p.priority AS project_priority,
  p.budget AS project_budget,
  p.owner_name AS project_owner_name,
  (SELECT COUNT(*) FROM st_tasks WHERE project_id = p.id) AS total_tasks,
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
FROM st_projects p
LEFT JOIN st_project_members pm ON pm.project_id = p.id
LEFT JOIN st_users u ON u.id = pm.user_id
WHERE p.id IN (
    SELECT project_id 
    FROM st_project_members 
    WHERE user_id = ?
)
GROUP BY p.id;
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};



export const createProject = (req, res) => {
  try {
    const {
      name,
      description,
      start_date,
      due_date,
      budget,
      currency,
      priority,
      progress = 0,
      owner_id,
      owner_name,
    } = req.body;

    const project_logo = req.file ? `project_logos/${req.file.filename}` : null;

    if (!name || !owner_id || !owner_name) {
      return res
        .status(400)
        .json({ message: "Name, owner_id, and owner_name are required" });
    }

    const sql = `
      INSERT INTO st_projects 
      (name, description, start_date, due_date, budget, currency, priority, progress, owner_id, owner_name, project_logo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name,
        description,
        start_date,
        due_date,
        budget,
        currency,
        priority,
        progress,
        owner_id,
        owner_name,
        project_logo,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ DB Insert Error:", err);
          return res
            .status(500)
            .json({ message: "Database error", error: err.message });
        }

        res.status(201).json({
          message: "✅ Project created successfully",
          project_id: result.insertId,
          file: project_logo,
        });
      }
    );
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { q } = req.query;

    let sql = `SELECT * FROM st_projects`;
    const params = [];

    if (q && q.trim() !== "") {
      sql += ` WHERE name LIKE ?`;
      const like = `%${q}%`;
      params.push(like);
    }
    const [results] = await db.promise().query(sql, params);

    res.status(200).json(results);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


export const updateProject = (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    start_date,
    due_date,
    budget,
    currency,
    priority,
    progress,
  } = req.body;

  const project_logo = req.file ? `project_logos/${req.file.filename}` : null;

  if (!id) return res.status(400).json({ message: "Project ID is required" });

  const sql = `
    UPDATE st_projects 
    SET 
      name = ?, 
      description = ?, 
      start_date = ?, 
      due_date = ?, 
      budget = ?, 
      currency = ?, 
      priority = ?, 
      progress = ?, 
      project_logo = COALESCE(?, project_logo)
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      description,
      start_date,
      due_date,
      budget,
      currency,
      priority,
      progress,
      project_logo,
      id,
    ],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Database update failed", error: err.message });

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Project not found" });

      res.status(200).json({
        message: "✅ Project updated successfully",
        file: project_logo,
      });
    }
  );
};

export const deleteProject = (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Project ID is required" });

  const sql = "DELETE FROM st_projects WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Database delete failed", error: err.message });

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "✅ Project deleted successfully" });
  });
};
