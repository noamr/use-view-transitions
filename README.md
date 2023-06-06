# Using CSS same-document view-transitions with React

## Overview
[CSS view transitions](https://drafts.csswg.org/css-view-transitions-1/) are a new feature that allows for expressive
animations between states.

The main syntax for view-transitions looks something like this:
```js
document.startViewTransition(() => updateDOMAndReturnPromise())
```

There are several ways to use this API in a [React](https://react.dev/) or [NextJS](https://nextjs.org/) single-page app.

## React

### Using [`flushSync`](https://react.dev/reference/react-dom/flushSync)

This is the most basic way, and it doesn't require too much magic.

```js
document.startViewTransition(() =>
    ReactDOM.flushSync(() => {
        // set the "after" state here, synchronously.
    })
);
```

This approach should work for the common cases, but some apps don't work well
with synchronous updates. For example, some components might rely on some fast
asynchronous work to display correctly. When using [`flushSync`](https://react.dev/reference/react-dom/flushSync),
any asynchronous work would be rendered after the transition is complete.

### The `useViewTransition` hook

This hook would work for asynchronous operations, and would work without `flushSync` out of the box.
By default, it works like [React.startTransition](https://react.dev/reference/react/startTransition),
but would execute the CSS view-transition without a `flushSync`:

```jsx
import {useViewTransition} from "use-view-transitions/react";

const {startViewTransition} = useViewTransition();
const [value, increment] = useReducer(x => x + 1, 0);
return <>
  <button onClick={() => startViewTransition(() => increment())}>Increment</button>
  {value}
</button>
```

Using `useViewTrantision` together with the `<SuspendViewTransitions />` component, you can suspend
capturing the new state until ready.


```jsx
import {useViewTransition, SuspendViewTransition} from "use-view-transitions/react";
const {startViewTransition} = useViewTransition();
const [isLoading, setLoading] = useState(false);

// Don't use this code for real, it's simulation for something that loads asynchronously.
useEffect(() => {
    if (isLoading)
        setTimeout(() => {
            setLoading(false);
        }, 100);
}, [isLoading]);

return <>
  <button onClick={() => startViewTransition(() => {setLoading(true); })}>Load</button>
  {
    // This would suspend capturing the "new" state of the transition until loaded.
    isLoading ? <SuspendViewTransition /> : null
  }
</button>
```

Note that like in the `flushSync` case, unrelated changes wrapped in `React.startTransition` would only
execute as part of capturing the new state.

## NextJS

Since NextJS is based on React, using the above technique would work in most cases.
However, some state changes and event handlers happen within NextJS itself, e.g. navigating
to routes based on link clicks.

For that, we offer the `useNextRouterViewTransitions()` hook:

```jsx
// _app.js

import {useNextRouterViewTransitions} from "use-view-transitions/next";

useNextRouterViewTransitions();

return (
<>
    <Layout>
        <Component {...pageProps} />
    </Layout>
</>

```

The hook listens to NextJS's [router events](https://nextjs.org/docs/pages/api-reference/functions/use-router#routerevents)
and uses the React hook internally to make sure that the old state is captured before the navigation is executed.

## Examples

- [A very simply NextJS example](https://codesandbox.io/p/github/noamr/nextjs-view-transitions-simple-example/)
- [NextJS Movies App with view transitions](https://github.com/noamr/next-movies/tree/vt) (see [live demo](https://next-movies-with-view-transitions.vercel.app/))