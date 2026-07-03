import type { Board, Column } from '@/app/types';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import * as boardApi from '@/lib/boardApi';
import { move } from '@dnd-kit/helpers';
import type { ComponentProps } from 'react';
import { DragDropProvider } from '@dnd-kit/react';

type ProviderProps = ComponentProps<typeof DragDropProvider>;
type DragOverEvent = Parameters<NonNullable<ProviderProps['onDragOver']>>[0];
type DragEndEvent = Parameters<NonNullable<ProviderProps['onDragEnd']>>[0];

export function useCardDrag(boardId: string, board: Board | undefined) {
    const queryClient = useQueryClient();

    const [items, setItems] = useState<{ [columnId: string]: string[] }>({});
    const previousItems = useRef(items);

    useEffect(() => {
        if (board) {
            setItems(
                Object.fromEntries(
                    board.columns.map((column: Column) => [
                        column.id,
                        column.cards.map((card) => card.id),
                    ]),
                ),
            );
        }
    }, [board]);

    const moveCard = useMutation({
        mutationFn: boardApi.moveCard,
        onError: () => {
            setItems(previousItems.current);
            queryClient.invalidateQueries({ queryKey: ['board'] });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board'] });
        },
    });

    const onDragStart = () => (previousItems.current = items);
    const onDragOver = (event: DragOverEvent) =>
        setItems((items) => move(items, event));
    const onDragEnd = (event: DragEndEvent) => {
        if (event.canceled) {
            setItems(previousItems.current);
            return;
        }
        if (!event.operation.source) return;

        const cardId = String(event.operation.source.id);

        let newColumnId: string | null = null;
        let newIndex = -1;
        for (const [columnId, ids] of Object.entries(items)) {
            const index = ids.indexOf(cardId);
            if (index !== -1) {
                newColumnId = columnId;
                newIndex = index;
                break;
            }
        }
        if (!newColumnId) return;

        const cardsInNewColumn = items[newColumnId];
        const aboveId = cardsInNewColumn[newIndex - 1];
        const belowId = cardsInNewColumn[newIndex + 1];

        const allCards = board?.columns.flatMap(
            (column: Column) => column.cards,
        );
        const posAt = (id?: string) =>
            allCards?.find((column) => column.id === id)?.position ?? null;

        moveCard.mutate({
            cardId,
            columnId: newColumnId,
            positionAbove: posAt(aboveId),
            positionBelow: posAt(belowId),
        });
    };

    return { items, onDragStart, onDragOver, onDragEnd };
}
