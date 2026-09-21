import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { isSortMode, sortTasks } from './sortTasks';

const tasks: Task[] = [
    { id: 'a', title: 'Charlie', status: 'todo', createdAt: 2, dueDate: '2026-03-01' },
    { id: 'b', title: 'alpha', status: 'todo', createdAt: 3 },
    { id: 'c', title: 'Bravo', status: 'todo', createdAt: 1, dueDate: '2026-01-15' },
];

const ids = (list: readonly Task[]) => list.map((task) => task.id);

describe('sortTasks', () => {
    it('sorts newest first', () => {
        expect(ids(sortTasks(tasks, 'created-desc'))).toEqual(['b', 'a', 'c']);
    });

    it('sorts oldest first', () => {
        expect(ids(sortTasks(tasks, 'created-asc'))).toEqual(['c', 'a', 'b']);
    });

    it('sorts by due date with undated tasks last', () => {
        expect(ids(sortTasks(tasks, 'due-date'))).toEqual(['c', 'a', 'b']);
    });

    it('sorts by title using locale rules, not code points', () => {
        expect(ids(sortTasks(tasks, 'title'))).toEqual(['b', 'c', 'a']);
    });

    it('does not mutate the input', () => {
        const before = ids(tasks);
        sortTasks(tasks, 'title');
        expect(ids(tasks)).toEqual(before);
    });
});

describe('isSortMode', () => {
    it('accepts every real mode', () => {
        expect(isSortMode('created-desc')).toBe(true);
        expect(isSortMode('created-asc')).toBe(true);
        expect(isSortMode('due-date')).toBe(true);
        expect(isSortMode('title')).toBe(true);
    });

    it('rejects unknown strings, inherited property names and non-strings', () => {
        expect(isSortMode('priority')).toBe(false);
        expect(isSortMode('toString')).toBe(false);
        expect(isSortMode('constructor')).toBe(false);
        expect(isSortMode(undefined)).toBe(false);
        expect(isSortMode({})).toBe(false);
    });
});
