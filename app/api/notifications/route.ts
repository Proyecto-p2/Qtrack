import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { auth } from "@/lib/auth";

async function connectDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const db = await connectDB();

    // Obtener ID del usuario
    const [userRows] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email]
    );
    const userId = (userRows as any[])[0]?.id;

    // Obtener notificaciones
    const [notifications] = await db.execute(
      `SELECT n.*, m.name as memberName 
       FROM notifications n 
       JOIN members m ON n.memberId = m.id 
       WHERE n.userId = ? 
       ORDER BY n.createdAt DESC`,
      [userId]
    );

    await db.end();
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { notificationId } = await req.json();

    const db = await connectDB();
    await db.execute(
      "UPDATE notifications SET isRead = TRUE WHERE id = ?",
      [notificationId]
    );
    await db.end();

    return NextResponse.json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("Error actualizando notificación:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
