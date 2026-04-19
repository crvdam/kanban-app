# Kanban Board

A full-stack kanban board application for managing projects and tasks.

## Features

- Create, rename and delete boards, columns and cards
- Drag and drop cards between columns
- Optimistic updates — the UI responds instantly and rolls back on failure
- Per-user authentication with protected routes

## Tech Stack

| Tech           | Goal                                           |
| -------------- | ---------------------------------------------- |
| Next.js        | Full-stack React framework with API routes     |
| Supabase       | Hosted Postgres database                       |
| Prisma         | Type-safe database ORM                         |
| TanStack Query | Server state management and optimistic updates |
| NextAuth       | Authentication with session management         |
| dnd-kit        | Accessible drag and drop                       |

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Supabase and NextAuth credentials
3. Run `npx prisma migrate dev` to set up the database
4. Run `npm run dev` to start the development server

## Environment Variables

\`\`\`
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
\`\`\`
