import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { loadTasks, saveTasks, seedTasks } from './storage';

const STORAGE_KEY = 'react-task-board:tasks';

describe('loadTasks', () => {
    it('seeds the board when nothing is stored', () => {
        expect(loadTasks().map((task) => task.id)).toEqual(seedTasks().map((task) => task.id));
    });

    it('round-trips what saveTasks wrote', () => {
        const tasks: Task[] = [
            { id: 'x', title: 'Saved', status: 'done', createdAt: 5, dueDate: '2026-02-02' },
        ];

        saveTasks(tasks);

        expect(loadTasks()).toEqual(tasks);
    });

    it('keeps an intentionally empty board empty', () => {
        saveTasks([]);

        expect(loadTasks()).toEqual([]);
    });

    it('drops entries that do not look like tasks', () => {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([
                { id: 'ok', title: 'Fine', status: 'todo', createdAt: 1 },
                { id: 'bad-status', title: 'Nope', status: 'archived', createdAt: 1 },
                { id: 'bad-date', title: 'Nope', status: 'todo', createdAt: 1, dueDate: 42 },
                'not an object',
                null,
            ]),
        );

        expect(loadTasks().map((task) => task.id)).toEqual(['ok']);
    });

    it('falls back to the seed on corrupt JSON or a non-array', () => {
        window.localStorage.setItem(STORAGE_KEY, '{not json');
        expect(loadTasks()).toHaveLength(seedTasks().length);

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: [] }));
        expect(loadTasks()).toHaveLength(seedTasks().length);
    });
});
