import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qtrackdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para ejecutar consultas
export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  }
}

// Función para obtener una sola fila
export async function queryOne(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    throw error;
  }
}

// Función para iniciar una transacción
export async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexión a MySQL exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
}

// Función para cerrar el pool de conexiones
export async function closeConnection() {
  try {
    await pool.end();
    console.log('🔒 Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error cerrando conexiones:', error);
  }
}

// Exportar el pool para casos específicos
export { pool };

// Exportar por defecto las funciones
const db = {
  query,
  queryOne,
  transaction,
  testConnection,
  closeConnection,
  pool
};

export default db;