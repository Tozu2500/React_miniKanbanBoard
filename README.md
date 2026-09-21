# React + TypeScript Task Board

A small Kanban board built as a teaching project: every file demonstrates one React or TypeScript idea, and the in-app **Lesson panel** points you at the file to read for each one.

Features: add, rename, move (drag & drop or arrow buttons) and delete tasks, optional due dates with overdue highlighting, search, status filter, sorting, and a "clear done" action. Everything is saved to `localStorage`.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm test          # run the unit + UI tests once
npm run build     # type-check and build for production
```

Requires Node 20.19+ or 22.12+ (Vite 8).

## Project layout

```
src/
  main.tsx              Entry point, wraps the app in an ErrorBoundary
  App.tsx               Composition root: providers, toolbar, board, lesson panel
  types.ts              Task / Status types and shared lookups
  state/tasksReducer.ts Every task state transition, as a pure reducer
  context/              TasksProvider + useTasks / useTasksDispatch hooks
  components/           Board, Column, TaskCard, AddTaskForm, Toolbar, StatsBar, ...
  hooks/                useLocalStorage, useDebouncedValue
  utils/                filterTasks, sortTasks, storage, dates, ids
```

Tests live next to the code they cover (`*.test.ts(x)`); `setupTests.ts` wires up Testing Library.

## Stack

React 18 · TypeScript 5 · Vite 8 · Vitest 4 · Testing Library
