// Groups the visible tasks by status and renders one column per status
import { useMemo } from "react";
import { STATUS_ORDER } from "../types";
import type { Status, Task } from "../types";
import { Column } from "./Column";

interface BoardProps {
    tasks: readonly Task[];
}

export function Board({ tasks }: BoardProps) {
    // Derived from the task list, never stored alongside it
    const grouped = useMemo(() => {
        // Seeded with every status so an empty column still gets rendered
        const initial = { todo: [], 'in-progress': [], done: [] } as Record<Status, Task[]>;

        return tasks.reduce<Record<Status, Task[]>>((accumulator, task) => {
            accumulator[task.status].push(task);
            return accumulator
        }, initial);
    }, [tasks]);

    return (
        <div className="board">
            {STATUS_ORDER.map((status) => (
                <Column key={status} status={status} tasks={grouped[status]} />
            ))}
        </div>
    );
}