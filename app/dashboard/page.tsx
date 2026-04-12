"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import type { Board } from "../types/index";
import Header from "../components/Header/Header";

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
            <main>
                <div className="genericFormContainer">
                    <h1>Dashboard</h1>

                    <form className="genericForm" onSubmit={handleCreate}>
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

                    <div>
                        {boards?.map((board) => (
                            <div key={board.id}>
                                <Link href={`/board/${board.id}`}>
                                    <h2>{board.name}</h2>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
