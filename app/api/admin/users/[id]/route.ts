import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import bcrypt from "bcrypt"

// PUT - Actualizar usuario específico (solo admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const userId = id
    const { usuario, correo, nombre, rol, activo, contraseña } = await request.json()

    if (!usuario || !correo || !nombre || !rol || activo === undefined) {
      return NextResponse.json({ message: "Los campos usuario, correo, nombre y rol son obligatorios" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const existingUser = await db.queryOne(`
      SELECT id FROM usuarios WHERE id = ?
    `, [userId])

    if (!existingUser) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario o correo ya existen en otro usuario
    const duplicateUser = await db.queryOne(`
      SELECT id FROM usuarios WHERE (usuario = ? OR correo = ?) AND id != ?
    `, [usuario, correo, userId])

    if (duplicateUser) {
      return NextResponse.json({ message: "El usuario o correo ya existe" }, { status: 400 })
    }

    let updateQuery = `
      UPDATE usuarios 
      SET usuario = ?, correo = ?, nombre = ?, rol = ?, activo = ?
    `
    let queryParams = [usuario, correo, nombre, rol, activo ? 1 : 0]

    // Si se proporciona nueva contraseña, incluirla
    if (contraseña && contraseña.trim() !== '') {
      const hashedPassword = await bcrypt.hash(contraseña, 10)
      updateQuery += `, contraseña = ?`
      queryParams.push(hashedPassword)
    }

    updateQuery += ` WHERE id = ?`
    queryParams.push(userId)

    await db.query(updateQuery, queryParams)

    return NextResponse.json({ message: "Usuario actualizado exitosamente" })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar usuario específico (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const userId = id

    // Verificar que el usuario existe
    const existingUser = await db.queryOne(`
      SELECT id, rol FROM usuarios WHERE id = ?
    `, [userId])

    if (!existingUser) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir que un admin se elimine a sí mismo
    if (userId === (session.user as any)?.id?.toString()) {
      return NextResponse.json({ message: "No puedes eliminar tu propia cuenta" }, { status: 400 })
    }

    // Eliminar usuario (soft delete cambiando activo a 0)
    await db.query(`
      UPDATE usuarios SET activo = 0 WHERE id = ?
    `, [userId])

    return NextResponse.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
