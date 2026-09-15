// Holds the task list and makes it available anywhere without prop drilling
import { createContext, useContext, useEffect, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";
import type { Task } from "../types";
import { tasksReducer } from "../state/tasksReducer";
import type { TaskAction } from "../state/tasksReducer";
import { loadTasks, saveTasks } from "../utils/storage";

// Split in two, so components that only dispatch do not re-render when the
// task list changes.
const TasksStateContext = createContext<Task[] | null>(null);
const TasksDispatchContext = createContext<Dispatch<TaskAction> | null>(null);

interface TasksProviderProps {
    children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
    // Third argument is a lazy initializer: localStorage is read once on mount
    const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadTasks);

    // Mirror state into localStorage whenever the board actually changes
    useEffect(() => {
        saveTasks(tasks);
    }, [tasks]);

    return (
        <TasksStateContext.Provider value={tasks}>
            <TasksDispatchContext.Provider value={dispatch}>
                {children}
            </TasksDispatchContext.Provider>
        </TasksStateContext.Provider>
    );
}

// The throw both reports a missing Provider and narrows away the 'null'
export function useTasks(): Task[] {
    const tasks = useContext(TasksStateContext);
    if (tasks === null) {
        throw new Error('useTasks must be inside a <TasksProvider>');
    }
    return tasks;
}

export function useTasksDispatch(): Dispatch<TaskAction> {
    const dispatch = useContext(TasksDispatchContext);
    if (dispatch === null) {
        throw new Error('useTasksDispatch must be inside a <TasksProvider>');
    }
    return dispatch;
}