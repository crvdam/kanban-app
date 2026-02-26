import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id }
  })

  return NextResponse.json(boards)
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 })
  }

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 })
  }

  const board = await prisma.board.create({
    data: { name, userId: session.user.id }
  })

  return NextResponse.json(board, { status: 201 })
}