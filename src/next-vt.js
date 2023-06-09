import {
    useViewTransition
} from "./react-vt";

import {
    useEffect,
    Suspense
} from "react";

export { SuspendViewTransition, useViewTransition } from "./react-vt";

/**
 * Performs CSS view transitions automatically when a NextJS navigation takes place.
 *
 * Use this hook in your _app.js.
 *
 */
export function useNextRouterViewTransitions({
    events
}) {
    const {
        startViewTransition,
        suspendViewTransitionCapture,
        resumeViewTransitionCapture
    } = useViewTransition();

    useEffect(() => {
        function beginNavigation() {
            startViewTransition();
            suspendViewTransitionCapture();
        };

        function endNavigation() {
            resumeViewTransitionCapture();
        }

        events.on("routeChangeStart", beginNavigation);
        events.on("routeChangeComplete", endNavigation);
        return () => {
            events.off("routerChangeStart", beginNavigation);
            events.off("routeChangeComplete", endNavigation);
        };
    }, []);
}

function RouterEventsNotifier() {
  usePathname();
  useSearchParams();
  return null;
}

/**
 * A React component that that makes sure view-transitions
 * behave nicely with NextJS app router.
 *
 * Specifically, it suspends capturing the new state until the
 * navigation is complete.
 *
 * @type {React.FC<{}>}
 * @returns {React.ReactElement}
 */
export function EnableNextAppRouterViewTransitions({}) {
  return <Suspense fallback={<SuspendViewTransition/>}>
    <RouterEventsNotifier />
  </Suspense>
}