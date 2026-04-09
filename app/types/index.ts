export type Card = {
  id: string
  name: string
  description: string | null
  position: number
  columnId: string
}

export type Column = {
  id: string
  name: string
  position: number
  boardId: string
  cards: Card[]
}

export type Board = {
  id: string
  name: string
  userId: string
  createdAt: string
  columns: Column[]
}