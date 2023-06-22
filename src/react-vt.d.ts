import * as React from 'react';

export interface ViewTransitionController {
    transitionState: "idle" | "capturing-old" | "capturing-new" | "animating" | "skipped";
    startViewTransition(domUpdateCallback?: TransitionDOMUpdateCallback): PromiseLike<void>;
    suspendViewTransitionCapture(): void;
    resumeViewTransitionCapture(): void;
}

export type TransitionDOMUpdateCallback = () => PromiseLike<void>;

export function useViewTransition(): ViewTransitionController;

export function SuspendViewTransition(): React.ReactElement;

interface AutoViewTransitionsOnClickProps {
    match?: string;
}

export function AutoViewTransitionsOnClick(props: AutoViewTransitionsOnClickProps): React.ReactElement;

interface useAutoViewTransitionsProps {
    enabled?: boolean;
}

export function useAutoViewTransitions(props: useAutoViewTransitionsProps): void;
