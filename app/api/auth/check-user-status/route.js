import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { login } = await req.json();

    if (!login) {
      return NextResponse.json(
        { error: "Login requerido" },
        { status: 400 }
      );
    }

    const user = await db.queryOne(`
      SELECT activo, nombre, rol
      FROM usuarios
      WHERE usuario = ? OR correo = ?
    `, [login, login]);

    if (!user) {
      return NextResponse.json(
        { status: 'not_found', message: 'Usuario no encontrado' }
      );
    }
    
    return NextResponse.json({
      activo: user.activo,
      nombre: user.nombre,
      rol: user.rol
    });

  } catch (error) {
    console.error("❌ Error al verificar estado del usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
