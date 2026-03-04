"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import type { Board, Column, Card } from "../../types/index";
import styles from "./BoardClient.module.css";

export default function BoardClient({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient();

  const { data: board, isLoading } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      const result = await fetch(`/api/boards/${boardId}`);

      if (!result.ok) throw new Error("Failed to fetch columns");

      return result.json() as Promise<Board>;
    },
  });

  const createColumn = useMutation({
    mutationFn: async () => {
      const result = await fetch(`/api/boards/${boardId}`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ name: undefined }),
      });

      if (!result.ok) throw new Error("Failed to create column");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  const handleCreateColumn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createColumn.mutate();
  };

  const deleteColumn = useMutation({
    mutationFn: async (columnId: string) => {
      const results = await fetch(`/api/columns/${columnId}`, {
        method: "DELETE",
      });
      if (!results.ok) throw new Error("Faled to delete column");
      return results.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  const createCard = useMutation({
    mutationFn: async (columnId: string) => {
      const result = await fetch(`/api/columns/${columnId}`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ name: undefined }),
      });

      if (!result.ok) throw new Error("Failed to create card");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  return (
    <div>
      <h1>Dashboard</h1>

      <form onSubmit={handleCreateColumn}>
        <button type="submit" disabled={createColumn.isPending}>
          {createColumn.isPending ? "Creating..." : "Create new column"}
        </button>
      </form>

      <div className={styles.columnContainer}>
        {board?.columns?.map((column: Column) => (
          <div className={styles.column} key={column.id}>
            <h3>{column.name}</h3>
            <button onClick={() => createCard.mutate(column.id)}>
              Add task
            </button>
            <button onClick={() => deleteColumn.mutate(column.id)}>
              Remove column
            </button>

            {column.cards?.map((card: Card) => (
              <div key={card.id}>
                <p>Card</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
