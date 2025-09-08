// scripts/check-database.js
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qtrackdb'
};

async function checkAndCreateTables() {
  let connection;
  try {
    console.log('🔌 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa');

    // Verificar si la tabla sprints existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'sprints'"
    );

    if (tables.length === 0) {
      console.log('⚠️  Tabla sprints no encontrada. Creando...');
      
      // Leer y ejecutar el script de creación de sprints
      const scriptPath = path.join(__dirname, '03-sprints-table.sql');
      const scriptContent = await fs.readFile(scriptPath, 'utf8');
      
      // Dividir el script en consultas individuales
      const queries = scriptContent
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      for (const query of queries) {
        await connection.execute(query);
      }
      
      console.log('✅ Tabla sprints creada exitosamente');
    } else {
      console.log('✅ Tabla sprints ya existe');
    }

    // Verificar si la tabla q_configurations existe
    const [qConfigTables] = await connection.execute(
      "SHOW TABLES LIKE 'q_configurations'"
    );

    if (qConfigTables.length === 0) {
      console.log('⚠️  Tabla q_configurations no encontrada');
      console.log('💡 Por favor, ejecuta el script 01-database-schema.sql');
    } else {
      console.log('✅ Tabla q_configurations existe');
    }

    console.log('🎉 Verificación de base de datos completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Verifica las credenciales de la base de datos en el archivo .env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 La base de datos no existe. Créala primero.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  checkAndCreateTables();
}

module.exports = { checkAndCreateTables };
