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
  let db: any;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📥 POST /api/user-tasks body:", body);

    const {
      sprintId,
      title,
      description = "",
      storyPoints = 0,
      taskType = "planned",
      priority = "medium",
      assignedTo = null,
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

    db = await connectDB();

    console.log("📝 Inserting task with params:", {
      sprintId,
      title,
      description,
      storyPoints,
      taskType,
      priority,
      assignedTo,
      estimatedHours
    });

    // Validar que el sprint existe
    const [sprintCheck] = await db.execute(
      "SELECT id FROM sprints WHERE id = ?",
      [sprintId]
    );

    if (!sprintCheck || (sprintCheck as any[]).length === 0) {
      await db.end();
      return NextResponse.json(
        { message: "El sprint no existe" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(`
      INSERT INTO user_tasks (
        sprint_id, title, description, story_points, task_type, 
        priority, assigned_to, estimated_hours, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      sprintId, title, description, storyPoints, taskType,
      priority, assignedTo || null, estimatedHours
    ]);

    const taskId = (result as any).insertId;
    console.log("✅ Task created with ID:", taskId);

    await db.end();

    return NextResponse.json(
      { message: "Tarea creada exitosamente", taskId },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creando tarea:", error);
    if (db) await db.end();
    return NextResponse.json(
      { 
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar tarea
export async function PUT(request: Request) {
  let db: any;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    console.log("📥 PUT /api/user-tasks body:", body);

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

    db = await connectDB();

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
    if (assignedTo !== undefined) { updates.push('assigned_to = ?'); params.push(assignedTo || null); }
    if (actualHours !== undefined) { updates.push('actual_hours = ?'); params.push(actualHours); }

    if (updates.length === 0) {
      await db.end();
      return NextResponse.json({ message: "No hay campos para actualizar" }, { status: 400 });
    }

    params.push(taskId);

    console.log("📝 Update query:", `UPDATE user_tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`);
    console.log("📊 Params:", params);

    await db.execute(
      `UPDATE user_tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    console.log("✅ Task updated:", taskId);
    await db.end();

    return NextResponse.json({ message: "Tarea actualizada exitosamente" });
  } catch (error) {
    console.error("❌ Error actualizando tarea:", error);
    if (db) await db.end();
    return NextResponse.json(
      { 
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}