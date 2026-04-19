import { Card } from "@/app/types";
import styles from "./CardItem.module.css";
import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import DropdownMenu from "@/app/components/DropdownMenu/DropdownMenu";
import {
    faGear,
    faTrashCan,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

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
                <p className={styles.cardTitle}>{card.name}</p>
            )}

            <DropdownMenu
                triggerIcon={faGear}
                color="var(--clr-secondary)"
                items={[
                    {
                        label: "Edit item",
                        icon: faPenToSquare,
                        onClick: () => {
                            setIsEditing(true);
                        },
                    },
                    {
                        label: "Remove item",
                        icon: faTrashCan,
                        confirmMessage:
                            "Are you sure you want to remove this item?",
                        onClick: () => {
                            onDelete(card.id);
                        },
                    },
                ]}
            />
        </div>
    );
}
