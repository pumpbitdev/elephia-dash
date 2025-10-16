import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db/db.js";
import transactionsRouter from "./routes/transactions.js";

dotenv.config();

// --- Configuración base ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors());              // Habilita CORS para desarrollo
app.use(express.json());      // Permite JSON en el cuerpo
app.use(express.static(path.join(__dirname, "../client"))); // Sirve tu panel

// --- Rutas API ---
app.use("/api/transactions", transactionsRouter);

// --- Ruta raíz (panel) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// --- Inicia el servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
