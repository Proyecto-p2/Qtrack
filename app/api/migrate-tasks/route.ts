// app/api/migrate-tasks/route.ts
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

// POST - Migrar tareas desde JSON a tabla user_tasks
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    
    // Solo admin puede ejecutar la migración
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: "Solo administradores pueden ejecutar la migración" },
        { status: 403 }
      );
    }

    const db = await connectDB();

    // Obtener sprints con tareas en JSON
    const [sprints] = await db.execute(`
      SELECT id, tasks, name as sprint_name
      FROM sprints 
      WHERE tasks IS NOT NULL AND JSON_LENGTH(tasks) > 0
    `);

    let migratedTasks = 0;
    let errors = 0;

    for (const sprint of sprints as any[]) {
      try {
        const tasks = typeof sprint.tasks === 'string' 
          ? JSON.parse(sprint.tasks) 
          : sprint.tasks;

        if (Array.isArray(tasks)) {
          for (const task of tasks) {
            try {
              // Mapear estado del JSON al formato de la nueva tabla
              let status = 'todo';
              if (task.status === 'done') status = 'done';
              else if (task.status === 'inProgress') status = 'in_progress';

              await db.execute(`
                INSERT IGNORE INTO user_tasks (
                  sprint_id, 
                  title, 
                  description, 
                  story_points, 
                  status, 
                  task_type,
                  priority,
                  created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
              `, [
                sprint.id,
                task.name || 'Tarea migrada',
                `Tarea migrada desde sprint ${sprint.sprint_name}`,
                0, // No había story points en el JSON original
                status,
                'planned',
                'medium'
              ]);
              
              migratedTasks++;
            } catch (taskError) {
              console.error(`Error migrando tarea ${task.name}:`, taskError);
              errors++;
            }
          }
        }
      } catch (sprintError) {
        console.error(`Error procesando sprint ${sprint.id}:`, sprintError);
        errors++;
      }
    }

    await db.end();

    return NextResponse.json({
      message: `Migración completada: ${migratedTasks} tareas migradas, ${errors} errores`,
      migratedTasks,
      errors
    });
  } catch (error) {
    console.error("Error en migración:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}

// GET - Ver estado de la migración
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const db = await connectDB();

    // Contar tareas en JSON
    const [jsonTasks] = await db.execute(`
      SELECT 
        COUNT(*) as sprints_with_json,
        SUM(JSON_LENGTH(tasks)) as total_json_tasks
      FROM sprints 
      WHERE tasks IS NOT NULL AND JSON_LENGTH(tasks) > 0
    `);

    // Contar tareas en nueva tabla
    const [userTasks] = await db.execute(`
      SELECT COUNT(*) as total_user_tasks
      FROM user_tasks
    `);

    await db.end();

    return NextResponse.json({
      sprintsWithJson: (jsonTasks as any)[0].sprints_with_json,
      totalJsonTasks: (jsonTasks as any)[0].total_json_tasks || 0,
      totalUserTasks: (userTasks as any)[0].total_user_tasks,
      migrationNeeded: (jsonTasks as any)[0].total_json_tasks > 0
    });
  } catch (error) {
    console.error("Error obteniendo estado de migración:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
