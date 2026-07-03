export async function fetchColumns(boardId: string) {
    const result = await fetch(`/api/boards/${boardId}`);
    if (!result.ok) throw new Error('Failed to fetch columns');
    return result.json();
}

export async function createColumn(boardId: string) {
    const result = await fetch(`/api/boards/${boardId}`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ name: undefined }),
    });
    if (!result.ok) throw new Error('Failed to create column');
    return result.json();
}

export async function deleteColumn(columnId: string) {
    const result = await fetch(`/api/columns/${columnId}`, {
        method: 'DELETE',
    });
    if (!result.ok) throw new Error('Failed to delete column');
    return result.json();
}

export async function renameColumn({
    columnId,
    name,
}: {
    columnId: string;
    name: string;
}) {
    const result = await fetch(`/api/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name }),
    });

    if (!result.ok) throw new Error('Failed to rename column');
    return result.json();
}

export async function createCard(columnId: string) {
    const result = await fetch(`/api/columns/${columnId}`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ name: undefined }),
    });

    if (!result.ok) throw new Error('Failed to create card');
    return result.json();
}

export async function moveCard({
    cardId,
    columnId,
    positionAbove,
    positionBelow,
}: {
    cardId: string;
    columnId: string;
    positionAbove: number | null;
    positionBelow: number | null;
}) {
    const result = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
            columnId,
            positionAbove,
            positionBelow,
        }),
    });

    if (!result.ok) throw new Error('Failed to move card');
    return result.json();
}

export async function deleteCard(cardId: string) {
    const result = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
    });

    if (!result.ok) throw new Error('Failed to delete card');
    return result.json();
}

export async function renameCard({
    cardId,
    name,
}: {
    cardId: string;
    name: string;
}) {
    const result = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ name: name }),
    });

    if (!result.ok) throw new Error('Failed to rename card');
    return result.json();
}
