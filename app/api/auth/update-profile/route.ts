import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import db from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      )
    }

    const { fullName, email, user } = await request.json()

    // Validaciones
    if (!fullName || !email || !user) {
      return NextResponse.json(
        { message: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    if (user.length < 3) {
      return NextResponse.json(
        { message: "El nombre de usuario debe tener al menos 3 caracteres" },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Por favor ingresa un correo electrónico válido" },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe (excepto para el usuario actual)
    const existingEmailUser = await db.queryOne(
      "SELECT id FROM usuarios WHERE correo = ? AND id != ?",
      [email, session.user.id]
    )

    if (existingEmailUser) {
      return NextResponse.json(
        { message: "Este correo electrónico ya está en uso" },
        { status: 400 }
      )
    }

    // Verificar si el username ya existe (excepto para el usuario actual)
    const existingUser = await db.queryOne(
      "SELECT id FROM usuarios WHERE usuario = ? AND id != ?",
      [user, session.user.id]
    )

    if (existingUser) {
      return NextResponse.json(
        { message: "Este nombre de usuario ya está en uso" },
        { status: 400 }
      )
    }

    // Actualizar el usuario
    await db.query(
      "UPDATE usuarios SET nombre = ?, correo = ?, usuario = ? WHERE id = ?",
      [fullName, email, user, session.user.id]
    )

    return NextResponse.json(
      { message: "Perfil actualizado correctamente" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error actualizando perfil:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
