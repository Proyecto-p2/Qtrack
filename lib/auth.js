import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import db from "@/lib/db"
import bcrypt from "bcrypt"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        login: { label: "Usuario o correo", type: "text" },
        contraseña: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.contraseña) {
          return null
        }

        try {
          // Buscar usuario por nombre de usuario o correo
          const user = await db.queryOne(`
            SELECT * FROM usuarios
            WHERE (usuario = ? OR correo = ?) AND activo = 1
          `, [credentials.login, credentials.login]);

          if (!user) {
            return null
          }

          // Verificar contraseña
          const passwordMatch = await bcrypt.compare(credentials.contraseña, user.contraseña);
          if (!passwordMatch) {
            return null
          }

          return {
            id: user.id,
            name: user.nombre,
            email: user.correo,
            role: user.rol,
            user: user.usuario,
            fullName: user.nombre, // El campo 'nombre' es el nombre completo
          }
        } catch (error) {
          console.error("❌ Error en authorize:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hora
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
        token.user = user.user
        token.fullName = user.fullName
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // Obtener datos actualizados del usuario desde la base de datos
        try {
          const user = await db.queryOne(
            "SELECT id, usuario, correo, nombre, rol FROM usuarios WHERE id = ? AND activo = 1",
            [token.id]
          )
          
          if (user) {
            session.user.id = user.id
            session.user.role = user.rol
            session.user.name = user.nombre
            session.user.email = user.correo
            session.user.user = user.usuario
            session.user.fullName = user.nombre
          } else {
            // Fallback a los datos del token si no se encuentra el usuario
            session.user.id = token.id
            session.user.role = token.role
            session.user.name = token.name
            session.user.email = token.email
            session.user.user = token.user
            session.user.fullName = token.fullName
          }
        } catch (error) {
          console.error("Error obteniendo datos actualizados del usuario:", error)
          // Fallback a los datos del token
          session.user.id = token.id
          session.user.role = token.role
          session.user.name = token.name
          session.user.email = token.email
          session.user.user = token.user
          session.user.fullName = token.fullName
        }
      }
      return session
    }
  }
})
