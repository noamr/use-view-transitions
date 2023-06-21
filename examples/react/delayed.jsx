import { useState, useReducer } from "react";
import { useViewTransition, SuspendViewTransition } from "../../src/react-vt"

async function delay(color) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return color
  }

export function SquareWithDelayedTransition() {
    const [state, setState] = useState("idle");
    const [count, inc] = useReducer(x => x + 1, 0);
    const [color, setColor] = useState("blue");
    const { startViewTransition } = useViewTransition();

    return (
      <>
        <div
          id="slow"
          style={{ background: color, color: 'white' }}
          onClick={() => {
            inc();
            startViewTransition(async () => {
              setState("computing");
              setColor(await delay(color === "blue" ? "green" : "blue"));
              setState("idle");
            });
          }}
        >
          {state === "computing" ? (
            <>
              <div>...</div>
              <SuspendViewTransition />
            </>
          ) : (
            `Click ${count}`
          )}
        </div>
      </>
    );
  }
