import express from "express";
import { pool } from "../db/db.js";

const router = express.Router();

// --- Obtener todos los métodos de pago de un usuario ---
router.get("/:telegram_id", async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const [methods] = await pool.query(
      "SELECT * FROM payment_methods WHERE user_telegram_id = ?",
      [telegram_id]
    );
    res.json(methods);
  } catch (error) {
    console.error(`❌ Error al obtener métodos de pago para ${telegram_id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// --- (Opcional futuro) Crear, editar o eliminar métodos de pago ---
// router.post("/", async (req, res) => { ... });
// router.put("/:id", async (req, res) => { ... });
// router.delete("/:id", async (req, res) => { ... });

export default router;
