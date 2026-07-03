'use client';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import type { Column, Card } from '@/app/types';
import { DragDropProvider } from '@dnd-kit/react';
import { useEffect, useRef, useState } from 'react';
import { useBoardMutations } from './_hooks/useBoardMutations';
import Link from 'next/link';
import * as boardApi from '@/lib/boardApi';
import ColumnItem from '@/app/components/ColumnItem/ColumnItem';
import Header from '@/app/components/Header/Header';
import styles from './BoardClient.module.css';
import { move } from '@dnd-kit/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSpinner,
    faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';

export default function BoardClient({ boardId }: { boardId: string }) {
    const queryClient = useQueryClient();

    const { data: board, isLoading } = useQuery({
        queryKey: ['board', boardId],
        queryFn: () => boardApi.fetchColumns(boardId),
    });

    const {
        createColumn,
        deleteColumn,
        renameColumn,
        createCard,
        deleteCard,
        renameCard,
    } = useBoardMutations(boardId);

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

    return (
        <>
            <Header />
            <main className={styles.main}>
                <aside className={styles.aside}>
                    <h1 className={styles.projectName}>
                        projects / {board ? board.name : 'My board'}
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

                        const allCards = board?.columns.flatMap(
                            (column: Column) => column.cards,
                        );
                        const posAt = (id?: string) =>
                            allCards?.find((column: Column) => column.id === id)
                                ?.position ?? null;

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
                                (column: Column) => column.cards,
                            );
                            const cardsForColumn = cardIds
                                .map((id) =>
                                    allCards.find(
                                        (card: Card) => card.id === id,
                                    ),
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
                    </div>
                </DragDropProvider>
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
            </main>
        </>
    );
}
