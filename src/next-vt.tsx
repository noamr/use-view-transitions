import {
    useViewTransition,
    SuspendViewTransition
} from "./react-vt";
import {
    useEffect,
    Suspense,
    FC,
} from "react";
import React from "react";

export { SuspendViewTransition, useViewTransition } from "./react-vt";

interface UseNextRouterViewTransitionsProps {
    events: {
        on: (event: string, handler: () => void) => void;
        off: (event: string, handler: () => void) => void;
    };
}

/**
 * Performs CSS view transitions automatically when a NextJS navigation takes place.
 *
 * Use this hook in your _app.js.
 *
 */
export function useNextRouterViewTransitions({ events }: UseNextRouterViewTransitionsProps): void {
    const {
        startViewTransition,
        suspendViewTransitionCapture,
        resumeViewTransitionCapture
    } = useViewTransition();

    useEffect(() => {
        function beginNavigation(): void {
            startViewTransition();
            suspendViewTransitionCapture();
        };

        function endNavigation(): void {
            resumeViewTransitionCapture();
        }

        events.on("routeChangeStart", beginNavigation);
        events.on("routeChangeComplete", endNavigation);
        return () => {
            events.off("routeChangeStart", beginNavigation);
            events.off("routeChangeComplete", endNavigation);
        };
    }, []);
}

function RouterEventsNotifier(): null {
    return null;
}

/**
 * A React component that makes sure view-transitions
 * behave nicely with NextJS app router.
 *
 * Specifically, it suspends capturing the new state until the
 * navigation is complete.
 *
 * @type {React.FC<{}>}
 * @returns {React.ReactElement}
 */
export const EnableNextAppRouterViewTransitions: FC = () => {
    return (
        <Suspense fallback={<SuspendViewTransition />}>
            <RouterEventsNotifier />
        </Suspense>
    );
}
