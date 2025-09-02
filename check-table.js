const db = require('./lib/db.js');

(async () => {
  try {
    const result = await db.query('DESCRIBE usuarios');
    console.log('Estructura de la tabla usuarios:');
    console.table(result);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
