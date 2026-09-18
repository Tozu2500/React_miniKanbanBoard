// Search, status filter, sort and "clear done". Holds no state of its own.
import { STATUS_LABELS, STATUS_ORDER } from "../types";
import type { StatusFilter } from "../utils/filterTasks";
import { SORT_LABELS, isSortMode } from "../utils/sortTasks";
import type { SortMode } from "../utils/sortTasks";
import { useTasksDispatch } from "../context/TasksContext";

// Stateless: takes values and change callbacks like a controller HTML input
interface ToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
    sort: SortMode;
    onSortChange: (value: SortMode) => void;
    doneCount: number;
}

// Built from the shared status list so a new status appears here automatically
const STATUS_FILTERS: StatusFilter[] = ['all', ...STATUS_ORDER];

