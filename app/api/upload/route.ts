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

// Guardar uno o varios registros y agregar nuevas células y sprints
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Datos recibidos del cliente:", body);

    const db = await connectDB();

    const dataArray = Array.isArray(body) ? body : [body];

    for (const item of dataArray) {
      const {
        assignedTo,
        state,
        storyPoints,
        iterationPath,
        celula,
        sprint,
        tribeName,
        agileCoachName,
        quarter,        // <-- nuevo campo para sprint
        startDate,      // <-- nuevo campo para sprint
        endDate,        // <-- nuevo campo para sprint
      } = item;

      if (!assignedTo || !state) {
        console.warn("⚠️ Fila ignorada: faltan datos obligatorios", item);
        continue;
      }

      let cellId = null;

      // 1️⃣ Agregar célula nueva si no existe
      if (celula) {
        const [existing] = await db.execute(
          `SELECT id FROM cells WHERE name = ?`,
          [celula]
        );

        if ((existing as any[]).length === 0) {
          const [result] = await db.execute(
            `INSERT INTO cells (name, tribeName, agileCoachName, costPerSprint, status) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              celula,
              tribeName || "Sin tribu",
              agileCoachName || "Sin coach",
              0.0,
              "planning"
            ]
          );
          cellId = (result as any).insertId;
          console.log("✅ Nueva célula agregada:", celula);
        } else {
          cellId = (existing as any[])[0].id;
        }
      }

      // 2️⃣ Agregar sprint nuevo si no existe
      if (sprint && cellId) {
        const [existingSprint] = await db.execute(
          `SELECT id FROM sprints WHERE name = ? AND cell_id = ?`,
          [sprint, cellId]
        );

        if ((existingSprint as any[]).length === 0) {
          await db.execute(
            `INSERT INTO sprints (cell_id, name, quarter, start_date, end_date, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              cellId,
              sprint,
              quarter || "Q1",
              startDate || new Date().toISOString().split('T')[0],
              endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 días por defecto
              "planning"
            ]
          );
          console.log("✅ Nuevo sprint agregado:", sprint);
        }
      }

      // 3️⃣ Insertar fila en excel_data
      await db.execute(
        `
        INSERT INTO excel_data 
          (assigned_to, state, story_points, iteration_path, celula, sprint)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          assignedTo ?? null,
          state ?? null,
          storyPoints ?? null,
          iterationPath ?? null,
          celula ?? null,
          sprint ?? null,
        ]
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