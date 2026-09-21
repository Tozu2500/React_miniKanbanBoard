// Composition root: wires the providers, the toolbar, the board and the
// lesson panel together.
import { useMemo, useState } from 'react';
import { AddTaskForm } from './components/AddTaskForm';
import { Board } from './components/Board';
import { LessonPanel } from './components/LessonPanel';
import { StatsBar } from './components/StatsBar';
import { Toolbar } from './components/Toolbar';
import { TasksProvider, useTasks } from './context/TasksContext';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterTasks, isStatusFilter } from './utils/filterTasks';
import type { StatusFilter } from './utils/filterTasks';
import { isSortMode, sortTasks } from './utils/sortTasks';
import type { SortMode } from './utils/sortTasks';

/**
 * Tasks are shared and rule-driven, so they live in a reducer behind Context.
 * View preferences are local and simple, so they are plain persisted state.
 */
function BoardScreen() {
    const tasks = useTasks();

    const [search, setSearch] = useState('');
    // The guards keep a stale stored value from becoming an impossible state
    const [status, setStatus] = useLocalStorage<StatusFilter>('react-task-board:status', 'all', isStatusFilter);
    const [sort, setSort] = useLocalStorage<SortMode>('react-task-board:sort', 'created-desc', isSortMode);

    // The input stays instant; filtering waits for a pause in typing.
    const debouncedSearch = useDebouncedValue(search, 200);

    const visibleTasks = useMemo(
        () => sortTasks(filterTasks(tasks, { search: debouncedSearch, status }), sort),
        [tasks, debouncedSearch, status, sort],
    );

    const doneCount = tasks.filter((task) => task.status === 'done').length;

    return (
        <>
            <AddTaskForm />
            <Toolbar
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                sort={sort}
                onSortChange={setSort}
                doneCount={doneCount}
            />
            <StatsBar tasks={tasks} />
            <Board tasks={visibleTasks} />

            {tasks.length > 0 && visibleTasks.length === 0 && (
                <p className="empty-state">No tasks match the current filters.</p>
            )}
        </>
    );
}

export function App() {
    return (
        <TasksProvider>
            <div className="app">
                <header className="app__header">
                    <h1 className="app__title">React&nbsp;+&nbsp;TypeScript Task Board</h1>
                    <p className="app__tagline">
                        A working Kanban board where every file demonstrates one idea. Use the app,
                        then read the source — the lessons on the right name the file to open.
                    </p>
                </header>

                <main className="app__main">
                    <section className="app__board">
                        <BoardScreen />
                    </section>
                    <LessonPanel />
                </main>

                <footer className="app__footer">
                    Tasks are saved in your browser&rsquo;s localStorage. Run{' '}
                    <code>npm test</code> to see the pure logic and the UI tested.
                </footer>
            </div>
        </TasksProvider>
    );
}
