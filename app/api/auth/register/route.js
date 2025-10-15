import db from "@/lib/db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const { user, email, password, fullName } = await req.json();

    if (!user || !email || !password || !fullName) {
      return new Response("Faltan campos obligatorios", { status: 400 });
    }

    // Verificar si el usuario o correo ya existen
    const existingUser = await db.queryOne(
      `SELECT id FROM usuarios WHERE usuario = ? OR correo = ?`,
      [user, email]
    );

    if (existingUser) {
      return new Response("Usuario o correo ya registrado", { status: 409 });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // Insertar el nuevo usuario
    await db.query(
      `INSERT INTO usuarios (id, usuario, correo, contraseña, nombre, rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, user, email, hashedPassword, fullName, "usuario", true]
    );

    return new Response(JSON.stringify({ 
      success: true, 
      id,
      message: "Usuario registrado exitosamente" 
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "Error interno del servidor"
    }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
