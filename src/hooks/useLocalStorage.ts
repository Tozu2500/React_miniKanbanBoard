// Generic: works for any JSON-serializable value and the return type follows
// whatever you pass as the initial value
import { useEffect, useState } from "react";

// useState that persists to localStorage under key.
// `isValid` is a type guard run on whatever comes back from storage: a stale
// or hand-edited value (say, a sort mode this version no longer has) falls
// back to `initialValue` instead of leaking into the UI as an impossible state.
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    isValid: (value: unknown) => value is T = (value): value is T => value !== undefined,
) {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = window.localStorage.getItem(key);
            if (stored === null) return initialValue;

            const parsed: unknown = JSON.parse(stored);
            return isValid(parsed) ? parsed : initialValue;
        } catch (error) {
            console.warn(`Could not read localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Could not write localStorage key "${key}":`, error);
        }
    }, [key, value]);

    return [value, setValue] as const;
}
