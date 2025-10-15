import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sprintId = searchParams.get("sprintId");

  try {
    const tasks = await db.query(
      "SELECT * FROM tasks WHERE sprint_id = ?",
      [sprintId]
    );
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error obteniendo tareas:", error);
    return NextResponse.json({ message: "Error al obtener tareas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sprintId, title, description } = await request.json();

    if (!sprintId || !title) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    await db.query(
      "INSERT INTO tasks (sprint_id, title, description) VALUES (?, ?, ?)",
      [sprintId, title, description]
    );

    return NextResponse.json({ message: "Tarea creada correctamente" });
  } catch (error) {
    console.error("Error creando tarea:", error);
    return NextResponse.json({ message: "Error al crear tarea" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    await db.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
    return NextResponse.json({ message: "Tarea actualizada" });
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    return NextResponse.json({ message: "Error al actualizar tarea" }, { status: 500 });
  }
}
