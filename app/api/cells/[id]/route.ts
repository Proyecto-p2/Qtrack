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
    const { id } = params;
    const body = await req.json();
    const {
      name,
      tribeName,
      agileCoachName,
      agileCoachUserId,
      costPerSprint,
      status,
    } = body;

    // Validar que al menos un campo venga para actualizar
    if (
      !name &&
      !tribeName &&
      !agileCoachName &&
      agileCoachUserId === undefined &&
      costPerSprint === undefined &&
      !status
    ) {
      return NextResponse.json(
        { message: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Verificar que la célula existe
    const [existing] = await db.execute(
      "SELECT id FROM cells WHERE id = ?",
      [id]
    );

    if ((existing as any[]).length === 0) {
      await db.end();
      return NextResponse.json(
        { message: "Célula no encontrada" },
        { status: 404 }
      );
    }

    // Construir query dinámica
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (tribeName !== undefined) {
      updates.push("tribeName = ?");
      values.push(tribeName);
    }
    if (agileCoachName !== undefined) {
      updates.push("agileCoachName = ?");
      values.push(agileCoachName);
    }
    if (agileCoachUserId !== undefined) {
      updates.push("agile_coach_user_id = ?");
      values.push(agileCoachUserId);
    }
    if (costPerSprint !== undefined) {
      updates.push("costPerSprint = ?");
      values.push(costPerSprint);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    values.push(id);

    const query = `UPDATE cells SET ${updates.join(", ")} WHERE id = ?`;

    const [result] = await db.execute(query, values);
    await db.end();

    return NextResponse.json(
      { message: "Célula actualizada exitosamente", data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando célula:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

