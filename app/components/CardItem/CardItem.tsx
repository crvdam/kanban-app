import { Card } from "@/app/types";
import styles from "./CardItem.module.css";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";

export default function CardItem({
    card,
    index,
    column,
    onDelete,
    onRename,
}: {
    card: Card;
    index: number;
    column: string;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(card.name);
    const { ref, isDragging } = useSortable({
        id: card.id,
        index,
        type: "item",
        accept: "item",
        group: column,
    });

    return (
        <div className={styles.card} ref={ref} data-dragging={isDragging}>
            {isEditing ? (
                <input
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                    }}
                    onBlur={() => {
                        if (name !== card.name) {
                            onRename(card.id, name);
                        }

                        setIsEditing(false);
                    }}
                    onKeyDown={(event) =>
                        event.key === "Enter" && event.currentTarget.blur()
                    }
                    autoFocus
                />
            ) : (
                <p onClick={() => setIsEditing(true)}>{card.name}</p>
            )}

            <button onClick={() => onDelete(card.id)}>Delete card</button>
        </div>
    );
}
