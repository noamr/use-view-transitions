import {
    useState,
    useReducer,
    useSyncExternalStore,
    startTransition,
    useEffect,
    useTransition,
} from "react";

let suspendersCount = 0;
const observers = new Set();
let didCaptureNewState = null;

function suspendViewTransitionCapture() {
    suspendersCount++;
}

function resumeViewTransitionCapture() {
    !--suspendersCount;
    observers.forEach(observer => observer());
}

const areViewTransitionsSupported = typeof globalThis.document?.startViewTransition === "function";

/**
 * An internal hook (for now) that blocks non-critical rendering until
 * it's unblocked. This is used to make sure useTransition() always yields
 * to the next frame, regardless of how long this render takes.
 *
 * Sorry that this is ugly. Hopefully NextJS would provide built-in support
 * for view-transitions or React would provide "force transition" or so, and
 * then we can get rid of this.
 *
 * @private
 *
 * @param {boolean} blocked whether rendering should still be blocked.
 */
function useBlockRendering(blocked) {
    const [, forceRender] = useReducer(x => x + 1, 0);
    if (blocked) {
        const deadline = performance.now() + 1;
        while (performance.now() < deadline) {
            // Do nothing. Busy wait to make sure react rerenders.
        }
    }
    useEffect(() => {
        if (blocked)
            forceRender();
    });
}

/**
 * A React component to automatically start a view-transition when
 * elements matching a particular CSS selector are clicked.
 *
 * This is useful for enabling view-transitions, for example, in existing
 * code that uses NextJS's <Link>.
 *
 * When used, this would capture click events, and if they match the selector,
 * would start a transition and re-dispatch the click event once the old state
 * is captured.
 *
 * @type {React.FC<{match: string}>}
 * @returns {React.ReactElement}
 */
export function AutoViewTransitionsOnClick({match} = {match: "a[href]"}) {
    const [, startTransition] = useTransition();
    const {startViewTransition} = useViewTransition();
    useEffect(() => {
      if (!match || !globalThis.document)
        return;

      function captureClick(event) {
        if (!event.target.matches(match) || !event.isTrusted)
          return;

        event.preventDefault();
        event.stopPropagation();
        startViewTransition(() => startTransition(() => event.target.click()));
      }

      globalThis.document.addEventListener("click", captureClick, {capture: true});
      return () => {
        globalThis.document.removeEventListener("click", captureClick)
      }
    }, []);
    return null;
  }

/**
 * A React component that suspends beginning a
 * view transition until it is removed.
 *
 * This allows the developer to avoid showing intermediate
 * application states, and wait until it settles before starting
 * the animation.
 *
 * Note that it only suspends the transition before
 * capturing the new state.
 *
 * @type {React.FC<{}>}
 * @returns {React.ReactElement}
 */
export function SuspendViewTransition() {
    useEffect(() => {
        suspendViewTransitionCapture();
        return () => resumeViewTransitionCapture();
    }, []);
    return null;
}

/**
 * @callback TransitionDOMUpdateCallback
 * @returns {PromiseLike<void>} a promise that's resolved
 *
 * @callback StartVT
 * @param {TransitionDOMUpdateCallback?} domUpdateCallback - A callback that would update the new state.
 * @returns {PromiseLike<void>} a promise that's resolved
 *
 * @typedef {Object} ViewTransitionController
 * @property {"idle" | "capturing-old" | "capturing-new" | "animating"} transitionState - The current state of the transition
 * @property {StartVT} startViewTransition - Start a view transition, givenan optional callback to be called once the old state has been captured.
 *
 * Allows using CSS view-transitions in a React app.
 * Use it in the same way you'd use `React.startTransition`](https://react.dev/reference/react/startTransition)`.
 * Another way to use it is to simply call `startViewTransition()`, and any calls to `React.startTransition` would
 * be executed after the old state had been capture.
 *
 * @example
 * const {startTransition} = useViewTransition();
 * return <button onClick={() => startViewTransition(() => { setState(...) })}>Click</button>
 *
 * @example
 * const {startTransition} = useViewTransition();
 * return <button onClick={() => { startViewTransition(); startTransition(doSomething(...)); })}>Click</button>
 *
 *
 * @returns {ViewTransitionController} the controller object
 */
export function useViewTransition() {
    const [transitionState, setTransitionState] = useState("idle");
    useSyncExternalStore(observer => {
        observers.add(observer);
        return () => observers.delete(observer);
    }, () => suspendersCount, () => 0);

    useEffect(() => {
        if (didCaptureNewState && !suspendersCount) {
            didCaptureNewState();
            didCaptureNewState = null;
        }
    });

    useBlockRendering(transitionState === "capturing-old");

    function startViewTransition(updateCallback) {
        // Fallback to simply running the callback soon.
        if (!areViewTransitionsSupported) {
            if (updateCallback)
                startTransition(updateCallback);
            return;
        }

        suspendViewTransitionCapture();
        setTransitionState("capturing-old");
        const transition = document.startViewTransition(() => new Promise(async resolve => {
            setTransitionState("capturing-new");
            resumeViewTransitionCapture();
            if (updateCallback)
                await updateCallback();
            didCaptureNewState = resolve;
        }));

        transition.finished.then(() => {
            setTransitionState("idle");
        });

        transition.ready.then(() => {
            setTransitionState("animating");
        }).catch(e => {
            console.error(e)
            setTransitionState("skipped");
        });
    }

    return {
        transitionState,
        startViewTransition,
        suspendViewTransitionCapture,
        resumeViewTransitionCapture
    };
}

export function useAutoViewTransitions({enabled} = {enabled: true}) {
    const {transitionState, startViewTransition} = useViewTransition();
    const [isPending] = useTransition();
    useEffect(() => {
        if (enabled && transitionState === "idle" && isPending && areViewTransitionsSupported) {
            startViewTransition();
        }
    }, [transitionState, isPending, enabled]);
}