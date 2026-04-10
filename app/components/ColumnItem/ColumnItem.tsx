"use client";
import { Column, Card } from "@/app/types";
import styles from "./ColumnItem.module.css";
import { useState } from "react";
import CardItem from "@/app/components/CardItem/CardItem";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

export default function ColumnItem({
    column,
    onDeleteColumn,
    onRenameColumn,
    onCreateCard,
    onDeleteCard,
    onRenameCard,
}: {
    column: Column;
    onDeleteColumn: (id: string) => void;
    onRenameColumn: (id: string, name: string) => void;
    onCreateCard: (columnId: string) => void;
    onDeleteCard: (id: string) => void;
    onRenameCard: (id: string, name: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(column.name);
    const { isDropTarget, ref } = useDroppable({
        id: column.id,
        type: "column",
        accept: "item",
        collisionPriority: CollisionPriority.Low,
    });
    const style = isDropTarget ? { background: "#00000030" } : undefined;

    return (
        <div className={styles.column} ref={ref} style={style}>
            {isEditing ? (
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => {
                        onRenameColumn(column.id, name);
                        setIsEditing(false);
                    }}
                    onKeyDown={(e) =>
                        e.key === "Enter" && e.currentTarget.blur()
                    }
                    autoFocus
                />
            ) : (
                <h3 onClick={() => setIsEditing(true)}>{column.name}</h3>
            )}
            <button onClick={() => onCreateCard(column.id)}>Add task</button>
            <button onClick={() => onDeleteColumn(column.id)}>
                Remove column
            </button>
            {column.cards?.map((card: Card, index: number) => (
                <CardItem
                    key={card.id}
                    card={card}
                    column={column.id}
                    index={index}
                    onDelete={(id) => onDeleteCard(id)}
                    onRename={(id, name) => onRenameCard(id, name)}
                />
            ))}
        </div>
    );
}
