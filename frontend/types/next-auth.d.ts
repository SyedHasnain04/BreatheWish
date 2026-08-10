import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: str
      email: string
      name: string
      role: string
    }
    accessToken: string
  }
}
