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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      tribeName,
      agileCoachName,
      productOwnerName,
      memberCount = 0,
      avgVelocity = 0,
      currentSprintPoints = 0,
      costPerSprint = 0.0,
      status = "planning",
    } = body;

    if (!name || !tribeName || !agileCoachName || !productOwnerName) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const [result] = await db.execute(
      `INSERT INTO cells 
        (name, tribeName, agileCoachName, productOwnerName, memberCount, avgVelocity, currentSprintPoints, costPerSprint, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        tribeName,
        agileCoachName,
        productOwnerName,
        memberCount,
        avgVelocity,
        currentSprintPoints,
        costPerSprint,
        status,
      ]
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

export async function GET() {
  try {
    const db = await connectDB();

    const [rows] = await db.execute("SELECT * FROM cells");

    await db.end();

    // 🔹 Normalizar nombres para que el frontend reciba siempre lo esperado
    const normalized = (rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      tribeName: row.tribeName || row.tribe_name,
      agileCoachName: row.agileCoachName || row.agile_coach_name,
      productOwnerName: row.productOwnerName || row.product_owner_name,
      memberCount: row.memberCount || row.member_count,
      avgVelocity: row.avgVelocity || row.avg_velocity,
      currentSprintPoints: row.currentSprintPoints || row.current_sprint_points,
      costPerSprint: row.costPerSprint || row.cost_per_sprint,
      status: row.status,
      createdAt: row.createdAt || row.created_at,
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

    const [result] = await db.execute(
      "DELETE FROM cells WHERE name = ?",
      [name]
    );

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