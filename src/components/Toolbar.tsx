// Search, status filter, sort and "clear done". Holds no state of its own.
import { STATUS_LABELS, STATUS_ORDER } from '../types';
import type { StatusFilter } from '../utils/filterTasks';
import { SORT_LABELS, isSortMode } from '../utils/sortTasks';
import type { SortMode } from '../utils/sortTasks';
import { useTasksDispatch } from '../context/TasksContext';

// Stateless: takes values and change callbacks, like a controlled <input>.
interface ToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    sort: SortMode;
    onSortChange: (value: SortMode) => void;
    doneCount: number;
}

// Built from the shared status list so a new status appears here automatically.
const STATUS_FILTERS: StatusFilter[] = ['all', ...STATUS_ORDER];

export function Toolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    sort,
    onSortChange,
    doneCount,
}: ToolbarProps) {
    const dispatch = useTasksDispatch();

    return (
        <div className="toolbar">
            <label className="field">
                <span className="field__label">Search</span>
                <input
                    className="field__input"
                    type="search"
                    value={search}
                    placeholder="Filter by title…"
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </label>

            <div className="segmented" role="group" aria-label="Filter by status">
                {STATUS_FILTERS.map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={`segmented__button ${status === value ? 'is-active' : ''}`}
                        aria-pressed={status === value}
                        onClick={() => onStatusChange(value)}
                    >
                        {value === 'all' ? 'All' : STATUS_LABELS[value]}
                    </button>
                ))}
            </div>

            <label className="field field--narrow">
                <span className="field__label">Sort</span>
                <select
                    className="field__input"
                    value={sort}
                    onChange={(event) => {
                        // A type guard rather than `as SortMode`: the DOM hands
                        // us a plain string.
                        const value = event.target.value;
                        if (isSortMode(value)) onSortChange(value);
                    }}
                >
                    {/* `Object.entries` widens the keys to `string`, so cast back. */}
                    {(Object.entries(SORT_LABELS) as [SortMode, string][]).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </label>

            <button
                className="button"
                type="button"
                disabled={doneCount === 0}
                onClick={() => dispatch({ type: 'task/doneCleared' })}
            >
                Clear done ({doneCount})
            </button>
        </div>
    );
}
