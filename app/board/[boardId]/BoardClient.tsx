"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import type { Board, Column, Card } from "@/app/types";
import styles from "./BoardClient.module.css";
import ColumnItem from "@/app/components/ColumnItem/ColumnItem";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";

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
                    board.columns.map((col) => [
                        col.id,
                        col.cards.map((c) => c.id),
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    const handleCreateColumn = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createColumn.mutate();
    };

    const deleteColumn = useMutation({
        mutationFn: async (columnId: string) => {
            const result = await fetch(`/api/columns/${columnId}`, {
                method: "DELETE",
            });
            if (!result.ok) throw new Error("Failed to delete column");
            return result.json();
        },
        onSuccess: () => {
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
        onSuccess: () => {
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
        onSuccess: () => {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["board"] });
        },
    });

    return (
        <div>
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
                    // PATCH LOGICA
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
                            .filter((card): card is Card => card !== undefined);

                        return (
                            <ColumnItem
                                key={column.id}
                                column={{ ...column, cards: cardsForColumn }}
                                onDeleteColumn={(columnId) =>
                                    deleteColumn.mutate(columnId)
                                }
                                onRenameColumn={(columnId, name) =>
                                    renameColumn.mutate({ columnId, name })
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
                    <form
                        className={styles.addColumnForm}
                        onSubmit={handleCreateColumn}
                    >
                        <button
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
                    </form>
                </div>
            </DragDropProvider>
        </div>
    );
}
