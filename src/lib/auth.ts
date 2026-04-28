import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Auth attempt for:", credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            throw new Error("Invalid credentials")
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { company: true, clientProfile: true }
          })

          if (!user) {
            console.log("User not found:", credentials.email)
            throw new Error("Invalid credentials")
          }

          if (!user.password) {
            console.log("User has no password set:", credentials.email)
            throw new Error("Invalid credentials")
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            console.log("Invalid password for:", credentials.email)
            throw new Error("Invalid credentials")
          }

          console.log("Auth successful for:", credentials.email, "Role:", user.role)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId,
            clientId: user.clientProfile?.id
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.clientId = user.clientId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.clientId = token.clientId as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug for now
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      companyId?: string | null
      clientId?: string | null
    }
  }
  
  interface User {
    role: string
    companyId?: string | null
    clientId?: string | null
  }
}
