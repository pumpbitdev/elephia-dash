import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// --- CONFIGURACIÓN INICIAL ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON
app.use(express.json());

// --- CONEXIÓN A LA BASE DE DATOS ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- RUTAS DE LA API ---

// Ruta para servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para obtener TODAS las transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    const [transactions] = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(transactions);
  } catch (error) {
    console.error("Error al obtener las transacciones:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Endpoint para obtener las transacciones de UN usuario
app.get('/api/transactions/:telegram_id', async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const [transactions] = await pool.query('SELECT * FROM transactions WHERE user_telegram_id = ? ORDER BY created_at DESC', [telegram_id]);
    res.json(transactions);
  } catch (error) {
    console.error(`Error al obtener transacciones para ${req.params.telegram_id}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// --- Endpoint NUEVO para actualizar el estado de una transacción ---
app.put('/api/transactions/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body; // Recibimos el nuevo estado desde el frontend

    if (!status) {
      return res.status(400).json({ error: 'El nuevo estado es requerido.' });
    }

    const [result] = await pool.query(
      'UPDATE transactions SET status = ? WHERE id = ?',
      [status, transactionId]
    );

    if (result.affectedRows === 0) {
      // Si no se afectó ninguna fila, significa que la transacción no se encontró
      return res.status(404).json({ error: 'Transacción no encontrada.' });
    }
    
    // Enviamos una respuesta exitosa
    res.json({ message: 'Estado actualizado correctamente' });

  } catch (error) {
    console.error(`Error al actualizar la transacción ${req.params.transactionId}:`, error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor del panel corriendo en http://localhost:${PORT}`);
});
