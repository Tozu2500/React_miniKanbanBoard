import { useState } from 'react';

// Teaching content: each lesson names a real file in this project.
interface Lesson {
    id: string;
    title: string;
    file: string;
    summary: string;
    code: string;
}

const LESSONS: Lesson[] = [
    {
        id: 'props',
        title: 'Typing props',
        file: 'src/components/TaskCard.tsx',
        summary:
            'A component is a function; its props are its one parameter. Declare an interface for that parameter and every call site is checked — missing props, misspelled props and wrong types all become compile errors.',
        code: [
            'interface TaskCardProps {',
            '  task: Task;          // required',
            '  compact?: boolean;   // optional',
            '}',
            '',
            'function TaskCard({ task }: TaskCardProps) { … }',
        ].join('\n'),
    },
    {
        id: 'state',
        title: 'useState, and where state should live',
        file: 'src/components/TaskCard.tsx',
        summary:
            'TypeScript infers the type from the initial value, so useState("") is a string. Annotate explicitly only when the initial value is narrower than the real type — the classic case being null. Keep state in the lowest component that needs it.',
        code: [
            "const [title, setTitle] = useState('');              // inferred: string",
            'const [error, setError] = useState<string | null>(null); // must annotate',
        ].join('\n'),
    },
    {
        id: 'effects',
        title: 'useEffect synchronises with the outside world',
        file: 'src/hooks/useDebouncedValue.ts',
        summary:
            'Effects are for things outside React: storage, timers, subscriptions, the document title. The dependency array says when to re-run; the returned cleanup undoes the previous run. Anything you can compute during render should not be an effect.',
        code: [
            'useEffect(() => {',
            '  const timer = setTimeout(() => setDebounced(value), delay);',
            '  return () => clearTimeout(timer);   // cleanup cancels the old timer',
            '}, [value, delay]);',
        ].join('\n'),
    },
    {
        id: 'union',
        title: 'Discriminated unions',
        file: 'src/state/tasksReducer.ts',
        summary:
            'Give every variant a literal type field and TypeScript narrows the object for you inside each switch case. Each action then carries exactly the payload it needs — no optional fields that are only present sometimes.',
        code: [
            'type TaskAction =',
            "  | { type: 'task/added'; id: string; title: string }",
            "  | { type: 'task/moved'; id: string; status: Status };",
            '',
            'switch (action.type) {',
            "  case 'task/added': action.title;  // ok",
            "  case 'task/moved': action.title;  // compile error",
            '}',
        ].join('\n'),
    },
    {
        id: 'never',
        title: 'Exhaustiveness with never',
        file: 'src/state/tasksReducer.ts',
        summary:
            'If every case is handled, the value reaching the default branch has type never. Assigning it to a never variable compiles today and breaks the moment someone adds a variant and forgets a case — a compile-time reminder no runtime check can give you.',
        code: [
            'default: {',
            '  const unhandled: never = action;',
            '  return unhandled;',
            '}',
        ].join('\n'),
    },
    {
        id: 'reducer',
        title: 'useReducer for related state',
        file: 'src/context/TasksContext.tsx',
        summary:
            'When several pieces of state change together according to rules, a reducer beats scattered useState calls: the rules live in one pure function you can unit test without React. The third argument is a lazy initializer that runs once.',
        code: [
            'const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadTasks);',
            "dispatch({ type: 'task/moved', id, status: 'done' });",
        ].join('\n'),
    },
    {
        id: 'context',
        title: 'Context without the null checks',
        file: 'src/context/TasksContext.tsx',
        summary:
            'Default a context to null, then wrap useContext in a custom hook that throws when it is null. Consumers get a non-nullable type, and forgetting the Provider produces a clear error instead of a mystery crash. Split state and dispatch into two contexts so dispatch-only components do not re-render.',
        code: [
            'export function useTasks(): Task[] {',
            '  const tasks = useContext(TasksStateContext);',
            "  if (tasks === null) throw new Error('missing <TasksProvider>');",
            '  return tasks;   // narrowed to Task[]',
            '}',
        ].join('\n'),
    },
    {
        id: 'derived',
        title: 'Derive, do not duplicate',
        file: 'src/components/StatsBar.tsx',
        summary:
            'Counts, filtered lists and progress percentages are computed from the task list on every render. Storing them in state creates a second source of truth that eventually disagrees with the first. useMemo makes that cheap; it is not what makes it correct — not storing it is.',
        code: [
            "const done = tasks.filter(t => t.status === 'done').length;",
            'const percent = total === 0 ? 0 : Math.round((done / total) * 100);',
        ].join('\n'),
    },
    {
        id: 'guard',
        title: 'Type guards at the boundary',
        file: 'src/utils/storage.ts',
        summary:
            'JSON.parse returns any, and localStorage can hold anything. Type the result as unknown and narrow it with a "value is Task" predicate. Bonus: array.filter(isTask) narrows unknown[] to Task[] with no cast at all.',
        code: [
            'function isTask(value: unknown): value is Task { … }',
            '',
            'const parsed: unknown = JSON.parse(raw);',
            'return Array.isArray(parsed) ? parsed.filter(isTask) : [];',
        ].join('\n'),
    },
    {
        id: 'generics',
        title: 'Generic custom hooks',
        file: 'src/hooks/useLocalStorage.ts',
        summary:
            'A hook is just a function that calls other hooks. Make it generic and it works for any value type while keeping the return type precise at each call site — no any, and no annotation needed by the caller.',
        code: [
            'export function useLocalStorage<T>(key: string, initial: T) {',
            '  const [value, setValue] = useState<T>(…);',
            '  return [value, setValue] as const;  // a tuple, not (T | setter)[]',
            '}',
        ].join('\n'),
    },
    {
        id: 'memo',
        title: 'memo, and why immutability is what makes it work',
        file: 'src/components/TaskCard.tsx',
        summary:
            'memo skips a re-render when props are shallowly equal. It only helps here because the reducer creates a new object only for the task that changed — every other card receives the identical reference and bails out. Mutating state in place would defeat it silently.',
        code: [
            'return state.map(t => t.id === action.id ? { ...t, title } : t);',
            '//     unchanged tasks keep their identity, so memo can skip them',
            '',
            'export const TaskCard = memo(TaskCardImpl);',
        ].join('\n'),
    },
    {
        id: 'keys',
        title: 'Keys preserve component identity',
        file: 'src/components/Column.tsx',
        summary:
            'key is not a cosmetic warning-silencer. It tells React which element is which between renders, so a card keeps its local state (like "I am being edited") when the list is filtered or reordered. Array indexes as keys hand that state to the wrong row.',
        code: '{tasks.map(task => <TaskCard key={task.id} task={task} />)}',
    },
    {
        id: 'boundary',
        title: 'The last class component',
        file: 'src/components/ErrorBoundary.tsx',
        summary:
            'Hooks replaced classes everywhere except one place: there is still no hook for catching render errors. An error boundary must be a class with getDerivedStateFromError. Everything else in this app is a function component.',
        code: [
            'static getDerivedStateFromError(error: Error): ErrorBoundaryState {',
            '  return { error };',
            '}',
        ].join('\n'),
    },
];

