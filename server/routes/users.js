import express from "express";
import { pool } from "../db/db.js";

const router = express.Router();

// --- Obtener TODOS los usuarios ---
router.get("/", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.json(users);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// --- Obtener un usuario por su ID de Telegram ---
router.get("/:telegram_id", async (req, res) => {
  const { telegram_id } = req.params;
  try {
    const [user] = await pool.query(
      "SELECT * FROM users WHERE telegram_id = ?",
      [telegram_id]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json(user[0]);
  } catch (error) {
    console.error(`❌ Error al obtener usuario ${telegram_id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
