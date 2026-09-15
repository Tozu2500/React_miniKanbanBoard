// This is used by the search box, so typing stays instant, while filtering runs less often.
import { useEffect, useState } from 'react';


export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        // Cleanup restarts the countdown on each change instead of stacking timers
        return () => window.clearTimeout(timer);
    }, [value, delay])

    return debounced;
}