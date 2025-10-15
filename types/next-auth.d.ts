import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      user: string
      fullName: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    user: string
    fullName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    name: string
    email: string
    user: string
    fullName: string
  }
}
