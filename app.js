import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// --- CONFIGURACIÓN INICIAL ---
const app = express();
const PORT = process.env.PORT || 3000; // Usaremos el puerto 3000 para el panel

// --- CONEXIÓN A LA BASE DE DATOS ---
// Asegúrate de que estas variables de entorno existan en tu archivo .env
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

// Endpoint para obtener TODAS las transacciones
app.get('/api/transactions', async (req, res) => {
  try {
    // 1. Obtener una conexión del pool (esto lo maneja mysql2/promise)
    console.log("Petición recibida en /api/transactions");

    // 2. Ejecutar la consulta SQL aquí
    const [transactions] = await pool.query('SELECT * FROM transactions;');

    // 3. Enviar los resultados como JSON
    res.json(transactions);

  } catch (error) {
    console.error("Error al obtener las transacciones:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor del panel corriendo en http://localhost:${PORT}`);
});