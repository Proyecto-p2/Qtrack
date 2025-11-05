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

// GET - Obtener todas las tareas
export async function GET(request: Request) {
  let db: any;
  try {
    const session = await auth();
    console.log("📥 GET /api/user-tasks - Session:", session?.user?.id, "Role:", (session?.user as any)?.role);
    
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    db = await connectDB();

    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    // Query simple para obtener todas las tareas
    let query = `
      SELECT 
        ut.id,
        ut.title,
        ut.description,
        ut.story_points,
        ut.status,
        ut.priority,
        ut.sprint_id,
        ut.assigned_to,
        ut.estimated_hours,
        ut.actual_hours,
        ut.created_at,
        s.name as sprint_name,
        c.name as cell_name,
        u.nombre as assigned_user_name,
        u.usuario as assigned_username
      FROM user_tasks ut
      LEFT JOIN sprints s ON ut.sprint_id = s.id
      LEFT JOIN cells c ON s.cell_id = c.id
      LEFT JOIN usuarios u ON ut.assigned_to = u.id
    `;

    const params: any[] = [];

    // Si NO es admin, filtrar solo tareas del usuario
    if (userRole !== 'admin') {
      query += ` WHERE ut.assigned_to = ?`;
      params.push(currentUserId);
    }

    query += ` ORDER BY ut.created_at DESC`;

    console.log("📝 Ejecutando query...");
    const [rows] = await db.execute(query, params);
    
    console.log("✅ Tareas obtenidas:", (rows as any[]).length);

    await db.end();

    return NextResponse.json({ tasks: rows });
  } catch (error) {
    console.error("❌ Error obteniendo tareas:", error);
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

    // Si hay assignedTo, buscar el usuario ID
    let finalAssignedTo = null;
    if (assignedTo) {
      console.log("🔍 Buscando usuario:", assignedTo);
      
      // Buscar por nombre, usuario o email
      const [userResult] = await db.execute(
        `SELECT id FROM usuarios WHERE nombre LIKE ? OR usuario LIKE ? OR correo LIKE ?`,
        [`%${assignedTo}%`, `%${assignedTo}%`, `%${assignedTo}%`]
      );

      if (userResult && (userResult as any[]).length > 0) {
        finalAssignedTo = (userResult as any[])[0].id;
        console.log("✅ Usuario encontrado con ID:", finalAssignedTo);
      } else {
        console.warn("⚠️ Usuario no encontrado:", assignedTo);
      }
    }

    console.log("🔐 Final assignedTo value:", finalAssignedTo);

    // SIEMPRE usar esta query simple SIN assigned_to
    const [result] = await db.execute(`
      INSERT INTO user_tasks (
        sprint_id, 
        title, 
        description, 
        story_points, 
        priority, 
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [
      sprintId, 
      title, 
      description, 
      storyPoints,
      priority, 
      'todo'
    ]);

    const taskId = (result as any).insertId;
    console.log("✅ Task created with ID:", taskId);

    // Si hay usuario, actualizar después de crear la tarea
    if (finalAssignedTo) {
      console.log("🔄 Actualizando assigned_to a:", finalAssignedTo);
      await db.execute(
        'UPDATE user_tasks SET assigned_to = ? WHERE id = ?',
        [finalAssignedTo, taskId]
      );
      console.log("✅ Task assigned to user:", finalAssignedTo);
    }

    const taskId = (result as any).insertId;
    console.log("✅ Task created with ID:", taskId);

    await db.end();

    return NextResponse.json(
      {
        message: "Tarea creada exitosamente",
        taskId
      },
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
      actualHours
    } = body;

    if (!taskId) {
      return NextResponse.json({ message: "Task ID requerido" }, { status: 400 });
    }

    db = await connectDB();

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
    if (assignedTo !== undefined) { 
      // Si es string, buscar el usuario
      if (assignedTo && typeof assignedTo === 'string') {
        const [userResult] = await db.execute(
          `SELECT id FROM usuarios WHERE nombre LIKE ? OR usuario LIKE ? OR correo LIKE ?`,
          [`%${assignedTo}%`, `%${assignedTo}%`, `%${assignedTo}%`]
        );
        
        if (userResult && (userResult as any[]).length > 0) {
          updates.push('assigned_to = ?'); 
          params.push((userResult as any[])[0].id);
        } else {
          // No encontró usuario, asignar null
          updates.push('assigned_to = ?');
          params.push(null);
        }
      } else {
        updates.push('assigned_to = ?'); 
        params.push(assignedTo || null);
      }
    }
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