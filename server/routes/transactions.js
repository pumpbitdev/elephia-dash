import express from "express";
import { pool } from "../db/db.js";

const router = express.Router();

// --- Obtener TODAS las transacciones ---
router.get("/", async (req, res) => {
  try {
    const [transactions] = await pool.query("SELECT * FROM transactions ORDER BY created_at DESC");
    res.json(transactions);
  } catch (error) {
    console.error("❌ Error al obtener transacciones:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// --- Obtener las transacciones de UN usuario ---
router.get("/:telegram_id", async (req, res) => {
  const { telegram_id } = req.params;
  try {
    const [transactions] = await pool.query(
      "SELECT * FROM transactions WHERE user_telegram_id = ? ORDER BY created_at DESC",
      [telegram_id]
    );
    res.json(transactions);
  } catch (error) {
    console.error(`❌ Error al obtener transacciones para ${telegram_id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// --- Actualizar estado de una transacción ---
router.put("/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "El nuevo estado es requerido." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE transactions SET status = ? WHERE id = ?",
      [status, transactionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transacción no encontrada." });
    }

    res.json({ message: "Estado actualizado correctamente." });
  } catch (error) {
    console.error(`❌ Error al actualizar transacción ${transactionId}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
