// Catches errors thrown while rendering and shows a recoverable message
// instead of showing an empty page.
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

// Must be a class: there's still no hook for catching render errors
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    // Called during rendering: return new state, do no side effects here.
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    // Called after the error is committed: the right place to log it.
    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("A component crashed while rendering: ", error, info.componentStack);
    }

    render() {
        if (this.state.error !== null) {
            return (
                <div className="error-boundary" role="alert">
                    <h2>Something broke while rendering.</h2>
                    <p>{this.state.error.message}</p>
                    <button
                        className="button button--primary"
                        type="button"
                        onClick={() => this.setState({ error: null })}
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}