import {
    useState,
    useReducer,
    useSyncExternalStore,
    startTransition as reactStartTransition,
    useEffect,
    useTransition,
} from "react";

let suspendersCount = 0;
const observers = new Set<() => void>();
let didCaptureNewState: (() => void) | null = null;

function suspendViewTransitionCapture(): void {
    suspendersCount++;
}

function resumeViewTransitionCapture(): void {
    !--suspendersCount;
    observers.forEach(observer => observer());
}

const areViewTransitionsSupported = typeof globalThis.document?.startViewTransition === "function";

function useBlockRendering(blocked: boolean): void {
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

interface AutoViewTransitionsOnClickProps {
    match?: string;
}

export function AutoViewTransitionsOnClick({ match = "a[href]" }: AutoViewTransitionsOnClickProps): null {
    const [, startTransition] = useTransition();
    const { startViewTransition } = useViewTransition();
    useEffect(() => {
        if (!match || !globalThis.document)
            return;

        function captureClick(event: MouseEvent) {
            const target = event.target as Element;
            if (!target.matches(match) || !event.isTrusted)
                return;

            event.preventDefault();
            event.stopPropagation();
            startViewTransition(() => startTransition(() => target.click()));
        }

        globalThis.document.addEventListener("click", captureClick, { capture: true });
        return () => {
            globalThis.document.removeEventListener("click", captureClick)
        }
    }, []);
    return null;
}

export function SuspendViewTransition(): null {
    useEffect(() => {
        suspendViewTransitionCapture();
        return () => resumeViewTransitionCapture();
    }, []);
    return null;
}

type TransitionState = "idle" | "capturing-old" | "capturing-new" | "animating" | "skipped";

interface ViewTransitionController {
    transitionState: TransitionState;
    startViewTransition: (domUpdateCallback?: () => PromiseLike<void>) => PromiseLike<void> | void;
    suspendViewTransitionCapture: typeof suspendViewTransitionCapture;
    resumeViewTransitionCapture: typeof resumeViewTransitionCapture;
}

export function useViewTransition(): ViewTransitionController {
    const [transitionState, setTransitionState] = useState<TransitionState>("idle");
    useSyncExternalStore(observers.add.bind(observers), () => suspendersCount, () => 0);

    useEffect(() => {
        if (didCaptureNewState && !suspendersCount) {
            didCaptureNewState();
            didCaptureNewState = null;
        }
    });

    useBlockRendering(transitionState === "capturing-old");

    function startViewTransition(updateCallback?: () => PromiseLike<void>): PromiseLike<void> | void {
        // Fallback to simply running the callback soon.
        if (!areViewTransitionsSupported) {
            if (updateCallback)
                reactStartTransition(updateCallback);
            return;
        }

        suspendViewTransitionCapture();
        setTransitionState("capturing-old");
        const transition = document.startViewTransition!(() => new Promise(async resolve => {
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

interface UseAutoViewTransitionsProps {
    enabled?: boolean;
}

export function useAutoViewTransitions({ enabled = true }: UseAutoViewTransitionsProps): void {
    const { transitionState, startViewTransition } = useViewTransition();
    const [isPending] = useTransition();
    useEffect(() => {
        if (enabled && transitionState === "idle" && isPending && areViewTransitionsSupported) {
            startViewTransition();
        }
    }, [transitionState, isPending, enabled]);
}
