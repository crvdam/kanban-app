"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import type { Board, Column, Card } from "@/app/types";
import styles from "./BoardClient.module.css";
import ColumnItem from "@/app/components/ColumnItem/ColumnItem";
import Header from "@/app/components/Header/Header";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faSpinner,
    faCaretLeft,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function BoardClient({ boardId }: { boardId: string }) {
    const queryClient = useQueryClient();

    const { data: board, isLoading } = useQuery({
        queryKey: ["board", boardId],
        queryFn: async () => {
            const result = await fetch(`/api/boards/${boardId}`);

            if (!result.ok) throw new Error("Failed to fetch columns");

            return result.json() as Promise<Board>;
        },
    });

    const [items, setItems] = useState<{ [columnId: string]: string[] }>({});
    const previousItems = useRef(items);

    useEffect(() => {
        if (board) {
            setItems(
                Object.fromEntries(
                    board.columns.map((column) => [
                        column.id,
                        column.cards.map((card) => card.id),
                    ]),
                ),
            );
        }
    }, [board]);

    const createColumn = useMutation({
        mutationFn: async () => {
            const result = await fetch(`/api/boards/${boardId}`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ name: undefined }),
            });

            if (!result.ok) throw new Error("Failed to create column");
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            const previous = queryClient.getQueryData(["board", boardId]);

            queryClient.setQueryData(
                ["board", boardId],
                (old: Board | undefined) => {
                    if (!old) return old;

                    return {
                        ...old,
                        columns: [
                            ...old.columns,
                            {
                                id: crypto.randomUUID(),
                                name: "New column",
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
                queryClient.setQueryData(["board", boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    const deleteColumn = useMutation({
        mutationFn: async (columnId: string) => {
            const result = await fetch(`/api/columns/${columnId}`, {
                method: "DELETE",
            });
            if (!result.ok) throw new Error("Failed to delete column");
            return result.json();
        },
        onMutate: async (columnId) => {
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            const previous = queryClient.getQueryData(["board", boardId]);

            queryClient.setQueryData(
                ["board", boardId],
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
                queryClient.setQueryData(["board", boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    const renameColumn = useMutation({
        mutationFn: async ({
            columnId,
            name,
        }: {
            columnId: string;
            name: string;
        }) => {
            const result = await fetch(`/api/columns/${columnId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name }),
            });

            if (!result.ok) throw new Error("Failed to rename column");
            return result.json();
        },
        onMutate: async ({ columnId, name }) => {
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            const previous = queryClient.getQueryData(["board", boardId]);

            queryClient.setQueryData(
                ["board", boardId],
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
                queryClient.setQueryData(["board", boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    const createCard = useMutation({
        mutationFn: async (columnId: string) => {
            const result = await fetch(`/api/columns/${columnId}`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ name: undefined }),
            });

            if (!result.ok) throw new Error("Failed to create card");
            return result.json();
        },
        onMutate: async (columnId) => {
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            const previous = queryClient.getQueryData(["board", boardId]);

            queryClient.setQueryData(
                ["board", boardId],
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
                                              name: "New item",
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
                queryClient.setQueryData(["board", boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    const moveCard = useMutation({
        mutationFn: async ({
            cardId,
            columnId,
            positionAbove,
            positionBelow,
        }: {
            cardId: string;
            columnId: string;
            positionAbove: number | null;
            positionBelow: number | null;
        }) => {
            const result = await fetch(`/api/cards/${cardId}`, {
                method: "PATCH",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    columnId,
                    positionAbove,
                    positionBelow,
                }),
            });

            if (!result.ok) throw new Error("Failed to move card");
            return result.json();
        },
        onError: () => {
            setItems(previousItems.current);
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    const deleteCard = useMutation({
        mutationFn: async (cardId: string) => {
            const result = await fetch(`/api/cards/${cardId}`, {
                method: "DELETE",
            });

            if (!result.ok) throw new Error("Failed to delete card");
            return result.json();
        },
        onMutate: async (cardId) => {
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            const previous = queryClient.getQueryData(["board", boardId]);

            queryClient.setQueryData(
                ["board", boardId],
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
                queryClient.setQueryData(["board", boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    const renameCard = useMutation({
        mutationFn: async ({
            cardId,
            name,
        }: {
            cardId: string;
            name: string;
        }) => {
            const result = await fetch(`/api/cards/${cardId}`, {
                method: "PATCH",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ name: name }),
            });

            if (!result.ok) throw new Error("Failed to rename card");
            return result.json();
        },
        onMutate: async ({ cardId, name }) => {
            await queryClient.cancelQueries({ queryKey: ["board", boardId] });
            const previous = queryClient.getQueryData(["board", boardId]);

            queryClient.setQueryData(
                ["board", boardId],
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
                queryClient.setQueryData(["board", boardId], context.previous);
            }
            console.error(error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    return (
        <>
            <Header />
            <main className={styles.main}>
                <aside className={styles.aside}>
                    <h1 className={styles.projectName}>
                        projects / {board ? board.name : "My board"}
                    </h1>
                    <Link href="/dashboard">
                        <p>
                            <FontAwesomeIcon
                                className={styles.faCaretLeft}
                                icon={faCaretLeft}
                            />
                            Back to overview
                        </p>
                    </Link>
                </aside>

                <DragDropProvider
                    onDragStart={() => {
                        previousItems.current = items;
                    }}
                    onDragOver={(event) => {
                        setItems((items) => move(items, event));
                    }}
                    onDragEnd={(event) => {
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

                        const allCards = board?.columns.flatMap((c) => c.cards);
                        const posAt = (id?: string) =>
                            allCards?.find((c) => c.id === id)?.position ??
                            null;

                        moveCard.mutate({
                            cardId,
                            columnId: newColumnId,
                            positionAbove: posAt(aboveId),
                            positionBelow: posAt(belowId),
                        });
                    }}
                >
                    <div className={styles.columnContainer}>
                        {board?.columns?.map((column: Column) => {
                            const cardIds = items[column.id] || [];
                            const allCards = board.columns.flatMap(
                                (column) => column.cards,
                            );
                            const cardsForColumn = cardIds
                                .map((id) =>
                                    allCards.find((card) => card.id === id),
                                )
                                .filter(
                                    (card): card is Card => card !== undefined,
                                );

                            return (
                                <ColumnItem
                                    key={column.id}
                                    column={{
                                        ...column,
                                        cards: cardsForColumn,
                                    }}
                                    onDeleteColumn={(columnId) =>
                                        deleteColumn.mutate(columnId)
                                    }
                                    onRenameColumn={(columnId, name) =>
                                        renameColumn.mutate({
                                            columnId,
                                            name,
                                        })
                                    }
                                    onCreateCard={(columnId) =>
                                        createCard.mutate(columnId)
                                    }
                                    onDeleteCard={(cardId) =>
                                        deleteCard.mutate(cardId)
                                    }
                                    onRenameCard={(cardId, name) =>
                                        renameCard.mutate({ cardId, name })
                                    }
                                />
                            );
                        })}

                        <button
                            onClick={() => createColumn.mutate()}
                            className={styles.addColumnButton}
                            type="submit"
                            disabled={createColumn.isPending}
                        >
                            {createColumn.isPending ? (
                                <FontAwesomeIcon
                                    className={styles.spinning}
                                    icon={faSpinner}
                                />
                            ) : (
                                <FontAwesomeIcon icon={faPlus} />
                            )}
                        </button>
                    </div>
                </DragDropProvider>
            </main>
        </>
    );
}
