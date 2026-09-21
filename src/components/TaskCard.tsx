// One task. Owns its own "is someone editing me -state", and acts as the drag
// source for moving between columns.
import { memo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import type { Status, Task } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "../types";
import { useTasksDispatch } from "../context/TasksContext";
import { todayIsoDate } from "../utils/dates";

interface TaskCardProps {
    task: Task;
}

// Helpers, defined outside of the component so they are not recreated per renders.
function nextStatus(status: Status): Status | null {
    const index = STATUS_ORDER.indexOf(status);
    return STATUS_ORDER[index + 1] ?? null;
}

function previousStatus(status: Status): Status | null {
    const index = STATUS_ORDER.indexOf(status);
    return index > 0 ? STATUS_ORDER[index - 1] : null;
}

function describeDueDate(dueDate: string): { label: string; overdue: boolean } {
    // Both sides are local `YYYY-MM-DD` strings, so a plain string compare works
    return { label: dueDate, overdue: dueDate < todayIsoDate() };
}

function TaskCardImpl({ task }: TaskCardProps) {
    const dispatch = useTasksDispatch();

    // "Is this card being edited?" concerns only this card, so it lives here
    // rather than in the shared reducer.
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(task.title);

    // Escape unmounts the focused input, and some browsers (Chrome) fire `blur`
    // on removal. That blur would run `commitEdit` with the draft the user just
    // cancelled, so cancel raises this flag first and commit checks it. A ref,
    // not state: it must be visible synchronously, before the next render.
    const cancelledRef = useRef(false);

    // Seeded from the task each time, so a cleared or untrimmed draft from a
    // previous edit does not leak into the next one
    function startEdit() {
        cancelledRef.current = false;
        setDraft(task.title);
        setIsEditing(true);
    }

    function commitEdit() {
        if (cancelledRef.current) return;

        const trimmed = draft.trim();
        if (trimmed !== '' && trimmed !== task.title) {
            dispatch({ type: 'task/renamed', id: task.id, title: trimmed });
        }
        setIsEditing(false);
    }

    function cancelEdit() {
        cancelledRef.current = true;
        setDraft(task.title);
        setIsEditing(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') commitEdit();
        if (event.key === 'Escape') cancelEdit();
    }

    // `Column` reads this id back in its `onDrop`.
    function handleDragStart(event: DragEvent<HTMLElement>) {
        event.dataTransfer.setData('text/plain', task.id);
        event.dataTransfer.effectAllowed = 'move';
    }

    const forward = nextStatus(task.status);
    const backward = previousStatus(task.status);
    const due = task.dueDate ? describeDueDate(task.dueDate) : null;

    return (
        <li
            className={`card card--${task.status}`}
            draggable={!isEditing}
            onDragStart={handleDragStart}
            data-testid="task-card"
        >
            {isEditing ? (
                <input
                    className="card__edit"
                    value={draft}
                    autoFocus
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={commitEdit}
                    aria-label={`Edit title of ${task.title}`}
                />
            ) : (
                <button
                    className="card__title"
                    type="button"
                    onClick={startEdit}
                    title="Click to rename"
                >
                    {task.title}
                </button>
            )}

            {due && (
                <span className={`card__due ${due.overdue ? 'card__due--overdue' : ''}`}>
                    {due.overdue ? 'Overdue: ' : 'Due: '}
                    {due.label}
                </span>
            )}

            <div className="card__actions">
                {/* Drag and drop is not keyboard accessible, so every move is
                    also available as a button. */}
                {backward && (
                    <button
                        className="button button--ghost"
                        type="button"
                        onClick={() => dispatch({ type: 'task/moved', id: task.id, status: backward })}
                        aria-label={`Move "${task.title}" to ${STATUS_LABELS[backward]}`}
                    >
                        ←
                    </button>
                )}
                {forward && (
                    <button
                        className="button button--ghost"
                        type="button"
                        onClick={() => dispatch({ type: 'task/moved', id: task.id, status: forward })}
                        aria-label={`Move "${task.title}" to ${STATUS_LABELS[forward]}`}
                    >
                        →
                    </button>
                )}
                <button
                    className="button button--ghost button--danger"
                    type="button"
                    onClick={() => dispatch({ type: 'task/deleted', id: task.id })}
                    aria-label={`Delete "${task.title}"`}
                >
                    ✕
                </button>
            </div>
        </li>
    );
}

// Pulls `dispatch` from context rather than taking callback props, so `task` is
// the only prop and unchanged cards can skip re-rendering.
export const TaskCard = memo(TaskCardImpl);