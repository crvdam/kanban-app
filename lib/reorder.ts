import type { Board, Card } from '@/app/types';

export function toIdMap(board: Board): Record<string, string[]> {
    return Object.fromEntries(
        board.columns.map((column) => [
            column.id,
            column.cards.map((card) => card.id),
        ]),
    );
}

export function applyIdMap(board: Board, map: Record<string, string[]>): Board {
    const cardsById = new Map<string, Card>();
    for (const column of board.columns) {
        for (const card of column.cards) cardsById.set(card.id, card);
    }

    return {
        ...board,
        columns: board.columns.map((column) => {
            const ids = map[column.id] ?? column.cards.map((c) => c.id);
            const cards = ids
                .map((id) => cardsById.get(id))
                .filter((card): card is Card => card !== undefined)
                .map((card) =>
                    card.columnId === column.id
                        ? card
                        : { ...card, columnId: column.id },
                );
            return { ...column, cards };
        }),
    };
}

export function replaceCard(board: Board, updated: Card): Board {
    return {
        ...board,
        columns: board.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) =>
                card.id === updated.id ? { ...card, ...updated } : card,
            ),
        })),
    };
}
