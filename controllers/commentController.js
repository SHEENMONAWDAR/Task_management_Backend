import db from "../db.js";


export const createComment = (req, res) => {
    try {
        const {
            task_id,
            user_id,
            content
        } = req.body

        if (!task_id || !user_id || !content) {
            return res.status(400).json({ message: "task_id,user_is,content are required" })
        }

        const sql = `
        INSERT INTO st_comments
        (task_id,user_id,content)
        VALUES (?,?,?)
        `;

        db.query(sql, [task_id, user_id, content], (err, result) => {
            if (err) {
                console.error("❌ DB Insert Error:", err);
                return res
                    .status(500)
                    .json({ message: "Database error", error: err.message });
            }
            res.status(201).json({
                message: "✅ Comment created successfully",
                Comment_id: result.insertId
            });
        })


    } catch (error) {
        console.error("❌ Error creating Comment:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

export const getComment = (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).json({ message: "Task ID is required" });

        const sql = `
            SELECT 
                cm.id, 
                u.name, 
                u.image, 
                cm.content,
                cm.created_at
            FROM st_comments cm
            JOIN st_users u ON cm.user_id = u.id
            WHERE cm.task_id = ?
            ORDER BY cm.created_at ASC
        `;

        db.query(sql, [id], (err, results) => {
            if (err) 
                return res.status(500).json({ message: "Database error", error: err.message });

            // Always return results, even if empty
            res.status(200).json({
                message: "✅ Comments fetched successfully",
                data: results, // will be [] if no comments
            });
        });
    } catch (error) {
        console.error("❌ Error Getting Comment:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
}

