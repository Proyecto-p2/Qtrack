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

// Crear nueva línea
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, descripcion, categoria, objetivos, creada_por } = body;

    if (!nombre) {
      return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 });
    }

    const db = await connectDB();

    const [result] = await db.execute(
      `INSERT INTO knowledge_lines (nombre, descripcion, categoria, objetivos, creada_por)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion || "", categoria || "", objetivos || "", creada_por || "desconocido"]
    );

    await db.end();

    return NextResponse.json({ message: "Línea creada", data: result }, { status: 201 });
  } catch (error) {
    console.error("Error creando línea de conocimiento:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// Obtener todas las líneas
export async function GET() {
  try {
    const db = await connectDB();
    const [rows] = await db.execute("SELECT * FROM knowledge_lines ORDER BY creada_en DESC");
    await db.end();
    return NextResponse.json({ knowledgeLines: rows }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo líneas de conocimiento:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// Eliminar línea por id
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Falta el id de la línea" }, { status: 400 });
    }

    const db = await connectDB();
    const [result] = await db.execute("DELETE FROM knowledge_lines WHERE id = ?", [id]);
    await db.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: `No se encontró la línea con id ${id}` }, { status: 404 });
    }

    return NextResponse.json({ message: "Línea eliminada" }, { status: 200 });
  } catch (error) {
    console.error("Error eliminando línea de conocimiento:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
