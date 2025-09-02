import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import bcrypt from "bcrypt"

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validaciones
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Obtener la contraseña actual del usuario
    const user = await db.queryOne(
      "SELECT contraseña FROM usuarios WHERE id = ?",
      [session.user.id]
    )

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Verificar la contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.contraseña)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: "La contraseña actual es incorrecta" },
        { status: 400 }
      )
    }

    // Hashear la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Actualizar la contraseña
    await db.query(
      "UPDATE usuarios SET contraseña = ? WHERE id = ?",
      [hashedNewPassword, session.user.id]
    )

    return NextResponse.json(
      { message: "Contraseña actualizada correctamente" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error actualizando contraseña:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
