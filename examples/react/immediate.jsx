import { useReducer } from "react";
import { useViewTransition } from "use-view-transition/react"
export function SquareWithImmediateTransition() {
    const [on, toggle] = useReducer((x) => !x, false);
    const { startViewTransition } = useViewTransition();
    return (
      <div
        id="square"
        className={on ? "on" : "off"}
        onClick={() => startViewTransition(toggle)}
      >
        Click Me!
      </div>
    );
  }