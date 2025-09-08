// app/api/sprints/generate/route.ts
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

// POST - Generar sprints automáticamente basado en la configuración Q
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

    const { quarter, year, cellIds } = await request.json();

    if (!quarter || !year || !cellIds || !Array.isArray(cellIds)) {
      return NextResponse.json(
        { error: 'Quarter, year y cellIds son requeridos' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Obtener configuración Q activa para el quarter y year especificados
    const [qConfigRows] = await connection.execute(
      'SELECT * FROM q_configurations WHERE quarter = ? AND year = ? AND is_active = TRUE',
      [quarter, year]
    );

    const qConfig = (qConfigRows as any[])[0];
    if (!qConfig) {
      await connection.end();
      return NextResponse.json(
        { error: 'No se encontró configuración Q activa para el período especificado' },
        { status: 404 }
      );
    }

    const sprintsCreated = [];
    const quarterKey = `${year}-${quarter}`;

    // Calcular fechas de cada sprint
    const startDate = new Date(qConfig.start_date);
    const sprintDurationWeeks = qConfig.sprint_duration;
    const totalSprints = qConfig.sprints_per_q;

    for (const cellId of cellIds) {
      // Verificar si ya existen sprints para esta célula en este quarter
      const [existingSprints] = await connection.execute(
        'SELECT COUNT(*) as count FROM sprints WHERE cell_id = ? AND quarter = ?',
        [cellId, quarterKey]
      );

      const existingCount = (existingSprints as any[])[0].count;
      
      if (existingCount > 0) {
        console.log(`Sprints ya existen para la célula ${cellId} en ${quarterKey}`);
        continue;
      }

      // Obtener información de la célula
      const [cellInfo] = await connection.execute(
        'SELECT name FROM cells WHERE id = ?',
        [cellId]
      );

      const cellName = (cellInfo as any[])[0]?.name || `Célula ${cellId}`;

      // Generar sprints para esta célula
      for (let i = 0; i < totalSprints; i++) {
        const sprintStartDate = new Date(startDate);
        sprintStartDate.setDate(startDate.getDate() + (i * sprintDurationWeeks * 7));
        
        const sprintEndDate = new Date(sprintStartDate);
        sprintEndDate.setDate(sprintStartDate.getDate() + (sprintDurationWeeks * 7) - 1);

        const sprintName = `Sprint ${quarter}-${i + 1}`;

        const [result] = await connection.execute(
          `INSERT INTO sprints 
            (cell_id, name, quarter, start_date, end_date, planned_points, committed_points, delivered_points, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cellId,
            sprintName,
            quarterKey,
            sprintStartDate.toISOString().split('T')[0],
            sprintEndDate.toISOString().split('T')[0],
            0, // planned_points por defecto
            0, // committed_points por defecto
            0, // delivered_points por defecto
            'planning'
          ]
        );

        sprintsCreated.push({
          id: (result as any).insertId,
          cellId,
          cellName,
          name: sprintName,
          quarter: quarterKey,
          startDate: sprintStartDate.toISOString().split('T')[0],
          endDate: sprintEndDate.toISOString().split('T')[0],
          plannedPoints: 0,
          status: 'planning'
        });
      }
    }

    await connection.end();

    return NextResponse.json({
      message: `${sprintsCreated.length} sprints generados exitosamente`,
      sprintsCreated
    });
  } catch (error) {
    console.error('Error generating sprints:', error);
    return NextResponse.json(
      { error: 'Error al generar sprints' },
      { status: 500 }
    );
  }
}
