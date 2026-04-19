import styles from "./Header.module.css";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleUser,
    faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import DropdownMenu from "../DropdownMenu/DropdownMenu";

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

            <DropdownMenu
                triggerIcon={faCircleUser}
                color={"var(--clr-cta"}
                hover={"var(--clr-cta-hover)"}
                size={"28px"}
                items={[
                    {
                        label: "Logout",
                        icon: faArrowRightFromBracket,
                        onClick: () => signOut({ callbackUrl: "/login" }),
                    },
                ]}
            />
        </header>
    );
}
