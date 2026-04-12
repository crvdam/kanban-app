import styles from "./Header.module.css";
import Image from "next/image";
import { signOut } from "next-auth/react";

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

            <button onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
            </button>
        </header>
    );
}
