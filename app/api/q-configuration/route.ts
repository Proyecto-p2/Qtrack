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

        if (!qConfig.quarter || !qConfig.year || !qConfig.sprintsPerQ || !qConfig.sprintDuration || !qConfig.startDate || !qConfig.endDate) {
            console.log('❌ Faltan campos requeridos');
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Validación adicional de fechas
        const startDate = new Date(qConfig.startDate);
        const endDate = new Date(qConfig.endDate);

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

        // Formatear fechas para MySQL
        const formattedStartDate = formatDateForMySQL(qConfig.startDate);
        const formattedEndDate = formatDateForMySQL(qConfig.endDate);

        console.log('🔌 Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a BD exitosa');

        // Desactivar todas las configuraciones anteriores
        console.log('⚙️ Desactivando configuraciones anteriores...');
        const [updateResult] = await connection.execute(
            'UPDATE q_configurations SET is_active = FALSE WHERE is_active = TRUE'
        );
        console.log(`📊 Configuraciones desactivadas: ${(updateResult as any).affectedRows}`);

        // Insertar nueva configuración
        console.log('💾 Insertando nueva configuración...');
        const [result] = await connection.execute(
            `INSERT INTO q_configurations 
             (quarter, year, sprints_per_q, sprint_duration, start_date, end_date, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [
                qConfig.quarter,
                qConfig.year,
                qConfig.sprintsPerQ,
                qConfig.sprintDuration,
                formattedStartDate, // Usar fecha formateada
                formattedEndDate    // Usar fecha formateada
            ]
        );

        const insertId = (result as any).insertId;
        console.log(`🎉 Configuración insertada con ID: ${insertId}`);

        // Obtener la configuración recién creada
        const [rows] = await connection.execute(
            'SELECT * FROM q_configurations WHERE id = ?',
            [insertId]
        );

        const newConfig = (rows as QConfig[])[0];

        const responseData = {
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
        };

        console.log('📤 Enviando respuesta:', responseData);

        return NextResponse.json({
            success: true,
            message: 'Configuración de Q guardada correctamente',
            data: responseData
        });

    } catch (error: any) {
        console.error('❌ Error en API q-configuration:', error);

        // Manejo específico de errores
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

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            return NextResponse.json(
                { error: 'Acceso denegado a la base de datos. Verifica usuario y contraseña.' },
                { status: 500 }
            );
        }

        if (error.code === 'ER_BAD_DB_ERROR') {
            return NextResponse.json(
                { error: 'La base de datos no existe. Verifica el nombre de la base de datos.' },
                { status: 500 }
            );
        }

        if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
            return NextResponse.json(
                { error: 'Formato de fecha incorrecto. Las fechas deben estar en formato YYYY-MM-DD.' },
                { status: 400 }
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