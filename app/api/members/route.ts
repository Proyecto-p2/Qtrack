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
    
    // JOIN con usuarios para obtener información completa
    const [rows] = await db.execute(`
      SELECT 
        m.*,
        u.nombre as user_full_name,
        u.usuario as user_username,
        u.correo as user_email,
        u.rol as user_role
      FROM members m
      LEFT JOIN usuarios u ON m.user_id = u.id
      WHERE m.cellId = ?
    `, [cellId]);

    await db.end();

    // Normalizar respuesta
    const normalized = (rows as any[]).map((row) => ({
      id: row.id,
      name: row.user_full_name || row.name, // Priorizar nombre del usuario
      role: row.role,
      knowledgeLine: row.knowledgeLine,
      cellId: row.cellId,
      workload: row.workload,
      currentLoad: row.currentLoad,
      user_id: row.user_id,
      user_info: row.user_id ? {
        id: row.user_id,
        fullName: row.user_full_name,
        username: row.user_username,
        email: row.user_email,
        role: row.user_role
      } : null
    }));

    return NextResponse.json({ members: normalized }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo miembros:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - crear miembro
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cellId, name, knowledgeLine = "", role = "", workload = 0, userId } = body;

    if (!cellId || (!name && !userId)) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const db = await connectDB();
    
    // Si tenemos userId, usarlo; si no, usar el método legacy
    if (userId) {
      const [result] = await db.execute(
        "INSERT INTO members (cellId, name, knowledgeLine, role, workload, user_id) VALUES (?, ?, ?, ?, ?, ?)",
        [cellId, name, knowledgeLine, role, workload, userId]
      );
      await db.end();
      return NextResponse.json({ message: "Miembro creado", data: result }, { status: 201 });
    } else {
      // Método legacy
      const [result] = await db.execute(
        "INSERT INTO members (cellId, name, knowledgeLine, role, workload) VALUES (?, ?, ?, ?, ?)",
        [cellId, name, knowledgeLine, role, workload]
      );
      await db.end();
      return NextResponse.json({ message: "Miembro creado", data: result }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creando miembro:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
