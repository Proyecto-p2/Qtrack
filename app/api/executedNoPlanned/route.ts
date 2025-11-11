import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const TABLE_NAME = "executed_no_planned_data";

async function connectDB() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
}

export async function GET() {
    try {
        const db = await connectDB();
        const [rows] = await db.execute(`SELECT * FROM ${TABLE_NAME}`);
        await db.end();

        const formatted = (rows as any[]).map((r) => ({
            sprint: r.sprint,
            celula: r.celula,
            puntosComprometidos: r.puntos_comprometidos,
            itemsS: r.items_s,
            itemsM: r.items_m,
            itemsL: r.items_l,
            totalItems: r.total_items, // ✅ Usar el valor guardado
        }));

        return NextResponse.json(formatted);
    } catch (err) {
        console.error("❌ Error al leer desde DB (executed_no_planned):", err);
        return NextResponse.json({ error: "Error al leer datos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sprint, celula, puntosComprometidos, itemsS, itemsM, itemsL, totalItems } = body;

        if (!sprint) {
            return NextResponse.json({ error: "Falta el sprint" }, { status: 400 });
        }

        const db = await connectDB();
        await db.execute(
            `
                INSERT INTO ${TABLE_NAME} (sprint, celula, puntos_comprometidos, items_s, items_m, items_l, total_items)
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
                Number(totalItems) || 0, // ✅ Usar el valor del frontend
            ]
        );

        await db.end();
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("❌ Error al guardar en DB (executed_no_planned):", err);
        return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
    }
}