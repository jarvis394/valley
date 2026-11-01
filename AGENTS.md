## Taste

- Complexity belongs at the adapter boundary. Orchestration stays pure, UI stays dumb.
- `@valley/ui` components (`packages/ui/src/components`) own their look. Pick a `variant`, `size` or state prop; do not restyle one with `className`. If none fits and the look is a generic concept, add a variant or prop to the component; a look that belongs to one feature stays in that feature's own component, not in `packages/ui`. Only layout classes (width, flex, margin, position) go in a kit component's `className`. No lint rule checks this yet. See [Web UI](docs/internal/web.md).
- Sizes come from the theme. Spacing and sizing use Tailwind's 4px steps (`h-13`, not `h-[52px]`). Font sizes use the type scale in `packages/ui/src/styles.css` (`text-caption`, `text-small`, `text-body`, `text-title`, `text-heading`, `text-display`), each with its own line height; Tailwind's `text-xs`..`text-9xl` are removed. `valley/tailwind-scale` enforces both and autofixes the spacing.
- Inferred types over annotations. `any` is the enemy.
- Default to no comment. Write one only for a constraint, an external quirk, or an invariant the code can't show, in one line where you can and four at most. Don't restate names or signatures, narrate steps, record history, or explain the fix you just made; the PR carries that. `valley/no-low-value-comments` enforces the length cap and the mechanical cases.
- Function bodies read top to bottom as values, then helper functions, then the return, with a blank line between each group. At module scope, keep a blank line around any multi-line statement. `valley/statement-padding` enforces this and autofixes the blank lines; moving a value above the helpers is manual.
- React effects are for synchronizing with something outside React. Derive in render and act in handlers instead of syncing state, but don't hide real lifecycle work in refs or stores to dodge one. The `valley/no-unreasoned-state-sync` lint rule reports every effect; one that stays states its reason with `// oxlint-disable-next-line valley/no-unreasoned-state-sync -- <why>`.
- If a rule here fights the task in front of you, say so loudly and get a human sign-off before breaking it.

## Additional tips

- Don't verify with browsers or computer use unless the user explicitly agrees or requests it.
