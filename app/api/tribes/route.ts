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

// POST - Crear nueva tribu
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description = "", leadName } = body;

    if (!name || !leadName) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios (name, leadName)" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const [result] = await db.execute(
      `INSERT INTO tribes (name, description, leadName) VALUES (?, ?, ?)`,
      [name, description, leadName]
    );

    await db.end();

    return NextResponse.json(
      { message: "Tribu creada exitosamente", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando tribu:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET - Listar tribus
export async function GET() {
  try {
    const db = await connectDB();

    const [rows] = await db.execute("SELECT * FROM tribes");

    await db.end();

    // Normalizar respuesta
    const normalized = (rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      leadName: row.leadName || row.lead_name,
      createdAt: row.createdAt || row.created_at,
    }));

    return NextResponse.json({ tribes: normalized }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo tribus:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const name = url.searchParams.get("name")

    if (!name) {
      return NextResponse.json({ message: "Falta el nombre de la tribu" }, { status: 400 })
    }

    const db = await connectDB()
    const [result] = await db.execute("DELETE FROM tribes WHERE name = ?", [name])
    await db.end()

    return NextResponse.json({ message: "Tribu eliminada correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error eliminando tribu:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
