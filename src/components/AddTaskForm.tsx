// Controlled form for creating a task. React state is the source of truth for
// both inputs, which is what allows the validation and the disabled button.
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTasksDispatch } from "../context/TasksContext";
import { newId } from "../utils/ids";

export function AddTaskForm() {
    const dispatch = useTasksDispatch();

    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmed = title.trim();
        if (trimmed === "") {
            setError("A task needs a title");
            return;
        }

        dispatch({
            type: 'task/added',
            // Impure values are created here so the reducer stays pure
            id: newId(),
            createdAt: Date.now(),
            title: trimmed,
            dueDate: dueDate || undefined,
        });

        setTitle("");
        setDueDate("");
        setError(null);
        inputRef.current?.focus();
    }

    return (
        <form className="add-form" onSubmit={handleSubmit} aria-label="Add task">
            <div className="add-form__row">
                <label className="field">
                    <span className="field__label">New task</span>
                    <input
                        ref={inputRef}
                        className="field__input"
                        value={title}
                        placeholder="What needs doing?"
                        onChange={(event) => {
                            setTitle(event.target.value);
                            if (error) setError(null);
                        }}
                        aria-invalid={error !== null}
                        aria-describedby={error ? 'add-form-error' : undefined}
                    />
                </label>

                <label className="field field--narrow">
                    <span className="field__label">Due</span>
                    <input 
                        className="field__input"
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                    />
                </label>

                    {/* `=== ''`, not `.trim() === ''`: whitespace still enables the
                    button, so submitting it explains the problem instead of
                    leaving a disabled control that cannot say why. */}
                <button className="button button--primary" type="submit" disabled={title === ""}>
                    Add task
                </button>
            </div>

            {error !== null && (
                <p className="add-form__error" id="add-form-error" role="alert">
                    {error}
                </p>
            )}
        </form>
    );
}