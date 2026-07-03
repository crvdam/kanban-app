'use client';
import { useQuery } from '@tanstack/react-query';
import type { Column, Card } from '@/app/types';
import { DragDropProvider } from '@dnd-kit/react';
import { useCardDrag } from './_hooks/useCardDrag';
import { useBoardMutations } from './_hooks/useBoardMutations';
import Link from 'next/link';
import * as boardApi from '@/lib/boardApi';
import ColumnItem from '@/app/components/ColumnItem/ColumnItem';
import Header from '@/app/components/Header/Header';
import styles from './BoardClient.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSpinner,
    faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';

export default function BoardClient({ boardId }: { boardId: string }) {
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

    const { items, onDragStart, onDragOver, onDragEnd } = useCardDrag(
        boardId,
        board,
    );

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
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
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
