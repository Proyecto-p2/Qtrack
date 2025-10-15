// app/api/cells/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Conexión a la BD
async function connectDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// Crear célula
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, tribeName, agileCoachName, agileCoachUserId, costPerSprint = 0.0, status = "planning" } = body;

    if (!name || !tribeName || (!agileCoachName && !agileCoachUserId) || costPerSprint === undefined) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Si tenemos agileCoachUserId, usarlo; si no, usar el método legacy
    if (agileCoachUserId) {
      const [result] = await db.execute(
        `INSERT INTO cells (name, tribeName, agileCoachName, agile_coach_user_id, costPerSprint, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, tribeName, agileCoachName, agileCoachUserId, costPerSprint, status]
      );
      await db.end();
      return NextResponse.json(
        { message: "Célula creada exitosamente", data: result },
        { status: 201 }
      );
    } else {
      // Método legacy
      const [result] = await db.execute(
        `INSERT INTO cells (name, tribeName, agileCoachName, costPerSprint, status)
         VALUES (?, ?, ?, ?, ?)`,
        [name, tribeName, agileCoachName, costPerSprint, status]
      );
      await db.end();
      return NextResponse.json(
        { message: "Célula creada exitosamente", data: result },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creando célula:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Obtener todas las células
export async function GET() {
  try {
    const db = await connectDB();
    
    // JOIN con usuarios para obtener información completa del agile coach
    const [rows] = await db.execute(`
      SELECT 
        c.*,
        u.nombre as coach_full_name,
        u.usuario as coach_username,
        u.correo as coach_email
      FROM cells c
      LEFT JOIN usuarios u ON c.agile_coach_user_id = u.id
    `);
    
    await db.end();

    const normalized = (rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      tribeName: row.tribeName,
      agileCoachName: row.coach_full_name || row.agileCoachName, // Priorizar nombre del usuario
      agile_coach_user_id: row.agile_coach_user_id,
      agileCoach_info: row.agile_coach_user_id ? {
        id: row.agile_coach_user_id,
        fullName: row.coach_full_name,
        username: row.coach_username,
        email: row.coach_email
      } : null,
      costPerSprint: row.costPerSprint,
      status: row.status,
      createdAt: row.createdAt,
    }));

    return NextResponse.json({ cells: normalized }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo células:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Eliminar célula por nombre
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { message: "Falta el nombre de la célula" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const [result] = await db.execute("DELETE FROM cells WHERE name = ?", [name]);
    await db.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { message: `No se encontró la célula "${name}"` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `Célula "${name}" eliminada exitosamente` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error eliminando célula:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
