// app/api/sprints/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { auth } from "@/lib/auth";

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qtrackdb'
};

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
        c.name as cellName
      FROM sprints s
      JOIN cells c ON s.cell_id = c.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (quarter) {
      conditions.push('s.quarter = ?');
      params.push(quarter);
    }

    if (cellId) {
      conditions.push('s.cell_id = ?');
      params.push(parseInt(cellId));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.start_date ASC';

    const [rows] = await connection.execute(query, params);
    await connection.end();

    return NextResponse.json({ sprints: rows });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { error: 'Error al obtener sprints' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar sprint
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Verificar permisos (admin o agile_coach)
    if (!session?.user || !['admin', 'agile_coach'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const sprintData: Sprint = await request.json();

    if (!sprintData.cellId || !sprintData.name || !sprintData.quarter || !sprintData.startDate || !sprintData.endDate) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    if (sprintData.id) {
      // Actualizar sprint existente
      const [result] = await connection.execute(
        `UPDATE sprints SET 
          name = ?, 
          quarter = ?, 
          start_date = ?, 
          end_date = ?, 
          planned_points = ?, 
          committed_points = ?, 
          delivered_points = ?, 
          status = ?
        WHERE id = ?`,
        [
          sprintData.name,
          sprintData.quarter,
          sprintData.startDate,
          sprintData.endDate,
          sprintData.plannedPoints || 0,
          sprintData.committedPoints || 0,
          sprintData.deliveredPoints || 0,
          sprintData.status,
          sprintData.id
        ]
      );

      await connection.end();
      return NextResponse.json({ message: 'Sprint actualizado exitosamente', id: sprintData.id });
    } else {
      // Crear nuevo sprint
      const [result] = await connection.execute(
        `INSERT INTO sprints 
          (cell_id, name, quarter, start_date, end_date, planned_points, committed_points, delivered_points, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sprintData.cellId,
          sprintData.name,
          sprintData.quarter,
          sprintData.startDate,
          sprintData.endDate,
          sprintData.plannedPoints || 0,
          sprintData.committedPoints || 0,
          sprintData.deliveredPoints || 0,
          sprintData.status || 'planning'
        ]
      );

      const insertId = (result as any).insertId;
      await connection.end();
      return NextResponse.json({ message: 'Sprint creado exitosamente', id: insertId });
    }
  } catch (error) {
    console.error('Error creating/updating sprint:', error);
    return NextResponse.json(
      { error: 'Error al procesar el sprint' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar solo puntos planeados
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    // Verificar permisos (admin o agile_coach)
    if (!session?.user || !['admin', 'agile_coach'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { sprintId, plannedPoints } = await request.json();

    if (!sprintId || plannedPoints === undefined) {
      return NextResponse.json(
        { error: 'Sprint ID y puntos planeados son requeridos' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'UPDATE sprints SET planned_points = ? WHERE id = ?',
      [plannedPoints, sprintId]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Sprint no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Puntos planeados actualizados exitosamente' });
  } catch (error) {
    console.error('Error updating planned points:', error);
    return NextResponse.json(
      { error: 'Error al actualizar puntos planeados' },
      { status: 500 }
    );
  }
}
