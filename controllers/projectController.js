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

// --- Controller Functions ---

export const getProjectsWithDetails = (req, res) => {
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
GROUP BY p.id;
`;


  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results)
  });
};






export const getAllProjectswithuserId = (req, res) => {
  const {userId} = req.params
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
  db.query(sql,[userId], (err, results) => {
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

export const getProject = (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "Project ID is required" });

  const sql = "SELECT * FROM st_projects WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err.message });

    if (results.length === 0)
      return res.status(404).json({ message: "Project not found" });

    res.status(200).json({
      message: "✅ Project fetched successfully",
      data: results[0],
    });
  });
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
