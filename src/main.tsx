// Entry point. Mounts the app into #root and wraps it in the error boundary.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

// getElementById returns `HTMLElement | null`; throwing beats a `!` assertion
// and a silent blank page.
const container = document.getElementById('root');
if (!container) {
    throw new Error('No #root element found in index.html');
}

// StrictMode double-invokes renders, reducers and effects in development to
// surface impurity and missing cleanups. It does nothing in production.
createRoot(container).render(
    <StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </StrictMode>,
);
