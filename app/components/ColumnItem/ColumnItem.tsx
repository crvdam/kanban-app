"use client";
import { Column, Card } from "@/app/types";
import styles from "./ColumnItem.module.css";
import { useState } from "react";
import CardItem from "@/app/components/CardItem/CardItem";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGear,
    faPlus,
    faTrashCan,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import DropdownMenu from "@/app/components/DropdownMenu/DropdownMenu";

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
    const style = isDropTarget
        ? { background: "var(--bg-primary-hover)" }
        : undefined;

    return (
        <div className={styles.column}>
            <div className={styles.columnHeader}>
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
                    <>
                        <h3
                            className={styles.columnTitle}
                            onClick={() => setIsEditing(true)}
                        >
                            {column.name}
                            {column.cards.length
                                ? " - " + column.cards.length
                                : ""}
                        </h3>
                        <DropdownMenu
                            triggerIcon={faGear}
                            color="var(--clr-secondary)"
                            items={[
                                {
                                    label: "Create new item",
                                    icon: faPlus,
                                    onClick: () => {
                                        onCreateCard(column.id);
                                    },
                                },
                                {
                                    label: "Change column name",
                                    icon: faPenToSquare,
                                    onClick: () => {
                                        setIsEditing(true);
                                    },
                                },
                                {
                                    label: "Remove column",
                                    icon: faTrashCan,
                                    confirmMessage:
                                        "Are you sure you want to delete this column and all its items?",
                                    onClick: () => {
                                        onDeleteColumn(column.id);
                                    },
                                },
                            ]}
                        />
                    </>
                )}
            </div>
            <div className={styles.columnBody} ref={ref} style={style}>
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
                {/* <button >
                    Add task
                </button>*/}
            </div>
        </div>
    );
}
