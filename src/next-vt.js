import {
    useRouter
} from "next/router";

import {
    useViewTransition
} from "./react-vt";

/**
 * Performs CSS view transitions automatically when a NextJS navigation takes place.
 *
 * Use this hook in your _app.js.
 *
 */
export function useNextRouterViewTransitions() {
    const {
        events
    } = useRouter();

    const {
        startViewTransition,
        suspend,
        resume
    } = useViewTransition();

    useEffect(() => {
        function beginNavigation() {
            startViewTransition();
            suspend();
        };

        function endNavigation() {
            resume();
        }

        events.on("routeChangeStart", beginNavigation);
        events.on("routeChangeComplete", endNavigation);
        return () => {
            events.off("routerChangeStart", beginNavigation);
            events.off("routeChangeComplete", endNavigation);
        };
    }, [startViewTransition, events]);
}