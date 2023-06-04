import { useState } from "react";
import { useViewTransition, SuspendViewTransition } from "use-view-transition/react"

async function delay(color) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return color
  }

export function SquareWithDelayedTransition() {
    const [state, setState] = useState("idle");
    const [color, setColor] = useState("blue");
    const { startViewTransition } = useViewTransition();

    return (
      <>
        <div
          id="slow"
          style={{ background: color, color: 'white' }}
          onClick={() => {
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
            "Click"
          )}
        </div>
      </>
    );
  }