export function LessonPanel() {
    const [openId, setOpenId] = useState<string | null>(LESSONS[0].id);

    return (
        <aside className="lessons" aria-label="React and TypeScript lessons">
            <h2 className="lessons__title">Lessons in this codebase</h2>
            <p className="lessons__intro">
                Every concept below is used for real in this app. Open the file listed under a
                lesson — the comments there explain the same idea in its actual context.
            </p>

            <ol className="lessons__list">
                {LESSONS.map((lesson, index) => {
                    const isOpen = lesson.id === openId;

                    return (
                        <li key={lesson.id} className={`lesson ${isOpen ? 'lesson--open' : ''}`}>
                            <button
                                className="lesson__header"
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() => setOpenId(isOpen ? null : lesson.id)}
                            >
                                <span className="lesson__index">{index + 1}</span>
                                <span className="lesson__name">{lesson.title}</span>
                                <span className="lesson__chevron" aria-hidden="true">
                                    {isOpen ? '−' : '+'}
                                </span>
                            </button>

                            {isOpen && (
                                <div className="lesson__body">
                                    <p className="lesson__summary">{lesson.summary}</p>
                                    <pre className="lesson__code">
                                        <code>{lesson.code}</code>
                                    </pre>
                                    <p className="lesson__file">{lesson.file}</p>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
}
