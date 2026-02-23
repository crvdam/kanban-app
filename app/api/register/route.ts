import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 }
    )
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } })

  if (existingEmail) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword }
  })

  return NextResponse.json(
    { message: "User created", userId: user.id },
    { status: 201 }
  )
}