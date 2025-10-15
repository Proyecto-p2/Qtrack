import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Conexión a la DB
async function connectDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// GET - obtener miembros de una célula
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cellId = searchParams.get("cellId");

    if (!cellId) {
      return NextResponse.json({ message: "Falta el id de la célula" }, { status: 400 });
    }

    const db = await connectDB();
    const [rows] = await db.execute(
      "SELECT * FROM members WHERE cellId = ?",
      [cellId]
    );

    await db.end();

    return NextResponse.json({ members: rows }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo miembros:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - crear miembro
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cellId, name, knowledgeLine = "", role = "" } = body;

    if (!cellId || !name) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const db = await connectDB();
    const [result] = await db.execute(
      "INSERT INTO members (cellId, name, knowledgeLine, role) VALUES (?, ?, ?, ?)",
      [cellId, name, knowledgeLine, role]
    );

    await db.end();

    return NextResponse.json({ message: "Miembro creado", data: result }, { status: 201 });
  } catch (error) {
    console.error("Error creando miembro:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
