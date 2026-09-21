import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { filterTasks, isStatusFilter } from './filterTasks';

const tasks: Task[] = [
    { id: 'a', title: 'Write docs', status: 'todo', createdAt: 1 },
    { id: 'b', title: 'Fix bug', status: 'in-progress', createdAt: 2 },
    { id: 'c', title: 'Write tests', status: 'done', createdAt: 3 },
];

describe('filterTasks', () => {
    it('returns everything for an empty search and "all"', () => {
        expect(filterTasks(tasks, { search: '', status: 'all' })).toEqual(tasks);
    });

    it('matches the search case-insensitively and ignores surrounding whitespace', () => {
        const result = filterTasks(tasks, { search: '  WRITE ', status: 'all' });

        expect(result.map((task) => task.id)).toEqual(['a', 'c']);
    });

    it('combines the search with the status filter', () => {
        const result = filterTasks(tasks, { search: 'write', status: 'done' });

        expect(result.map((task) => task.id)).toEqual(['c']);
    });
});

describe('isStatusFilter', () => {
    it('accepts "all" and every status', () => {
        expect(isStatusFilter('all')).toBe(true);
        expect(isStatusFilter('todo')).toBe(true);
        expect(isStatusFilter('in-progress')).toBe(true);
        expect(isStatusFilter('done')).toBe(true);
    });

    it('rejects anything else', () => {
        expect(isStatusFilter('archived')).toBe(false);
        expect(isStatusFilter(null)).toBe(false);
        expect(isStatusFilter(3)).toBe(false);
    });
});
