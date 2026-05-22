import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

/**
 * Get a connection from the pool
 * @returns {Promise<Connection>}
 */
export async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

/**
 * Execute a query with parameters
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
export async function executeQuery(query, params = []) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Execute a query and return results with connection info
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>}
 */
export async function executeQueryWithInfo(query, params = []) {
  const connection = await getConnection();
  try {
    const [rows, fields] = await connection.execute(query, params);
    return { rows, fields, affectedRows: rows.length };
  } finally {
    connection.release();
  }
}

/**
 * Begin a transaction
 * @returns {Promise<Connection>}
 */
export async function beginTransaction() {
  const connection = await getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Commit a transaction
 * @param {Connection} connection
 */
export async function commitTransaction(connection) {
  await connection.commit();
  connection.release();
}

/**
 * Rollback a transaction
 * @param {Connection} connection
 */
export async function rollbackTransaction(connection) {
  await connection.rollback();
  connection.release();
}

export default pool;
