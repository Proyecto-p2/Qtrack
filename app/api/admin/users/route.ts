import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import bcrypt from "bcrypt"

// GET - Obtener todos los usuarios (solo admins)
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const users = await db.query(`
      SELECT id, usuario, correo, nombre, rol, activo, 
             DATE_FORMAT(creado_en, '%Y-%m-%d %H:%i:%s') as creado_en
      FROM usuarios 
      ORDER BY creado_en DESC
    `)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear nuevo usuario (solo admins)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const { usuario, correo, nombre, rol, contraseña } = await request.json()

    if (!usuario || !correo || !nombre || !rol || !contraseña) {
      return NextResponse.json({ message: "Todos los campos son obligatorios" }, { status: 400 })
    }

    // Verificar si el usuario o correo ya existen
    const existingUser = await db.queryOne(`
      SELECT id FROM usuarios WHERE usuario = ? OR correo = ?
    `, [usuario, correo])

    if (existingUser) {
      return NextResponse.json({ message: "El usuario o correo ya existe" }, { status: 400 })
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10)

    // Generar un ID único
    const userId = Date.now()

    // Crear usuario
    const result = await db.query(`
      INSERT INTO usuarios (id, usuario, correo, nombre, rol, contraseña, activo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [userId, usuario, correo, nombre, rol, hashedPassword])

    return NextResponse.json({ 
      message: "Usuario creado exitosamente"
    })
  } catch (error) {
    console.error("Error creando usuario:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
