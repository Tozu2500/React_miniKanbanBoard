// Unique ids for new tasks. `crypto.randomUUID` only exists in secure
// contexts (HTTPS or localhost), so opening a `vite preview --host` build over
// plain http on a LAN address would otherwise throw when adding a task.
export function newId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
