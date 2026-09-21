// One status column and the drop target for DRAG&DROP
import { useRef, useState } from "react";
import type { DragEvent } from "react";
import type { Status, Task } from "../types";
import { STATUS_LABELS } from "../types";
import { useTasksDispatch } from "../context/TasksContext";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
    status: Status;
    tasks: readonly Task[];
}

export function Column({ status, tasks }: ColumnProps) {
    const dispatch = useTasksDispatch();
    const [isDragOver, setIsDragOver] = useState(false);

    // `dragleave` fires every time the pointer crosses from the column onto
    // one of its cards, so a plain boolean flickers. Counting enters against
    // leaves means the highlight only drops when the pointer really left.
    const dragDepth = useRef(0);

    function handleDragEnter(event: DragEvent<HTMLElement>) {
        event.preventDefault();
        dragDepth.current += 1;
        setIsDragOver(true);
    }

    function handleDragLeave() {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsDragOver(false);
    }

    // Preventing default is what allow the DROP after drag, otherwise browser rejects
    function handleDragOver(event: DragEvent<HTMLElement>) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event: DragEvent<HTMLElement>) {
        event.preventDefault();
        dragDepth.current = 0;
        setIsDragOver(false);

        const id = event.dataTransfer.getData('text/plain');
        if (id) dispatch({ type: 'task/moved', id, status });
    }

    return (
        <section
            className={`column ${isDragOver ? 'column--dragover' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            aria-label={STATUS_LABELS[status]}
        >
            <header className="column__header">
                <h2 className="column__title">{STATUS_LABELS[status]}</h2>
                <span className="column__count">{tasks.length}</span>
            </header>

            <ul className="column__list">
                {/* A stable id as key keeps a card's edit state with the right
                    task when the list is mapped */}
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </ul>

            {tasks.length === 0 && <p className="column__empty">Nothing here</p>}
        </section>
    );
}