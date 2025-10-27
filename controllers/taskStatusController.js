import express from "express";
import db from "../db.js";

export const getTaskStatusMonthly = async (req, res) => {
  const { userId } = req.params;

  let sql = `
SELECT 
    MONTHNAME(t.created_at) AS month,
    COUNT(t.id) AS total_tasks,
    SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) AS inProgress,
    SUM(CASE WHEN t.status NOT IN ('done', 'in-progress') THEN 1 ELSE 0 END) AS others
FROM st_tasks t
INNER JOIN st_task_assignees a ON t.id = a.task_id
WHERE a.user_id = ?
GROUP BY MONTH(t.created_at), MONTHNAME(t.created_at)
ORDER BY MONTH(t.created_at);
  `;

 

  try {
    const [results] = await db.promise().query(sql, [userId]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching monthly progress:", error);
    res.status(500).json({ message: "Error fetching monthly progress", error });
  }
};
export const getTaskStatusMonthlyByprojectId = async (req, res) => {
  const { projectId } = req.params;

  let sql = `
SELECT 
    MONTHNAME(t.created_at) AS month,
    COUNT(t.id) AS total_tasks,
    SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) AS inProgress,
    SUM(CASE WHEN t.status NOT IN ('done', 'in-progress') THEN 1 ELSE 0 END) AS others
FROM st_tasks t
WHERE t.project_id = ?
GROUP BY MONTH(t.created_at), MONTHNAME(t.created_at)
ORDER BY MONTH(t.created_at);
  `;

 

  try {
    const [results] = await db.promise().query(sql, [projectId]);
    res.json(results);
  } catch (error) {
    console.error("Error fetching monthly progress:", error);
    res.status(500).json({ message: "Error fetching monthly progress", error });
  }
};


