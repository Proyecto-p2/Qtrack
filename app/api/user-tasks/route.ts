// app/api/user-tasks/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

// GET - Obtener tareas por usuario, sprint, célula, etc.
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sprintId = searchParams.get("sprintId");
    const cellId = searchParams.get("cellId");
    const status = searchParams.get("status");
    const assignedToMe = searchParams.get("assignedToMe");

    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    const db = await connectDB();

    let query = `
      SELECT 
        ut.*,
        s.name as sprint_name,
        s.quarter,
        c.name as cell_name,
        c.tribeName as tribe_name,
        u.nombre as assigned_user_name,
        u.usuario as assigned_username,
        kl.nombre as knowledge_line_name
      FROM user_tasks ut
      LEFT JOIN sprints s ON ut.sprint_id = s.id
      LEFT JOIN cells c ON s.cell_id = c.id
      LEFT JOIN usuarios u ON ut.assigned_to = u.id
      LEFT JOIN knowledge_lines kl ON ut.knowledge_line_id = kl.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Control de acceso por rol
    if (userRole === 'usuario') {
      // Usuario solo puede ver sus tareas
      conditions.push('ut.assigned_to = ?');
      params.push(currentUserId);
    } else if (userRole === 'agile_coach') {
      // Agile coach puede ver tareas de sus células/tribus
      conditions.push(`
        c.agile_coach_user_id = ? OR
        EXISTS (
          SELECT 1 FROM members m 
          WHERE m.cellId = c.id AND m.user_id = ?
        )
      `);
      params.push(currentUserId, currentUserId);
    }
    // Admin puede ver todas las tareas

    // Filtros adicionales
    if (userId) {
      conditions.push('ut.assigned_to = ?');
      params.push(userId);
    }

    if (sprintId) {
      conditions.push('ut.sprint_id = ?');
      params.push(Number(sprintId));
    }

    if (cellId) {
      conditions.push('s.cell_id = ?');
      params.push(Number(cellId));
    }

    if (status) {
      conditions.push('ut.status = ?');
      params.push(status);
    }

    if (assignedToMe === 'true') {
      conditions.push('ut.assigned_to = ?');
      params.push(currentUserId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ut.created_at DESC';

    const [rows] = await db.execute(query, params);
    await db.end();

    return NextResponse.json({ tasks: rows });
  } catch (error) {
    console.error("Error obteniendo tareas:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear nueva tarea
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sprintId,
      title,
      description = "",
      storyPoints = 0,
      taskType = "planned",
      priority = "medium",
      assignedTo = null,
      knowledgeLineId = null,
      estimatedHours = 0
    } = body;

    if (!sprintId || !title) {
      return NextResponse.json(
        { message: "Sprint ID y título son obligatorios" },
        { status: 400 }
      );
    }

    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    // Verificar permisos
    if (userRole === 'usuario' && assignedTo && assignedTo !== currentUserId) {
      return NextResponse.json(
        { message: "No tienes permisos para asignar tareas a otros usuarios" },
        { status: 403 }
      );
    }

    const db = await connectDB();

    const [result] = await db.execute(`
      INSERT INTO user_tasks (
        sprint_id, title, description, story_points, task_type, 
        priority, assigned_to, knowledge_line_id, estimated_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sprintId, title, description, storyPoints, taskType,
      priority, assignedTo, knowledgeLineId, estimatedHours
    ]);

    // Registrar actividad
    const taskId = (result as any).insertId;
    await db.execute(`
      INSERT INTO task_activity_logs (task_id, user_id, action, new_value)
      VALUES (?, ?, 'created', ?)
    `, [taskId, currentUserId, title]);

    if (assignedTo) {
      await db.execute(`
        INSERT INTO task_activity_logs (task_id, user_id, action, new_value)
        VALUES (?, ?, 'assigned', ?)
      `, [taskId, currentUserId, assignedTo]);
    }

    await db.end();

    return NextResponse.json(
      { message: "Tarea creada exitosamente", taskId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando tarea:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Actualizar tarea
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      taskId,
      title,
      description,
      storyPoints,
      status,
      assignedTo,
      actualHours,
      notes
    } = body;

    if (!taskId) {
      return NextResponse.json({ message: "Task ID requerido" }, { status: 400 });
    }

    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    const db = await connectDB();

    // Verificar permisos
    const [existingTask] = await db.execute(
      'SELECT assigned_to FROM user_tasks WHERE id = ?',
      [taskId]
    );

    if (!existingTask || !(existingTask as any)[0]) {
      await db.end();
      return NextResponse.json({ message: "Tarea no encontrada" }, { status: 404 });
    }

    const taskAssignedTo = (existingTask as any)[0].assigned_to;

    if (userRole === 'usuario' && taskAssignedTo !== currentUserId) {
      await db.end();
      return NextResponse.json(
        { message: "Solo puedes actualizar tus propias tareas" },
        { status: 403 }
      );
    }

    // Construir query de actualización dinámicamente
    const updates: string[] = [];
    const params: any[] = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (storyPoints !== undefined) { updates.push('story_points = ?'); params.push(storyPoints); }
    if (status !== undefined) { 
      updates.push('status = ?'); 
      params.push(status);
      if (status === 'done') {
        updates.push('completed_at = NOW()');
      }
    }
    if (assignedTo !== undefined) { updates.push('assigned_to = ?'); params.push(assignedTo); }
    if (actualHours !== undefined) { updates.push('actual_hours = ?'); params.push(actualHours); }

    if (updates.length === 0) {
      await db.end();
      return NextResponse.json({ message: "No hay campos para actualizar" }, { status: 400 });
    }

    params.push(taskId);

    await db.execute(
      `UPDATE user_tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    // Registrar actividad
    await db.execute(`
      INSERT INTO task_activity_logs (task_id, user_id, action, new_value, notes)
      VALUES (?, ?, 'updated', ?, ?)
    `, [taskId, currentUserId, JSON.stringify(body), notes || null]);

    await db.end();

    return NextResponse.json({ message: "Tarea actualizada exitosamente" });
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
