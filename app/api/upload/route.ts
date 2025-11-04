import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Conexión a la base de datos
async function connectDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// Obtener todos los registros
export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.execute(`
      SELECT id, assigned_to, state, story_points, iteration_path, celula, sprint, created_at
      FROM excel_data ORDER BY id DESC
    `);
    await db.end();
    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error obteniendo datos:", error.message);
    return NextResponse.json(
      { message: "Error interno al obtener datos", error: error.message },
      { status: 500 }
    );
  }
}

// Guardar uno o varios registros
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Datos recibidos del cliente:", body);

    const db = await connectDB();

    // Si el frontend envía una sola fila, la convertimos en arreglo
    const dataArray = Array.isArray(body) ? body : [body];

    for (const item of dataArray) {
      const {
        assignedTo,
        state,
        storyPoints,
        iterationPath,
        celula,
        sprint,
      } = item;

      if (!assignedTo || !state) {
        console.warn("⚠️ Fila ignorada: faltan datos obligatorios", item);
        continue;
      }

      console.log("💾 Insertando fila:", {
        assignedTo,
        state,
        storyPoints,
        iterationPath,
        celula,
        sprint,
      });

      await db.execute(
        `
        INSERT INTO excel_data (assigned_to, state, story_points, iteration_path, celula, sprint)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [assignedTo, state, storyPoints, iterationPath, celula, sprint]
      );
    }

    await db.end();

    return NextResponse.json(
      { message: `✅ ${dataArray.length} filas guardadas correctamente.` },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error guardando datos:", error.message);
    return NextResponse.json(
      { message: "Error al guardar los datos", error: error.message },
      { status: 500 }
    );
  }
}
