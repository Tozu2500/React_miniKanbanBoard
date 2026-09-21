import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { tasksReducer } from './tasksReducer';

const base: Task[] = [
    { id: 'a', title: 'Alpha', status: 'todo', createdAt: 1 },
    { id: 'b', title: 'Beta', status: 'in-progress', createdAt: 2 },
    { id: 'c', title: 'Gamma', status: 'done', createdAt: 3 },
];

describe('tasksReducer', () => {
    it('adds a task to the todo column', () => {
        const next = tasksReducer(base, {
            type: 'task/added',
            id: 'd',
            title: 'Delta',
            createdAt: 4,
            dueDate: '2026-10-01',
        });

        expect(next).toHaveLength(4);
        expect(next[3]).toEqual({
            id: 'd',
            title: 'Delta',
            status: 'todo',
            createdAt: 4,
            dueDate: '2026-10-01',
        });
    });

    it('renames only the matching task and keeps the others by reference', () => {
        const next = tasksReducer(base, { type: 'task/renamed', id: 'b', title: 'Beta 2' });

        expect(next[1].title).toBe('Beta 2');
        expect(next[0]).toBe(base[0]);
        expect(next[2]).toBe(base[2]);
    });

    it('moves a task between statuses', () => {
        const next = tasksReducer(base, { type: 'task/moved', id: 'a', status: 'done' });

        expect(next[0].status).toBe('done');
        expect(next[1]).toBe(base[1]);
    });

    it('deletes a task', () => {
        const next = tasksReducer(base, { type: 'task/deleted', id: 'b' });

        expect(next.map((task) => task.id)).toEqual(['a', 'c']);
    });

    it('clears every done task', () => {
        const next = tasksReducer(base, { type: 'task/doneCleared' });

        expect(next.map((task) => task.id)).toEqual(['a', 'b']);
    });

    it('never mutates the previous state', () => {
        const snapshot = structuredClone(base);

        tasksReducer(base, { type: 'task/renamed', id: 'a', title: 'Changed' });
        tasksReducer(base, { type: 'task/deleted', id: 'a' });

        expect(base).toEqual(snapshot);
    });
});
