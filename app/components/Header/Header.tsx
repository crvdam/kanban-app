import styles from './Header.module.css';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleUser,
    faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import Link from 'next/link';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';

export default function Header({
    boardName,
}: {
    boardName: string | undefined;
}) {
    return (
        <header className={styles.header}>
            <div className={styles.logoWrapper}>
                <Image
                    src={'/casban-logo.svg'}
                    width={160}
                    height={100}
                    alt="Casban logo"
                />
            </div>

            {boardName && (
                <nav className={styles.headerNav}>
                    <h2>projects / </h2>
                    <h1>{boardName}</h1>
                    <Link className={styles.a} href="/dashboard">
                        <p>
                            <FontAwesomeIcon
                                className={styles.faCaretLeft}
                                icon={faCaretLeft}
                            />
                            Back to overview
                        </p>
                    </Link>
                </nav>
            )}

            <DropdownMenu
                triggerIcon={faCircleUser}
                color={'var(--clr-cta)'}
                hover={'var(--clr-cta-hover)'}
                size={'28px'}
                items={[
                    {
                        label: 'Logout',
                        icon: faArrowRightFromBracket,
                        onClick: () => signOut({ callbackUrl: '/login' }),
                    },
                ]}
            />
        </header>
    );
}
