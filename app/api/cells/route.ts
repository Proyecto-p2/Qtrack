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
    const { name, tribeName, agileCoachName, costPerSprint = 0.0, status = "planning" } = body;

    if (!name || !tribeName || !agileCoachName || costPerSprint === undefined) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const db = await connectDB();

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
    const [rows] = await db.execute("SELECT * FROM cells");
    await db.end();

    const normalized = (rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      tribeName: row.tribeName,
      agileCoachName: row.agileCoachName,
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
