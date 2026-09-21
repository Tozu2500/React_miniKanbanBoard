// End-to-end through the real component tree: every interaction goes through
// the DOM the way a user would, so these cover the wiring, not just the logic.
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import type { Task } from './types';
import { todayIsoDate } from './utils/dates';
import { saveTasks } from './utils/storage';

function seed(tasks: Task[]) {
    saveTasks(tasks);
}

function cardTitled(title: string) {
    return within(screen.getByRole('button', { name: title }).closest('li')!);
}

function shiftDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return todayIsoDate(date);
}

describe('App', () => {
    beforeEach(() => {
        seed([
            { id: 't1', title: 'Write the report', status: 'todo', createdAt: 1 },
            { id: 't2', title: 'Ship it', status: 'done', createdAt: 2 },
        ]);
    });

    it('adds a task into the To Do column and clears the form', async () => {
        const user = userEvent.setup();
        render(<App />);

        const input = screen.getByLabelText('New task');
        await user.type(input, '  Buy milk  ');
        await user.click(screen.getByRole('button', { name: 'Add task' }));

        const todo = within(screen.getByRole('region', { name: 'To Do' }));
        expect(todo.getByRole('button', { name: 'Buy milk' })).toBeInTheDocument();
        expect(input).toHaveValue('');
        expect(input).toHaveFocus();
    });

    it('rejects a whitespace-only title with an error', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.type(screen.getByLabelText('New task'), '   ');
        await user.click(screen.getByRole('button', { name: 'Add task' }));

        expect(screen.getByRole('alert')).toHaveTextContent('A task needs a title');
        expect(screen.getAllByTestId('task-card')).toHaveLength(2);
    });

    it('renames a task on Enter, trimming the draft', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: 'Write the report' }));
        const editor = screen.getByRole('textbox', { name: /Edit title of/ });
        await user.clear(editor);
        await user.type(editor, '  Write the summary  {Enter}');

        expect(screen.getByRole('button', { name: 'Write the summary' })).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: /Edit title of/ })).not.toBeInTheDocument();
    });

    it('discards the draft on Escape', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: 'Write the report' }));
        await user.type(screen.getByRole('textbox', { name: /Edit title of/ }), ' NOT SAVED{Escape}');

        expect(screen.getByRole('button', { name: 'Write the report' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /NOT SAVED/ })).not.toBeInTheDocument();
    });

    it('keeps the old title when the draft is cleared, and reopens with it', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: 'Write the report' }));
        await user.clear(screen.getByRole('textbox', { name: /Edit title of/ }));
        await user.tab(); // blur commits; an empty draft must be a no-op

        expect(screen.getByRole('button', { name: 'Write the report' })).toBeInTheDocument();

        // Regression: the editor used to reopen with the stale empty draft
        await user.click(screen.getByRole('button', { name: 'Write the report' }));
        expect(screen.getByRole('textbox', { name: /Edit title of/ })).toHaveValue('Write the report');
    });

    it('moves a task with the arrow buttons', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: 'Move "Write the report" to In Progress' }));

        const inProgress = within(screen.getByRole('region', { name: 'In Progress' }));
        expect(inProgress.getByRole('button', { name: 'Write the report' })).toBeInTheDocument();
    });

    it('flags a past due date as overdue and a future one as due, by local date', () => {
        seed([
            { id: 'p', title: 'Past', status: 'todo', createdAt: 1, dueDate: shiftDays(-1) },
            { id: 'n', title: 'Today', status: 'todo', createdAt: 2, dueDate: shiftDays(0) },
            { id: 'f', title: 'Future', status: 'todo', createdAt: 3, dueDate: shiftDays(1) },
        ]);
        render(<App />);

        expect(cardTitled('Past').getByText(/^Overdue:/)).toBeInTheDocument();
        expect(cardTitled('Today').getByText(/^Due:/)).toBeInTheDocument();
        expect(cardTitled('Future').getByText(/^Due:/)).toBeInTheDocument();
    });

    it('clears done tasks and disables the button once none are left', async () => {
        const user = userEvent.setup();
        render(<App />);

        const clear = screen.getByRole('button', { name: 'Clear done (1)' });
        await user.click(clear);

        expect(screen.queryByRole('button', { name: 'Ship it' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear done (0)' })).toBeDisabled();
    });

    it('shows an empty state when the search hides everything', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.type(screen.getByLabelText('Search'), 'zzz');

        expect(await screen.findByText('No tasks match the current filters.')).toBeInTheDocument();
        expect(screen.queryAllByTestId('task-card')).toHaveLength(0);
    });

    it('persists the board to localStorage', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: 'Delete "Ship it"' }));

        const stored = JSON.parse(window.localStorage.getItem('react-task-board:tasks') ?? '[]');
        expect(stored.map((task: Task) => task.id)).toEqual(['t1']);
    });

    it('accepts a due date from the form', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.type(screen.getByLabelText('New task'), 'Dated');
        fireEvent.change(screen.getByLabelText('Due'), { target: { value: shiftDays(3) } });
        await user.click(screen.getByRole('button', { name: 'Add task' }));

        expect(cardTitled('Dated').getByText(`Due: ${shiftDays(3)}`)).toBeInTheDocument();
    });
});
