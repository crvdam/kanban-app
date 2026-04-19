"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import type { Board } from "../types/index";
import Header from "../components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./page.module.css";

export default function Dashboard() {
    const queryClient = useQueryClient();
    const [newBoardName, setNewBoardName] = useState("");

    const { data: boards, isLoading } = useQuery({
        queryKey: ["boards"],
        queryFn: async () => {
            const result = await fetch("/api/boards");

            if (!result.ok) throw new Error("Failed to fetch boards");

            return result.json() as Promise<Board[]>;
        },
    });

    const createBoard = useMutation({
        mutationFn: async (name: string) => {
            const result = await fetch("/api/boards", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!result.ok) throw new Error("Failed to create board");
            return result.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["boards"] });
            setNewBoardName("");
        },
    });

    const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!newBoardName.trim()) return;
        createBoard.mutate(newBoardName);
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="genericFormContainer">
                    <h1>My projects</h1>

                    <ul className={styles.projectList}>
                        {boards?.map((board) => (
                            <li key={board.id}>
                                <Link href={`/board/${board.id}`}>
                                    <h2 className={styles.projectName}>
                                        {board.name}
                                    </h2>
                                    <FontAwesomeIcon
                                        className={styles.caretRight}
                                        icon={faCaretRight}
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <form
                        className={styles.newProjectForm}
                        onSubmit={handleCreate}
                    >
                        <input
                            type="text"
                            onChange={(event) =>
                                setNewBoardName(event.target.value)
                            }
                            placeholder="New project"
                        ></input>
                        <button type="submit" disabled={createBoard.isPending}>
                            {createBoard.isPending
                                ? "Creating..."
                                : "Create new project"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
