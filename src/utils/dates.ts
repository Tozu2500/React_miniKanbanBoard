// Date helpers for the `YYYY-MM-DD` strings an <input type="date"> produces.

// The input gives a *local* date, so "today" must be built from the local
// getters too. `toISOString()` would give the UTC date, which is a different
// day for a few hours around midnight anywhere outside UTC.
export function todayIsoDate(now: Date = new Date()): string {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
