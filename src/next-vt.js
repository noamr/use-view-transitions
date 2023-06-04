import {
    useViewTransition
} from "./react-vt";

export {useViewTransition, SuspendViewTransition} from "./react-vt";

import {
    useEffect
} from "react";

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