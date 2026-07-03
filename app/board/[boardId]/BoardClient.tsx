'use client';
import { useQuery } from '@tanstack/react-query';
import type { Column, Card } from '@/app/types';
import { DragDropProvider } from '@dnd-kit/react';
import { useCardDrag } from './_hooks/useCardDrag';
import { useBoardMutations } from './_hooks/useBoardMutations';
import * as boardApi from '@/lib/boardApi';
import ColumnItem from '@/app/components/ColumnItem/ColumnItem';
import Header from '@/app/components/Header/Header';
import styles from './BoardClient.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';

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

    const { onDragStart, onDragOver, onDragEnd } = useCardDrag(boardId);

    return (
        <>
            <Header boardName={board ? board.name : undefined} />

            <main className={styles.main}>
                <DragDropProvider
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                >
                    <div className={styles.columnContainer}>
                        {board?.columns?.map((column: Column) => (
                            <ColumnItem
                                key={column.id}
                                column={column} // ← use it directly, no cardsForColumn
                                onDeleteColumn={(id) => deleteColumn.mutate(id)}
                                onRenameColumn={(id, name) =>
                                    renameColumn.mutate({ columnId: id, name })
                                }
                                onCreateCard={(id) => createCard.mutate(id)}
                                onDeleteCard={(id) => deleteCard.mutate(id)}
                                onRenameCard={(id, name) =>
                                    renameCard.mutate({ cardId: id, name })
                                }
                            />
                        ))}
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
