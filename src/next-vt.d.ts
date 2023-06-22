import * as React from 'react';

export { SuspendViewTransition, useViewTransition } from './react-vt';

interface UseNextRouterViewTransitionsProps {
    events: {on: (event: string, callback: Function) => void, off: (event: string, callback: Function) => void};
}

export function useNextRouterViewTransitions(props: UseNextRouterViewTransitionsProps): void;

export function EnableNextAppRouterViewTransitions(): React.ReactElement;
