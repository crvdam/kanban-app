import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, {params}: {params: Promise<{ boardId: string }>}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { boardId } = await params;

  const board = await prisma.board.findUnique({
    where: { id: boardId, userId: session.user.id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" }
          }
        }
      }
    }
  })

  if (!board) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
  }

  return NextResponse.json(board);
}

export async function POST(request: Request, { params }: { params: Promise<{ boardId: string }>}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
  }

  const { boardId } = await params;
  const { name } = await request.json();
    console.log("boardId:", boardId)
  console.log("session.user.id:", session.user.id)
  const board = await prisma.board.findUnique({
    where: { id: boardId, userId: session.user.id }
  })

  if (!board) {
    return NextResponse.json({ error: "Board not found"}, { status: 404 })
  }

  const lastColumn = await prisma.column.findFirst({
    where: { boardId },
    orderBy: { position: "desc" }
  })

  const position = lastColumn ? lastColumn.position + 1 : 1;

  const column = await prisma.column.create({
    data: { name: name ?? "New column", boardId, position }
  })

  return NextResponse.json(column, { status: 201 })
}