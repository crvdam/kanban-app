import { Card } from "@/app/types";
import styles from "./CardItem.module.css";
import { useState } from "react";

export default function CardItem({
    card,
    onDelete,
    onRename,
}: {
    card: Card;
    onDelete: (id: string) => void;
    onRename: (id: string, name: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(card.name);

    return (
        <div>
            {isEditing ? (
                <input
                    value={name}
                    onChange={(event) => {
                        setName(
                            event.target.value
                                ? event.target.value
                                : "Enter name",
                        );
                    }}
                    onBlur={() => {
                        onRename(card.id, name);
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
