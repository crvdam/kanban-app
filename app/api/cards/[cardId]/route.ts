import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ cardId: string }>}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
  }

  const { cardId } = await params;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { 
      column: {
        include: { 
          board: true
        }
      }
    }
  })

  if (!card) {
    return NextResponse.json({ error: "Card not found"}, { status: 404 })
  }

  if (card.column.board.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 403 })
  }

  await prisma.card.delete({
    where: { id: cardId }
  })

  return NextResponse.json({ message: "Card deleted"}, { status: 200 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ cardId: string }>}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
  }

  const { cardId } = await params;

  const card = await prisma.card.findUnique({
    where: { id: cardId},
    include: { 
      column: {
        include: {
          board: true
        }
      }
    }
  })

  if (!card) {
    return NextResponse.json({ error: "Card not found"}, { status: 404 })
  }

  if (card.column.board.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized"}, { status: 403 })
  }

 const { columnId, positionAbove, positionBelow } = await request.json();

 let position: number;
 if (positionAbove === null && positionBelow === null) {
  position = 1;
 } else if (positionAbove === null) { 
  position = positionBelow / 2;
 } else if (positionBelow === null) {
  position = positionAbove + 1;
 } else {
  position = (positionAbove + positionBelow) / 2;
 }

 const updatedCard = await prisma.card.update({
  where: { id: cardId },
  data: { columnId, position }
 })

 return NextResponse.json(updatedCard, { status: 200 })
}