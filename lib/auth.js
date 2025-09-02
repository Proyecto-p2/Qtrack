import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import db from "@/lib/db"
import bcrypt from "bcrypt"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.name = token.name
      }
      return session
    }
  }
})
