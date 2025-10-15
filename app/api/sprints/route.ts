// app/api/sprints/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { auth } from "@/lib/auth";

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qtrackdb'
};

interface Task {
  id?: number;
  name: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface Sprint {
  id?: number;
  cellId: number;
  name: string;
  quarter: string;
  startDate: string;
  endDate: string;
  plannedPoints: number;
  committedPoints?: number;
  deliveredPoints?: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  tasks?: Task[];
}

// Helper para parsear JSON seguro
function parseTasksSafe(tasks: any): Task[] {
  if (!tasks) return [];
  if (typeof tasks === "string") {
    try {
      return JSON.parse(tasks);
    } catch {
      return [];
    }
  }
  if (Array.isArray(tasks)) return tasks;
  return [];
}

// GET - Obtener sprints
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quarter = searchParams.get('quarter');
    const cellId = searchParams.get('cellId');

    const connection = await mysql.createConnection(dbConfig);

    let query = `
      SELECT 
        s.id,
        s.cell_id as cellId,
        s.name,
        s.quarter,
        s.start_date as startDate,
        s.end_date as endDate,
        s.planned_points as plannedPoints,
        s.committed_points as committedPoints,
        s.delivered_points as deliveredPoints,
        s.status,
        s.tasks,
        c.name as cellName
      FROM sprints s
      JOIN cells c ON s.cell_id = c.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (quarter) { conditions.push('s.quarter = ?'); params.push(quarter); }
    if (cellId) { conditions.push('s.cell_id = ?'); params.push(Number(cellId)); }

    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY s.start_date ASC';

    const [rows] = await connection.execute(query, params);

    const sprintsWithTasks = (rows as any[]).map(s => ({
      ...s,
      tasks: parseTasksSafe(s.tasks)
    }));

    await connection.end();
    return NextResponse.json({ sprints: sprintsWithTasks });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json({ error: 'Error al obtener sprints', details: (error as any).message }, { status: 500 });
  }
}

// POST - Crear sprint
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'agile_coach'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No tienes permisos para realizar esta acción' }, { status: 403 });
    }

    const sprintData: Sprint = await request.json();

    if (!sprintData.cellId || !sprintData.name || !sprintData.quarter || !sprintData.startDate || !sprintData.endDate) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    const tasksJSON = JSON.stringify(sprintData.tasks || []);

    // Guardar solo la fecha en formato YYYY-MM-DD para MySQL
    const startDate = new Date(sprintData.startDate).toISOString().split('T')[0];
    const endDate = new Date(sprintData.endDate).toISOString().split('T')[0];

    const [result] = await connection.execute(
      `INSERT INTO sprints 
        (cell_id, name, quarter, start_date, end_date, planned_points, committed_points, delivered_points, status, tasks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sprintData.cellId,
        sprintData.name,
        sprintData.quarter,
        startDate,
        endDate,
        sprintData.plannedPoints || 0,
        sprintData.committedPoints || 0,
        sprintData.deliveredPoints || 0,
        sprintData.status || 'planning',
        tasksJSON
      ]
    );

    const insertId = (result as any).insertId;
    await connection.end();

    return NextResponse.json({ message: 'Sprint creado exitosamente', id: insertId });
  } catch (error) {
    console.error('Error creando sprint:', error);
    return NextResponse.json({ error: (error as any).message || 'Error al procesar el sprint' }, { status: 500 });
  }
}

// PUT - Actualizar sprint completo
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['admin', 'agile_coach'].includes(session.user.role)) {
      return NextResponse.json({ error: 'No tienes permisos' }, { status: 403 });
    }

    const sprintData: Sprint = await request.json();
    if (!sprintData.id) return NextResponse.json({ error: 'ID de sprint requerido' }, { status: 400 });

    const connection = await mysql.createConnection(dbConfig);
    const tasksJSON = JSON.stringify(sprintData.tasks || []);

    const startDate = new Date(sprintData.startDate).toISOString().split('T')[0];
    const endDate = new Date(sprintData.endDate).toISOString().split('T')[0];

    await connection.execute(
      `UPDATE sprints SET
        cell_id = ?, name = ?, quarter = ?, start_date = ?, end_date = ?, 
        planned_points = ?, committed_points = ?, delivered_points = ?, status = ?, tasks = ?
       WHERE id = ?`,
      [
        sprintData.cellId,
        sprintData.name,
        sprintData.quarter,
        startDate,
        endDate,
        sprintData.plannedPoints || 0,
        sprintData.committedPoints || 0,
        sprintData.deliveredPoints || 0,
        sprintData.status,
        tasksJSON,
        sprintData.id
      ]
    );

    await connection.end();
    return NextResponse.json({ message: 'Sprint actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando sprint:', error);
    return NextResponse.json({ error: (error as any).message || 'Error al actualizar el sprint' }, { status: 500 });
  }
}
