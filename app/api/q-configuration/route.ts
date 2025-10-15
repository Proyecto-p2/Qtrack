import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

interface QConfig {
    id: number;
    quarter: string;
    year: number;
    sprints_per_q: number;
    sprint_duration: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'qtrack_db'
};

// Función para formatear fechas a YYYY-MM-DD
function formatDateForMySQL(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Fecha inválida');
    }
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function POST(request: Request) {
    let connection;
    try {
        console.log('📨 Recibiendo solicitud POST para q-configuration');
        const qConfig = await request.json();
        console.log('📊 Datos recibidos:', qConfig);

        // Validación de campos requeridos
        if (!qConfig.quarter || !qConfig.year || !qConfig.sprintsPerQ ||
            !qConfig.sprintDuration || !qConfig.startDate || !qConfig.endDate) {
            console.log('❌ Faltan campos requeridos');
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Limpiar y validar fechas
        const startDateStr = qConfig.startDate.split('T')[0];
        const endDateStr = qConfig.endDate.split('T')[0];

        const startDate = new Date(startDateStr + 'T00:00:00Z');
        const endDate = new Date(endDateStr + 'T00:00:00Z');

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.log('❌ Fechas inválidas');
            return NextResponse.json(
                { error: 'Las fechas proporcionadas no son válidas' },
                { status: 400 }
            );
        }

        if (startDate >= endDate) {
            console.log('❌ Fecha inicio mayor o igual a fecha fin');
            return NextResponse.json(
                { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
                { status: 400 }
            );
        }

        console.log('🔌 Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a BD exitosa');

        // Verificar si ya existe una configuración para este Q y año
        const [existingRows] = await connection.execute(
            'SELECT id FROM q_configurations WHERE quarter = ? AND year = ?',
            [qConfig.quarter, qConfig.year]
        );

        if ((existingRows as any[]).length > 0) {
            // Actualizar configuración existente
            const existingId = (existingRows as any[])[0].id;
            console.log(`🔄 Actualizando configuración existente ID: ${existingId}`);

            await connection.execute(
                'UPDATE q_configurations SET is_active = FALSE WHERE is_active = TRUE AND id != ?',
                [existingId]
            );

            await connection.execute(
                `UPDATE q_configurations 
                 SET sprints_per_q = ?, sprint_duration = ?, start_date = ?, 
                     end_date = ?, is_active = TRUE, updated_at = NOW()
                 WHERE id = ?`,
                [
                    qConfig.sprintsPerQ,
                    qConfig.sprintDuration,
                    startDateStr,
                    endDateStr,
                    existingId
                ]
            );

            const [updatedRows] = await connection.execute(
                'SELECT * FROM q_configurations WHERE id = ?',
                [existingId]
            );

            const updatedConfig = (updatedRows as QConfig[])[0];
            console.log('✅ Configuración actualizada');

            return NextResponse.json({
                success: true,
                message: 'Configuración de Q actualizada correctamente',
                data: {
                    id: updatedConfig.id,
                    quarter: updatedConfig.quarter,
                    year: updatedConfig.year,
                    sprintsPerQ: updatedConfig.sprints_per_q,
                    sprintDuration: updatedConfig.sprint_duration,
                    startDate: updatedConfig.start_date,
                    endDate: updatedConfig.end_date,
                    isActive: updatedConfig.is_active,
                    createdAt: updatedConfig.created_at,
                    updatedAt: updatedConfig.updated_at
                }
            });
        } else {
            // Insertar nueva configuración
            console.log('💾 Insertando nueva configuración...');

            await connection.execute(
                'UPDATE q_configurations SET is_active = FALSE WHERE is_active = TRUE'
            );

            const [result] = await connection.execute(
                `INSERT INTO q_configurations
                 (quarter, year, sprints_per_q, sprint_duration, start_date, end_date, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
                [
                    qConfig.quarter,
                    qConfig.year,
                    qConfig.sprintsPerQ,
                    qConfig.sprintDuration,
                    startDateStr,
                    endDateStr
                ]
            );

            const insertId = (result as any).insertId;
            console.log(`🎉 Configuración insertada con ID: ${insertId}`);

            const [rows] = await connection.execute(
                'SELECT * FROM q_configurations WHERE id = ?',
                [insertId]
            );

            const newConfig = (rows as QConfig[])[0];

            return NextResponse.json({
                success: true,
                message: 'Configuración de Q guardada correctamente',
                data: {
                    id: newConfig.id,
                    quarter: newConfig.quarter,
                    year: newConfig.year,
                    sprintsPerQ: newConfig.sprints_per_q,
                    sprintDuration: newConfig.sprint_duration,
                    startDate: newConfig.start_date,
                    endDate: newConfig.end_date,
                    isActive: newConfig.is_active,
                    createdAt: newConfig.created_at,
                    updatedAt: newConfig.updated_at
                }
            });
        }

    } catch (error: any) {
        console.error('❌ Error en API q-configuration:', error);

        if (error.code === 'ER_NO_SUCH_TABLE') {
            return NextResponse.json(
                { error: 'La tabla q_configurations no existe. Ejecuta el script SQL primero.' },
                { status: 500 }
            );
        }

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { error: 'No se puede conectar a la base de datos. Verifica que MySQL esté ejecutándose.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión a BD cerrada');
        }
    }
}


export async function GET() {
    let connection;
    try {
        console.log('📨 Recibiendo solicitud GET para q-configuration');

        console.log('🔌 Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a BD exitosa');

        // Obtener la configuración activa
        console.log('🔍 Buscando configuración activa...');
        const [rows] = await connection.execute(
            'SELECT * FROM q_configurations WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
        );

        const activeConfig = (rows as QConfig[])[0];

        // Si no hay configuración activa, devolver valores por defecto
        if (!activeConfig) {
            console.log('ℹ️ No se encontró configuración activa, devolviendo valores por defecto');

            // Calcular fecha de fin por defecto (4 sprints de 2 semanas = 8 semanas)
            const defaultStartDate = new Date();
            const defaultEndDate = new Date(defaultStartDate);
            defaultEndDate.setDate(defaultStartDate.getDate() + (4 * 2 * 7)); // 4 sprints * 2 semanas * 7 días

            return NextResponse.json({
                quarter: 'Q1',
                year: new Date().getFullYear(),
                sprintsPerQ: 4,
                sprintDuration: 2,
                startDate: defaultStartDate.toISOString().split('T')[0],
                endDate: defaultEndDate.toISOString().split('T')[0],
                isActive: false
            });
        }

        // Formatear la respuesta
        const response = {
            id: activeConfig.id,
            quarter: activeConfig.quarter,
            year: activeConfig.year,
            sprintsPerQ: activeConfig.sprints_per_q,
            sprintDuration: activeConfig.sprint_duration,
            startDate: activeConfig.start_date,
            endDate: activeConfig.end_date,
            isActive: activeConfig.is_active,
            createdAt: activeConfig.created_at,
            updatedAt: activeConfig.updated_at
        };

        console.log('📤 Devolviendo configuración activa:', response);
        return NextResponse.json(response);

    } catch (error: any) {
        console.error('❌ Error en GET q-configuration:', error);

        // Manejo específico de errores
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return NextResponse.json({
                quarter: 'Q1',
                year: new Date().getFullYear(),
                sprintsPerQ: 4,
                sprintDuration: 2,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +56 días (8 semanas)
                isActive: false
            });
        }

        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión a BD cerrada');
        }
    }
}

// Método OPTIONS para CORS (importante para navegadores)
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}