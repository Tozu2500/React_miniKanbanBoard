// Runs before every test file (see `test.setupFiles` in vite.config.ts).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
    // Testing Library only auto-cleans when `afterEach` is a global, and this
    // project keeps vitest globals off, so unmount explicitly.
    cleanup();
    // Persistence is under test; do not let one test's board leak into the next.
    window.localStorage.clear();
});
