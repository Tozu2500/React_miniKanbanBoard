import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

type Mode = 'a' | 'b';
const isMode = (value: unknown): value is Mode => value === 'a' || value === 'b';

describe('useLocalStorage', () => {
    it('starts from the initial value and persists updates', () => {
        const { result } = renderHook(() => useLocalStorage<Mode>('k', 'a', isMode));

        expect(result.current[0]).toBe('a');

        act(() => result.current[1]('b'));

        expect(result.current[0]).toBe('b');
        expect(JSON.parse(window.localStorage.getItem('k') ?? 'null')).toBe('b');
    });

    it('restores a stored value that passes the guard', () => {
        window.localStorage.setItem('k', JSON.stringify('b'));

        const { result } = renderHook(() => useLocalStorage<Mode>('k', 'a', isMode));

        expect(result.current[0]).toBe('b');
    });

    it('ignores a stored value that fails the guard', () => {
        window.localStorage.setItem('k', JSON.stringify('stale-mode'));

        const { result } = renderHook(() => useLocalStorage<Mode>('k', 'a', isMode));

        expect(result.current[0]).toBe('a');
    });

    it('ignores unparseable storage', () => {
        window.localStorage.setItem('k', '{{{');

        const { result } = renderHook(() => useLocalStorage<Mode>('k', 'a', isMode));

        expect(result.current[0]).toBe('a');
    });
});
