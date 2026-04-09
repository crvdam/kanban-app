"use client";
import { Column, Card } from "@/app/types";
import styles from "./ColumnItem.module.css";
import { useState } from "react";
import CardItem from "@/app/components/CardItem/CardItem";

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

    return (
        <div className={styles.column}>
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
            {column.cards?.map((card: Card) => (
                <CardItem
                    key={card.id}
                    card={card}
                    onDelete={(id) => onDeleteCard(id)}
                    onRename={(id, name) => onRenameCard(id, name)}
                />
            ))}
        </div>
    );
}
