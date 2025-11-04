import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM excel_data ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error obteniendo datos de Excel:", error);
    return NextResponse.json({ message: "Error al obtener datos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Aceptar tanto camelCase como snake_case
    const assigned_to = body.assignedTo || body.assigned_to || "";
    const state = body.state || "";
    const story_points = body.storyPoints || body.story_points || "";
    const iteration_path = body.iterationPath || body.iteration_path || "";

    // Validación mínima
    if (!assigned_to && !state && !story_points && !iteration_path) {
      return NextResponse.json({ message: "No se recibieron datos válidos" }, { status: 400 });
    }

    // Insertar en DB
    await db.query(
      "INSERT INTO excel_data (assigned_to, state, story_points, iteration_path) VALUES (?, ?, ?, ?)",
      [assigned_to, state, story_points, iteration_path]
    );

    return NextResponse.json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error guardando datos de Excel:", error);
    return NextResponse.json({ message: "Error al guardar datos de Excel" }, { status: 500 });
  }
}
