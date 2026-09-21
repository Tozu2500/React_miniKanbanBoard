// Totals and a progress bar. Every number is derived from the task list on
// render, so none of it can drift out of sync with the board.
import { useMemo } from "react";
import type { Task } from '../types';

interface StatsBarProps {
    tasks: readonly Task[];
}

export function StatsBar({ tasks }: StatsBarProps) {
    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((task) => task.status === 'done').length;
        const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
        // Guard the divide-by-zero before it reaches the render.
        const percentDone = total === 0 ? 0 : Math.round((done / total) * 100);

        return { total, done, inProgress, percentDone };
    }, [tasks]);

    return (
        <div className="stats">
            <div className="stats__numbers">
                <span>
                    <strong>{stats.total}</strong> total
                </span>
                <span>
                    <strong>{stats.inProgress}</strong> in progress
                </span>
                <span>
                    <strong>{stats.done}</strong> done
                </span>
            </div>

            <div
                className="progress"
                role="progressbar"
                aria-valuenow={stats.percentDone}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tasks completed"
            >
                <div className="progress__fill" style={{ width: `${stats.percentDone}%` }} />
            </div>
            <span className="stats__percent">{stats.percentDone}%</span>
        </div>
    );
}