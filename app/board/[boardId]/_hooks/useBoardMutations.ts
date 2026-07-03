import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import type { Board } from '@/app/types';
import * as boardApi from '@/lib/boardApi';

export function useBoardMutations(boardId: string) {
    const queryClient = useQueryClient();

    const createColumn = useMutation({
        mutationFn: () => boardApi.createColumn(boardId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['board', boardId] });
            const previous = queryClient.getQueryData(['board', boardId]);

            queryClient.setQueryData(
                ['board', boardId],
                (old: Board | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        columns: [
                            ...old.columns,
                            {
                                id: crypto.randomUUID(),
                                name: 'New column',
                                position:
                                    (old.columns.at(-1)?.position ?? 0) + 1,
                                boardId,
                                cards: [],
                            },
                        ],
                    };
                },
            );

            return { previous };
        },
        onError: (error, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['board', boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const deleteColumn = useMutation({
        mutationFn: boardApi.deleteColumn,
        onMutate: async (columnId) => {
            await queryClient.cancelQueries({ queryKey: ['board', boardId] });
            const previous = queryClient.getQueryData(['board', boardId]);

            queryClient.setQueryData(
                ['board', boardId],
                (old: Board | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        columns: old.columns.filter(
                            (column) => column.id !== columnId,
                        ),
                    };
                },
            );

            return { previous };
        },
        onError: (error, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['board', boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const renameColumn = useMutation({
        mutationFn: boardApi.renameColumn,
        onMutate: async ({ columnId, name }) => {
            await queryClient.cancelQueries({ queryKey: ['board', boardId] });
            const previous = queryClient.getQueryData(['board', boardId]);

            queryClient.setQueryData(
                ['board', boardId],
                (old: Board | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        columns: old.columns.map((column) =>
                            column.id === columnId
                                ? { ...column, name: name }
                                : column,
                        ),
                    };
                },
            );

            return { previous };
        },
        onError: (error, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['board', boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const createCard = useMutation({
        mutationFn: boardApi.createCard,
        onMutate: async (columnId) => {
            await queryClient.cancelQueries({ queryKey: ['board', boardId] });
            const previous = queryClient.getQueryData(['board', boardId]);

            queryClient.setQueryData(
                ['board', boardId],
                (old: Board | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        columns: old.columns.map((column) => {
                            return column.id === columnId
                                ? {
                                      ...column,
                                      cards: [
                                          ...column.cards,
                                          {
                                              id: crypto.randomUUID(),
                                              name: 'New item',
                                              description: null,
                                              position: 0,
                                              columnId: columnId,
                                          },
                                      ],
                                  }
                                : column;
                        }),
                    };
                },
            );

            return { previous };
        },
        onError: (error, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['board', boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const deleteCard = useMutation({
        mutationFn: boardApi.deleteCard,
        onMutate: async (cardId) => {
            await queryClient.cancelQueries({ queryKey: ['board', boardId] });
            const previous = queryClient.getQueryData(['board', boardId]);

            queryClient.setQueryData(
                ['board', boardId],
                (old: Board | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        columns: old.columns.map((column) => ({
                            ...column,
                            cards: column.cards.filter(
                                (card) => card.id !== cardId,
                            ),
                        })),
                    };
                },
            );

            return { previous };
        },
        onError: (error, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['board', boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const renameCard = useMutation({
        mutationFn: boardApi.renameCard,
        onMutate: async ({ cardId, name }) => {
            await queryClient.cancelQueries({ queryKey: ['board', boardId] });
            const previous = queryClient.getQueryData(['board', boardId]);

            queryClient.setQueryData(
                ['board', boardId],
                (old: Board | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        columns: old.columns.map((column) => ({
                            ...column,
                            cards: column.cards.map((card) =>
                                card.id === cardId
                                    ? { ...card, name: name }
                                    : card,
                            ),
                        })),
                    };
                },
            );

            return { previous };
        },
        onError: (error, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['board', boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    return {
        createColumn,
        deleteColumn,
        renameColumn,
        createCard,
        deleteCard,
        renameCard,
    };
}
