"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import type { Board, Column } from "../../types/index";
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

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createColumn.mutate();
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <form onSubmit={handleCreate}>
        <button type="submit" disabled={createColumn.isPending}>
          {createColumn.isPending ? "Creating..." : "Create new column"}
        </button>
      </form>

      <div className={styles.columnContainer}>
        {board?.columns?.map((column: Column) => (
          <div className={styles.column} key={column.id}>
            <h3>{column.name}</h3>
            <button>Add task</button>
            <button>Remove column</button>
          </div>
        ))}
      </div>
    </div>
  );
}
