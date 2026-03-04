import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ columnId: string }>}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
  }

  const { columnId } = await params;

  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: { board: true}
  })

  if (!column) {
    return NextResponse.json({ error: "Column not found"}, { status: 404 })
  }

  if (column.board.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 403 })
  }

  await prisma.column.delete({
    where: { id: columnId }
  })

  return NextResponse.json({ message: "Column deleted"}, { status: 200 })
}

export async function POST(request: Request, { params }: { params: Promise<{ columnId: string }>}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
  }

  const { columnId } = await params;

  const column = await prisma.column.findUnique({
    where: { id: columnId},
    include: { board: true }
  })

  if (!column) {
    return NextResponse.json({ error: "Column not found"}, { status: 404 })
  }

  if (column.board.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 403 })
  }

  const lastCard = await prisma.card.findFirst({
    where: { columnId },
    orderBy: { position: "desc" }
  })

  const position = lastCard ? lastCard.position + 1 : 1;
  const { name } = await request.json();

  const x = await prisma.card.create({
    data: { name: name ?? "New card", columnId, position }
  })

  return NextResponse.json(column, { status: 201 })
}