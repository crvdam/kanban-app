import { useRef, type ComponentProps } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropProvider } from '@dnd-kit/react';
import { move } from '@dnd-kit/helpers';
import type { Board } from '@/app/types';
import * as boardApi from '@/lib/boardApi';
import { toIdMap, applyIdMap, replaceCard } from '@/lib/reorder';

type ProviderProps = ComponentProps<typeof DragDropProvider>;
type DragOverEvent = Parameters<NonNullable<ProviderProps['onDragOver']>>[0];
type DragEndEvent = Parameters<NonNullable<ProviderProps['onDragEnd']>>[0];

export function useCardDrag(boardId: string) {
    const queryClient = useQueryClient();
    const boardKey = ['board', boardId] as const;
    const previousBoard = useRef<Board | undefined>(undefined);

    const moveCard = useMutation({
        mutationFn: boardApi.moveCard,
        onError: () => {
            if (previousBoard.current) {
                queryClient.setQueryData(boardKey, previousBoard.current);
            }
        },
        onSuccess: (updatedCard) => {
            // reconcile the server-owned position; no full refetch
            queryClient.setQueryData(boardKey, (old: Board | undefined) =>
                old ? replaceCard(old, updatedCard) : old,
            );
        },
    });

    const onDragStart = () => {
        previousBoard.current = queryClient.getQueryData<Board>(boardKey);
    };

    const onDragOver = (event: DragOverEvent) => {
        queryClient.setQueryData(boardKey, (old: Board | undefined) => {
            if (!old) return old;
            return applyIdMap(old, move(toIdMap(old), event));
        });
    };

    const onDragEnd = (event: DragEndEvent) => {
        if (event.canceled) {
            if (previousBoard.current) {
                queryClient.setQueryData(boardKey, previousBoard.current);
            }
            return;
        }
        if (!event.operation.source) return;
        const cardId = String(event.operation.source.id);

        const board = queryClient.getQueryData<Board>(boardKey);
        if (!board) return;

        const column = board.columns.find((col) =>
            col.cards.some((card) => card.id === cardId),
        );
        if (!column) return;

        const index = column.cards.findIndex((card) => card.id === cardId);
        const positionAbove = column.cards[index - 1]?.position ?? null;
        const positionBelow = column.cards[index + 1]?.position ?? null;

        moveCard.mutate({
            cardId,
            columnId: column.id,
            positionAbove,
            positionBelow,
        });
    };

    return { onDragStart, onDragOver, onDragEnd };
}
