import styles from "./DropdownMenu.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useRef, useEffect } from "react";

type MenuItem = {
    label: string;
    confirmMessage?: string;
    onClick: () => void;
};

type DropdownMenuProps = {
    triggerIcon: IconDefinition;
    items: MenuItem[];
    color?: string;
    height?: string;
};

export default function DropdownMenu({
    triggerIcon,
    items,
    color,
    height,
}: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={wrapperRef}
            className={styles.dropdownMenuWrapper}
            style={{ height }}
        >
            <FontAwesomeIcon
                style={{ color }}
                icon={triggerIcon}
                onClick={() => setIsOpen(!isOpen)}
            />
            <ul
                className={`${styles.dropdownMenuList} ${isOpen ? styles.open : ""}`}
            >
                {items.map((item) => (
                    <li
                        key={item.label}
                        onClick={() => {
                            if (item.confirmMessage) {
                                setPendingItem(item);
                            } else {
                                item.onClick();
                                setIsOpen(false);
                            }
                        }}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>

            {pendingItem && (
                <div className={styles.confirmationOverlay}>
                    <div className={styles.confirmationWrapper}>
                        <h3 className={styles.confirmMessage}>
                            {pendingItem.confirmMessage}
                        </h3>
                        <button
                            className={styles.cancelButton}
                            onClick={() => {
                                setPendingItem(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className={styles.confirmButton}
                            onClick={() => {
                                pendingItem.onClick();
                                setPendingItem(null);
                                setIsOpen(false);
                            }}
                        >
                            Yes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
