import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'qtrack_db'
};

export async function GET() {
    let connection;
    try {
        console.log('📨 Recibiendo solicitud GET para todos los Qs');

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a BD exitosa');

        // Obtener todas las configuraciones ordenadas por fecha de creación
        const [rows] = await connection.execute(
            'SELECT * FROM q_configurations ORDER BY year DESC, quarter DESC'
        );

        const configs = (rows as any[]).map(config => ({
            id: config.id,
            quarter: config.quarter,
            year: config.year,
            sprintsPerQ: config.sprints_per_q,
            sprintDuration: config.sprint_duration,
            startDate: config.start_date,
            endDate: config.end_date,
            isActive: config.is_active,
            createdAt: config.created_at,
            updatedAt: config.updated_at
        }));

        console.log(`📊 Devolviendo ${configs.length} configuraciones de Q`);
        return NextResponse.json(configs);

    } catch (error: any) {
        console.error('❌ Error en GET all q-configurations:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión a BD cerrada');
        }
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}