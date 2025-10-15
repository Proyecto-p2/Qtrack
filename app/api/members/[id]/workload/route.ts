import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function connectDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { currentLoad } = await req.json();
    const memberId = params.id;

    if (currentLoad === undefined || currentLoad === null) {
      return NextResponse.json(
        { message: "Falta el campo currentLoad" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Obtener datos del miembro
    const [memberRows] = await db.execute(
      `SELECT m.*, c.agileCoachName, c.tribeName
       FROM members m
       JOIN cells c ON m.cellId = c.id
       WHERE m.id = ?`,
      [memberId]
    );

    const member = (memberRows as any[])[0];
    if (!member) {
      await db.end();
      return NextResponse.json(
        { message: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar carga actual
    await db.execute(
      "UPDATE members SET currentLoad = ? WHERE id = ?",
      [currentLoad, memberId]
    );

    let notificationSent = false;

    // Verificar si completó o excedió la carga
    if (currentLoad >= member.workload) {
      const type = currentLoad > member.workload ? "load_exceeded" : "load_complete";
      const message =
        type === "load_exceeded"
          ? `${member.name} ha excedido su carga asignada (${member.workload} pts). Carga actual: ${currentLoad} pts.`
          : `${member.name} ha completado su carga asignada de ${member.workload} pts.`;

      // Obtener usuarios admin y agile coach (tabla se llama "usuarios")
      const [users] = await db.execute(
        `SELECT id FROM usuarios WHERE rol IN ('admin', 'agile_coach')`
      );

      // Crear notificaciones
      for (const user of users as any[]) {
        await db.execute(
          `INSERT INTO notifications (userId, memberId, message, type) VALUES (?, ?, ?, ?)`,
          [user.id, memberId, message, type]
        );
      }

      notificationSent = true;
    }

    await db.end();

    return NextResponse.json({
      message: "Carga actualizada exitosamente",
      notificationSent,
    });
  } catch (error) {
    console.error("Error actualizando carga:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: String(error) },
      { status: 500 }
    );
  }
}
