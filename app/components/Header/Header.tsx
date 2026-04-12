import styles from "./Header.module.css";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.logoWrapper}>
                <Image
                    src={"/casban-logo.svg"}
                    width={160}
                    height={100}
                    alt="Casban logo"
                />
            </div>

            <button
                className={styles.profileButton}
                onClick={() => signOut({ callbackUrl: "/login" })}
            >
                <FontAwesomeIcon icon={faCircleUser} />
            </button>
        </header>
    );
}
