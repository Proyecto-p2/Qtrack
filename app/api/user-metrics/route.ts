// app/api/user-metrics/route.ts
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

// GET - Obtener métricas por usuario
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
    const tribeName = searchParams.get("tribeName");

    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    const db = await connectDB();

    let query = `
      SELECT 
        um.*,
        u.nombre as user_name,
        u.usuario as username,
        s.name as sprint_name,
        s.quarter,
        c.name as cell_name
      FROM user_metrics um
      LEFT JOIN usuarios u ON um.user_id = u.id
      LEFT JOIN sprints s ON um.sprint_id = s.id
      LEFT JOIN cells c ON um.cell_id = c.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Control de acceso por rol
    if (userRole === 'usuario') {
      // Usuario solo puede ver sus métricas
      conditions.push('um.user_id = ?');
      params.push(currentUserId);
    } else if (userRole === 'agile_coach') {
      // Agile coach puede ver métricas de sus células/tribus
      conditions.push(`
        c.agile_coach_user_id = ? OR
        EXISTS (
          SELECT 1 FROM members m 
          WHERE m.cellId = c.id AND m.user_id = ?
        )
      `);
      params.push(currentUserId, currentUserId);
    }
    // Admin puede ver todas las métricas

    // Filtros adicionales
    if (userId) {
      conditions.push('um.user_id = ?');
      params.push(userId);
    }

    if (sprintId) {
      conditions.push('um.sprint_id = ?');
      params.push(Number(sprintId));
    }

    if (cellId) {
      conditions.push('um.cell_id = ?');
      params.push(Number(cellId));
    }

    if (tribeName) {
      conditions.push('um.tribe_name = ?');
      params.push(tribeName);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY um.calculated_at DESC';

    const [rows] = await db.execute(query, params);
    await db.end();

    return NextResponse.json({ metrics: rows });
  } catch (error) {
    console.error("Error obteniendo métricas:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Calcular y actualizar métricas para un usuario/sprint
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, sprintId } = body;

    if (!userId || !sprintId) {
      return NextResponse.json(
        { message: "User ID y Sprint ID son obligatorios" },
        { status: 400 }
      );
    }

    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    // Verificar permisos
    if (userRole === 'usuario' && userId !== currentUserId) {
      return NextResponse.json(
        { message: "Solo puedes calcular tus propias métricas" },
        { status: 403 }
      );
    }

    const db = await connectDB();

    // Obtener información del sprint y célula
    const [sprintInfo] = await db.execute(`
      SELECT s.*, c.id as cell_id, c.tribeName 
      FROM sprints s 
      JOIN cells c ON s.cell_id = c.id 
      WHERE s.id = ?
    `, [sprintId]);

    if (!sprintInfo || !(sprintInfo as any)[0]) {
      await db.end();
      return NextResponse.json({ message: "Sprint no encontrado" }, { status: 404 });
    }

    const sprint = (sprintInfo as any)[0];

    // Calcular métricas basadas en las tareas del usuario
    const [taskMetrics] = await db.execute(`
      SELECT 
        COUNT(*) as tasks_assigned,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as tasks_completed,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as tasks_in_progress,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as tasks_todo,
        SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as tasks_blocked,
        SUM(story_points) as story_points_assigned,
        SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END) as story_points_completed,
        SUM(estimated_hours) as estimated_hours,
        SUM(actual_hours) as actual_hours
      FROM user_tasks 
      WHERE assigned_to = ? AND sprint_id = ?
    `, [userId, sprintId]);

    const metrics = (taskMetrics as any)[0];

    // Calcular métricas derivadas
    const completionRate = metrics.tasks_assigned > 0 
      ? (metrics.tasks_completed / metrics.tasks_assigned) * 100 
      : 0;

    const velocity = metrics.actual_hours > 0 
      ? metrics.story_points_completed / metrics.actual_hours 
      : 0;

    const efficiency = metrics.estimated_hours > 0 
      ? (metrics.estimated_hours / Math.max(metrics.actual_hours, 0.1)) * 100 
      : 100;

    // Insertar o actualizar métricas
    await db.execute(`
      INSERT INTO user_metrics (
        user_id, sprint_id, cell_id, tribe_name,
        tasks_assigned, tasks_completed, tasks_in_progress, tasks_todo, tasks_blocked,
        story_points_assigned, story_points_completed,
        estimated_hours, actual_hours,
        completion_rate, velocity, efficiency,
        calculated_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        tasks_assigned = VALUES(tasks_assigned),
        tasks_completed = VALUES(tasks_completed),
        tasks_in_progress = VALUES(tasks_in_progress),
        tasks_todo = VALUES(tasks_todo),
        tasks_blocked = VALUES(tasks_blocked),
        story_points_assigned = VALUES(story_points_assigned),
        story_points_completed = VALUES(story_points_completed),
        estimated_hours = VALUES(estimated_hours),
        actual_hours = VALUES(actual_hours),
        completion_rate = VALUES(completion_rate),
        velocity = VALUES(velocity),
        efficiency = VALUES(efficiency),
        updated_at = NOW()
    `, [
      userId, sprintId, sprint.cell_id, sprint.tribeName,
      metrics.tasks_assigned || 0,
      metrics.tasks_completed || 0,
      metrics.tasks_in_progress || 0,
      metrics.tasks_todo || 0,
      metrics.tasks_blocked || 0,
      metrics.story_points_assigned || 0,
      metrics.story_points_completed || 0,
      metrics.estimated_hours || 0,
      metrics.actual_hours || 0,
      completionRate,
      velocity,
      efficiency
    ]);

    await db.end();

    return NextResponse.json({ 
      message: "Métricas calculadas exitosamente",
      metrics: {
        ...metrics,
        completion_rate: completionRate,
        velocity: velocity,
        efficiency: efficiency
      }
    });
  } catch (error) {
    console.error("Error calculando métricas:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// PUT - Recalcular métricas para múltiples usuarios/sprints
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    
    // Solo admin y agile coach pueden recalcular métricas masivamente
    if (userRole === 'usuario') {
      return NextResponse.json(
        { message: "No tienes permisos para esta acción" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sprintIds, userIds, cellId } = body;

    const db = await connectDB();

    let query = `
      SELECT DISTINCT ut.assigned_to as user_id, ut.sprint_id
      FROM user_tasks ut
      JOIN sprints s ON ut.sprint_id = s.id
      WHERE ut.assigned_to IS NOT NULL
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (sprintIds && sprintIds.length > 0) {
      conditions.push(`ut.sprint_id IN (${sprintIds.map(() => '?').join(',')})`);
      params.push(...sprintIds);
    }

    if (userIds && userIds.length > 0) {
      conditions.push(`ut.assigned_to IN (${userIds.map(() => '?').join(',')})`);
      params.push(...userIds);
    }

    if (cellId) {
      conditions.push('s.cell_id = ?');
      params.push(cellId);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    const [combinations] = await db.execute(query, params);

    let recalculated = 0;

    for (const combo of combinations as any[]) {
      // Recalcular métricas para cada combinación usuario-sprint
      const response = await POST(new Request(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: combo.user_id,
          sprintId: combo.sprint_id
        })
      }));

      if (response.ok) {
        recalculated++;
      }
    }

    await db.end();

    return NextResponse.json({ 
      message: `Métricas recalculadas para ${recalculated} combinaciones usuario-sprint`
    });
  } catch (error) {
    console.error("Error recalculando métricas:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
