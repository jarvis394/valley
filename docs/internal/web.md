# Web UI

## Primitives

Controls come from [`@valley/ui`](../../packages/ui/src/components).
[AGENTS.md](../../AGENTS.md#taste) says how to use and extend them.

Don't style a raw `<button>`, `<input>`, `<select>`, or `<textarea>` to look like a control a
primitive provides. Raw elements are right when the element isn't that control: semantic rows, tabs,
resize handles, swatches, editor surfaces, anything whose behavior or geometry differs by design.

## Styles

Style with Tailwind classes in the component that renders the element.

- Global CSS, in [`apps/web/src/styles.css`](../../apps/web/src/styles.css),
  [`packages/ui/src/styles.css`](../../packages/ui/src/styles.css) or any other stylesheet, is only
  for what classes on the owning component can't express: generated Markdown or imperative DOM,
  custom elements and shadow roots, animations, theme tokens, and browser integration.
- No `style={{ ... }}` or inline `<style>` for static values a class covers. Values computed at
  runtime are fine.

## Composition

The app sidebar is the reference: [`Sidebar`](../../apps/web/src/components/shell/sidebar.tsx)
holds the slots and [`AppSidebar`](../../apps/web/src/components/shell/app-sidebar.tsx) composes
them.

- Big component exports one object of small slots. Slots own their classes and markup. Variants
  and density are props on `Root` (`collapsed`) and reach the slots through context. A slot that
  needs a control renders a kit one (`IconButton`, `ListItem`).
- Consumers are a few lines of slots that pass data and routing, and the slots carry the styling.

Build new UI the same way. Compose or extend a component instead of copying its markup and classes.
When a call site repeats a treatment another one already uses, make it a variant or a slot on the
shared component.

## Handlers in large components

V8 gives every closure created in one render a single shared scope. A memoized handler keeps
the scope of the render that created it, and that scope holds the other memoized values of that
render. When handlers in one component change at different times, each keeps an older scope that
holds older handlers, and old renders, with the editor state they captured, stay in memory for as
long as the component is mounted. React Compiler's memoized closures do the same.

In large, long-lived components such as `ProjectEditor`, write handlers as plain
functions and wrap them with [`useStableCallback`](../../packages/ui/src/hooks/useStableCallback.ts)
only where they leave the component: props, hook dependency arrays, and effect or memo bodies.
Calls inside the component keep the plain function, so work that resumes after an `await` still
acts on the render it started in. A function that a child calls during render, or after an
`await`, comes from a module-level factory memoized on its inputs, so its closure keeps only
those inputs.

## React Compiler

React Compiler runs on every component and hook the web app builds, including `@valley/ui` and
`@valley/canvas`, through the Babel preset in [`vite.config.ts`](../../apps/web/vite.config.ts).
Under `apps/web/src`, `valley/no-manual-memo` rejects `useMemo`, `useCallback` and `"use memo"`,
which the compiler makes redundant.

The compiler memoizes a function only when it can prove the code follows React's rules. Anything it
can't prove, such as reading a ref during render or calling `setState` from an effect, would make it
skip the whole function. `panicThreshold: 'all_errors'` turns every skip into a build and dev-server
error that names the file and line, so fix the code rather than lowering the threshold.

The compiler withholds a cache scope when a value reaches plain function calls on both sides of a
hook call. Fix the order: plain uses of a value go before the hook, or the helper is inlined. A
`use*` helper that calls no hook is compiled as a plain function and caches nothing, so a
derived-value helper reads its source hook itself instead of taking the value as an argument.
`valley/no-hookless-use-function` rejects a `use*` function that calls no hook. The compiler can't
handle `try` without `catch` or `throw` inside `try`; an async handler chains `.finally()` on its
promise instead.
