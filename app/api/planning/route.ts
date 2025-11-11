import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function connectDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        return connection;
    } catch (error) {
        console.error("❌ Error conectando a la base de datos:", error);
        throw new Error("No se pudo conectar a la base de datos");
    }
}

export async function GET() {
    try {
        const db = await connectDB();
        const [rows] = await db.execute("SELECT * FROM planning_data");
        await db.end();

        const formatted = (rows as any[]).map((r) => ({
            sprint: r.sprint,
            celula: r.celula,
            puntosComprometidos: r.puntos_comprometidos,
            itemsS: r.items_s,
            itemsM: r.items_m,
            itemsL: r.items_l,
            totalItems: r.total_items, // ✅ Incluir totalItems
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("Error al leer desde DB:", err);
        return NextResponse.json(
            { error: "Error al leer datos desde la base de datos" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sprint, celula, puntosComprometidos, itemsS, itemsM, itemsL, totalItems } = body;

        if (!sprint) {
            return NextResponse.json(
                { error: "El campo 'sprint' es obligatorio" },
                { status: 400 }
            );
        }

        const db = await connectDB();

        await db.execute(
            `
                INSERT INTO planning_data (
                    sprint,
                    celula,
                    puntos_comprometidos,
                    items_s,
                    items_m,
                    items_l,
                    total_items
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                                         celula = VALUES(celula),
                                         puntos_comprometidos = VALUES(puntos_comprometidos),
                                         items_s = VALUES(items_s),
                                         items_m = VALUES(items_m),
                                         items_l = VALUES(items_l),
                                         total_items = VALUES(total_items)
            `,
            [
                sprint,
                celula || null,
                Number(puntosComprometidos) || 0,
                Number(itemsS) || 0,
                Number(itemsM) || 0,
                Number(itemsL) || 0,
                Number(totalItems) || 0, // ✅ Guardar totalItems
            ]
        );

        await db.end();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error al guardar en DB:", err);
        return NextResponse.json(
            { error: "Error al guardar en la base de datos" },
            { status: 500 }
        );
    }
}