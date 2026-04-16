import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ cardId: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId } = await params;

    const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
            column: {
                include: {
                    board: true,
                },
            },
        },
    });

    if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.column.board.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.card.delete({
        where: { id: cardId },
    });

    return NextResponse.json({ message: "Card deleted" }, { status: 200 });
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ cardId: string }> },
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId } = await params;

    const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
            column: {
                include: {
                    board: true,
                },
            },
        },
    });

    if (!card) {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.column.board.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { columnId, positionAbove, positionBelow, name } =
        await request.json();

    const data: Partial<{ name: string; columnId: string; position: number }> =
        {};

    let position: number | undefined;
    if (columnId !== undefined) {
        const above = positionAbove === null ? null : Number(positionAbove);
        const below = positionBelow === null ? null : Number(positionBelow);

        if (
            (above !== null && !Number.isFinite(above)) ||
            (below !== null && !Number.isFinite(below))
        ) {
            return NextResponse.json(
                { error: "Invalid position" },
                { status: 400 },
            );
        }

        let position: number;
        if (above === null && below === null) {
            position = 1;
        } else if (above === null) {
            position = below! / 2;
        } else if (below === null) {
            position = above + 1;
        } else {
            position = (above + below) / 2;
        }
    }

    if (name !== undefined) data.name = name;
    if (columnId !== undefined) data.columnId = columnId;
    if (position !== undefined) data.position = position;

    const updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: data,
    });

    return NextResponse.json(updatedCard, { status: 200 });
}
