# Architecture Audit, Code Smells & Canvas Roadmap

This document catalogs architectural blockers, code smells, and concrete bugs across the Valley repository, with a specific focus on evolving `@valley/canvas` into a **Figma-like, mostly 1D canvas editor with real 2D Frames**.

---

## 1. Strategic Question: 1D Block Editor + Bolted-on 2D vs. "Dumbed-Down" Full Canvas

> _Should Valley keep a 1D block editor with special 2D exceptions, or build a full-fledged canvas editor and constrain the UX?_

**Verdict: Build a unified, Framer-style DOM/CSS scene graph with Figma Auto-Layout semantics, and constrain the UX through progressive disclosure — do NOT build a WebGL / `<canvas>` renderer.**

### Why the current hybrid model will fight you

Right now, Valley is a **1D document-stack editor** with two incompatible layout escape hatches bolted onto it:

- `placement: { mode: 'flow' } | { mode: 'absolute', x, y, width, rotation, z }` ([`placement.ts`](../packages/canvas/src/core/placement.ts))
- `container: { layout: 'stack' } | { layout: 'slots' }` ([`registry/types.ts`](../packages/canvas/src/registry/types.ts))

Every time you need a new spatial layout (cover text overlay, side-by-side split, collage, photo row, floating caption), you either hardcode another bespoke React layout component (`COVER_VARIANTS` has 8 hardcoded layouts) or add special-case branches inside leaf blocks (`if (inSlot)` in [`text/index.tsx`](../packages/canvas/src/blocks/text/index.tsx)). Adding a real `Frame` container onto this foundation will immediately collide with hardcoded flow chrome, single-axis DnD, percentage-of-page-height `y` coordinates, and a root-only outline.

### Comparing the three architectures

| Dimension                              | Current (1D Stack + Bolted-on Absolute/Slots)           | Unified DOM/CSS Frame + Auto-Layout Engine _(Recommended)_                         | Full WebGL / Canvas2D Engine (Figma-style renderer)                           |
| :------------------------------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Mental model**                       | 3 special cases: `FlowItem`, `SlotItem`, `AbsoluteItem` | 1 primitive: `Frame` (Auto-Layout vertical/horizontal/free) + child sizing/pinning | Custom 2D scene graph + custom text/layout engine                             |
| **1D-first UX**                        | Native, but brittle once nested                         | Native: `Page` defaults to a vertical Auto-Layout `Frame`                          | Requires re-implementing responsive flow from scratch                         |
| **2D Frames & overlays**               | Broken by flow chrome & page-height `%` coordinates     | First-class: a `Frame` with `layout: 'free'` or child `position: 'absolute'`       | Native                                                                        |
| **Published gallery (`apps/gallery`)** | Clean SSR HTML/CSS + static export                      | Same clean SSR HTML/CSS + static export                                            | Forces two separate renderers (editor vs. HTML export) that drift forever     |
| **Responsive / mobile / SEO / a11y**   | Native browser behavior                                 | Native browser behavior (Flexbox + CSS positioning + container queries)            | Very hard (no native text selection, SEO, `<picture>`, PhotoSwipe, or reflow) |
| **Complexity ceiling**                 | High debt as features grow                              | Medium upfront, scales cleanly to Frames, grids, presets, and responsive layouts   | Very high; wrong fit for a web gallery publisher                              |

### What "a dumbed-down full canvas" should actually mean here

Adopt **Framer's architecture** (HTML/CSS as the single renderer, Figma Auto-Layout as the data model, decoupled overlay layer for editor chrome), and **dumb down the surface, not the engine**:

1. **One `Frame` container primitive** replaces `stack`, `slots`, ad-hoc padding/width props on `Text`, and hardcoded `Cover` wrappers:
   - `layout`: `'vertical' | 'horizontal' | 'free'` (optional `'wrap'` or `'grid'` later)
   - `gap`, `padding`, `align`, `justify`, `clip` (`overflow: hidden | visible`), `fill`, `radius`
2. **One uniform child layout model** replaces `FLOW` vs. `AbsolutePlacement`:
   - `position`: `'flow' | 'absolute'` (Figma's "Ignore auto layout")
   - `width` / `height`: `{ mode: 'hug' | 'fill' | 'fixed', value?: number }` (plus optional `aspectRatio`)
   - When `position === 'absolute'`: `x`, `y` (px or pinned constraints `left`/`right`/`top`/`bottom`/`center`/`scale`), `rotation`
   - Z-order comes directly from **`children` array order**, removing the separate `placement.z` integer.
3. **Keep the UX 1D-first by default:**
   - The root `Page` is a vertical Auto-Layout Frame. Dropping/inserting a block appends a `fill`-width flow child just like today.
   - Domain blocks (`Collection`, `Island`, `Scene`, `Text`, `Photo`) remain opinionated, high-level blocks so photographers aren't forced to assemble galleries out of rectangles.
   - `Cover` variants become **Frame templates/presets** (an editable Frame containing a Media layer + Text layers + Meta) instead of rigid `slots` containers.
   - 2D controls (free positioning, X/Y/W/H, constraints, clipping) appear only inside a freeform `Frame` or when a user explicitly enables free positioning on a child.

---

## 2. Blockers to Building a Figma-like Canvas (Mostly 1D + Frames)

These are the specific architectural constraints in the current codebase that will block Frames and direct manipulation if not addressed first.

### B1. Edit-mode chrome is injected into document flow (breaks WYSIWYG and 2D coordinates)

- **Where:** [`packages/canvas/src/editor/node-renderer.tsx:127-173`](../packages/canvas/src/editor/node-renderer.tsx) (`FlowItem`) vs. [`packages/canvas/src/render/document-view.tsx:113-121`](../packages/canvas/src/render/document-view.tsx) (`ViewFlowItem`).
- **Problem:** In edit mode, every flow block wraps its content in an extra `h-10` (40px) header row and `border-y` inside normal DOM flow.
  - Edit mode has different geometry than Preview/Published mode.
  - Because `AbsoluteItem` uses `top: ${y * 100}%` of the container's height, adding `N × 40px` of block headers in edit mode **shifts every absolute element vertically between edit and preview**.
  - Nesting a `Frame` with horizontal children inside `NodeChildren` would wrap each child in a stacked 40px title header and force `flex-col` (`node-renderer.tsx:83`), completely destroying horizontal or 2D frame layouts.
- **Improvement:** Render the **exact same DOM tree** in edit and view modes (`DocumentView` core), and move all editor chrome (selection outlines, hover highlights, block labels, resize/rotate handles, floating toolbars, drop lines) into a **decoupled Canvas Overlay layer** positioned from element rects (`getBoundingClientRect` / `ResizeObserver`) relative to the stage.

### B2. Fractional `y` against a variable-height container + missing sizing/constraints

- **Where:** [`packages/canvas/src/core/placement.ts:10-22`](../packages/canvas/src/core/placement.ts), [`packages/canvas/src/render/document-view.tsx:36-48`](../packages/canvas/src/render/document-view.tsx).
- **Problem:** `AbsolutePlacement` stores `y` as `0..1` of the parent's total height, has no `height`, and has no pinning/constraints.
  - On a 1D scrolling `page`, adding or deleting a block anywhere changes total page height, which **silently shifts every floating element's `y` position**.
  - Inside a `Frame`, you cannot express fixed pixel dimensions, `hug`/`fill`, or edge pinning (`bottom-right`, `center`, `stretch`).
- **Improvement:** Replace fractional `y` with Frame-local coordinates + constraints (e.g., `top`/`bottom`/`center`/`scale` pinning, px or `%` relative to a sized `Frame`). Disallow unconstrained absolute children directly on an unbounded scrolling page unless anchored to a section/Frame (or pinned in px from top/bottom).

### B3. No container layout properties (`NodeChildren` hardcodes `flex-col`, `ViewChildren` doesn't even set flex)

- **Where:** [`packages/canvas/src/editor/node-renderer.tsx:78-102`](../packages/canvas/src/editor/node-renderer.tsx), [`packages/canvas/src/render/document-view.tsx:93-110`](../packages/canvas/src/render/document-view.tsx), [`packages/canvas/src/blocks/text/index.tsx:79-109`](../packages/canvas/src/blocks/text/index.tsx).
- **Problem:**
  - `NodeChildren` renders `<div className="relative flex flex-col">`, while `ViewChildren` renders `<div className="relative">` (already a subtle edit/view CSS divergence!).
  - Containers cannot configure direction, gap, padding, wrap, alignment, background, border radius, or overflow clipping.
  - Because containers lack layout props, leaf blocks invent their own layout props (`Text` owns `padding`, `width: 'narrow' | 'wide' | 'full'`, `align`) and then hack around them with `if (!inSlot)` when placed inside `Cover`.
- **Improvement:** Move layout/box properties onto container/node frames so leaf blocks focus purely on content and typography.

### B4. Nested containers break Outline, Insertion, and DnD

- **Where:**
  - [`apps/web/src/components/editor/outline.tsx:39, 75-82, 146`](../apps/web/src/components/editor/outline.tsx)
  - [`packages/canvas/src/editor/editor.ts:182-190`](../packages/canvas/src/editor/editor.ts)
  - [`packages/canvas/src/editor/dnd.tsx:42-71`](../packages/canvas/src/editor/dnd.tsx)
- **Problem:**
  - `Outline` only lists `rootId`'s direct children and `slotsOf(node)`. Children of any nested `stack` or `Frame` container are **completely invisible** in the Outline (both flow and absolute).
  - `defaultInsertTarget()` always inserts _after_ the selected flow node (as a sibling), never _inside_ a selected container/Frame.
  - `computeDrop()` only checks vertical midpoints (`y < rect.top + rect.height / 2`), so it cannot drop into horizontal rows, grids, or 2D freeform Frames, and has no concept of dropping _onto_ a Frame to reparent.
- **Improvement:** Make `Outline` recursively render any container's `children` with proper indentation, expand/collapse, and drop-into-container targeting; update `defaultInsertTarget` to insert into a selected container; generalize drop computation to inspect the target container's layout axis (vertical / horizontal / 2D).

### B5. `@dnd-kit/react` DOM DnD cannot drive Figma-like direct manipulation

- **Where:** [`packages/canvas/src/editor/dnd.tsx`](../packages/canvas/src/editor/dnd.tsx), [`packages/canvas/src/editor/node-renderer.tsx:218-248`](../packages/canvas/src/editor/node-renderer.tsx), [`packages/canvas/src/editor/editor.ts:44`](../packages/canvas/src/editor/editor.ts).
- **Problem:**
  - Absolute drag only commits delta `(x, y)` on `dragEnd` — no live geometry updates, no smart snap guides, no edge clamping relative to element width/height, and no dragging an element into/out of a `Frame` (reparenting with coordinate conversion).
  - No on-canvas resize handles (8-point / edge resize, `Shift` aspect-lock, `Alt` center-scale) or rotation handles — size and rotation are inspector-only `NumberField`s ([`inspector.tsx:124-168`](../apps/web/src/components/editor/inspector.tsx)).
  - Single selection only (`selectedId: NodeId | null`). No multi-select (`Shift+Click`, marquee box drag), no group/wrap-in-Frame, no align/distribute, no `Cmd+C`/`Cmd+V`.
  - No `hoveredId` in editor state to coordinate hover outlines between Outline and Canvas.
  - Every node calls `event.stopPropagation()` on `onPointerDown`, which prevents Figma's container-first selection vs. `Cmd+Click` deep-leaf selection and double-click drill-down.
- **Improvement:** Replace canvas `@dnd-kit/react` interactions with a dedicated **Pointer Interaction State Machine** (`idle | dragging | resizing | rotating | marquee | panning`) driven by pointer capture on the canvas viewport (keep `@dnd-kit` or a lightweight tree DnD solely for the Outline sidebar if desired). Change `selectedId` to `selectedIds: NodeId[]` and add `hoveredId: NodeId | null` + `editingId: NodeId | null` (for text edit mode).

### B6. No Viewport / Artboard / Camera abstraction (responsive CSS reacts to the browser window)

- **Where:** [`apps/web/src/components/editor/project-editor.tsx:112-124`](../apps/web/src/components/editor/project-editor.tsx), [`packages/canvas/src/blocks/shared/theme.tsx:28-33`](../packages/canvas/src/blocks/shared/theme.tsx), [`packages/canvas/src/blocks/cover/variants.tsx:59, 91, 97`](../packages/canvas/src/blocks/cover/variants.tsx), [`packages/canvas/src/blocks/scene/index.tsx:32`](../packages/canvas/src/blocks/scene/index.tsx).
- **Problem:**
  - The canvas sits directly inside a `ScrollArea` sized to `100vw - 640px` (two 320px sidebars).
  - Blocks use viewport-relative units and media queries: `vw` in `fluidFontSize()`, `sm:` media queries in `Cover`, and `h-svh` / `100dvh` in `Scene` and `Cover`. In the editor, those measure the **whole browser window**, not the canvas artboard width/height!
  - There is no zoom (`scale`), pan, artboard frame, or Desktop/Tablet/Mobile breakpoint preview.
- **Improvement:** Introduce a **Stage / Artboard** wrapper with an explicit virtual viewport width (e.g., Desktop 1280 / Tablet 768 / Mobile 390, or responsive fill) and optional CSS `transform: scale(zoom)` camera. Replace viewport media queries (`sm:`) and `vw`/`dvh` inside blocks with **container queries (`@container`, `cqw`)** against the artboard container (or render the artboard inside a same-origin iframe if true media-query isolation is needed).

### B7. Edit vs. View visual divergence in `Cover` (`split`) and `Collection`

- **Where:** [`packages/canvas/src/blocks/cover/variants.tsx:89-101`](../packages/canvas/src/blocks/cover/variants.tsx), [`packages/canvas/src/blocks/collection/index.tsx:96-115`](../packages/canvas/src/blocks/collection/index.tsx).
- **Problem:**
  - `Cover` `split` renders a capped `max-w-200 rounded-2xl` card in `edit` mode, and a full-bleed `100dvh` grid in `view` mode.
  - `Collection` renders a Finder-like file grid in `edit` mode and `GalleryLayout` (`JustifiedGrid` / `MasonryGrid` / etc.) in `view` mode.
  - A Figma-like canvas relies on **WYSIWYG**: users must see the actual layout they are styling (changing `size`, `spacing`, `roundness`, or `layout` on a `Collection` currently has **zero visible effect** in edit mode until you press `\` for Preview!).
- **Improvement:** Render the real layout on the canvas in edit mode. Move bulk file management (filename grid, batch delete, cover picking) into a dedicated "Manage files" modal/drawer or toggleable sub-mode per collection.

### B8. Wall-clock undo merging instead of explicit transaction sessions

- **Where:** [`packages/canvas/src/editor/editor.ts:81, 128-141`](../packages/canvas/src/editor/editor.ts).
- **Problem:** Continuous gestures (scrubbing numbers, dragging focal points, future drag/resize/rotate) rely on `mergeKey` with a 1000ms timer (`MERGE_WINDOW_MS`). Pausing for >1s mid-drag splits one gesture into multiple undo steps; two quick separate edits merge into one.
- **Improvement:** Add explicit `beginTransaction()` / `commitTransaction()` / `cancelTransaction()` (or transient live-preview state committed once on `pointerup`) alongside `mergeKey` for keyboard typing.

### B9. Split stacking model (`children` order vs. `placement.z` capped `0..10`)

- **Where:** [`packages/canvas/src/core/operations.ts:30-47`](../packages/canvas/src/core/operations.ts), [`packages/canvas/src/core/placement.ts:21`](../packages/canvas/src/core/placement.ts), [`apps/web/src/components/editor/inspector.tsx:156-165`](../apps/web/src/components/editor/inspector.tsx).
- **Problem:** `children` stores both flow and absolute IDs in one array, `attach()`/`moveNode()` ignore absolute order and index only over filtered `flowChildIds`, and absolute stacking relies on a manual `z` integer capped at `0..10` in the Inspector (with `zIndex: 20 + z` in CSS).
- **Improvement:** Make `children` order the single source of truth for both flow order and z-stacking (with `Bring Forward` / `Send Backward` reordering `children`), matching Figma and CSS DOM painting order.

---

## 3. Repository-Wide Code Smells, Bugs & Wrong Decisions

### A. `@valley/canvas`

1. **No headless package entrypoint — `@valley/backend` bundles React, UI kit, DnD, PhotoSwipe, and egjs**
   - **Where:** [`packages/canvas/package.json`](../packages/canvas/package.json), [`packages/canvas/src/index.ts`](../packages/canvas/src/index.ts), [`packages/backend/src/registry.ts`](../packages/backend/src/registry.ts), [`packages/backend/package.json:25-26`](../packages/backend/package.json).
   - **Smell:** `@valley/backend` imports `createDefaultRegistry` from `@valley/canvas` solely to run `parseDocument` and `thumbnailOf`, pulling the entire frontend runtime (React, `@valley/ui`, `@dnd-kit/react`, `@egjs/react-grid`, `photoswipe`, `lucide-react`) into server-side packages and forcing `ssr.noExternal: [/^@egjs\//, /^@cfcs\//]` workarounds in both Vite configs.
   - **Fix:** Split each block into a headless spec (`type`, `version`, `schema`, `create`, `migrate`, `container`, `coverAsset`, `lightboxAssets`) and a UI spec (`Render`, `Inspector`, `icon`), and export `@valley/canvas/core` with zero React/DOM dependencies for `@valley/backend` and `@valley/db`.

2. **Type erasure (`as never` / `as unknown as`) at registry boundaries & leaky block coupling in `FontLoader`**
   - **Where:** [`node-renderer.tsx:38-39`](../packages/canvas/src/editor/node-renderer.tsx), [`document-view.tsx:20, 79-80`](../packages/canvas/src/render/document-view.tsx), [`registry.ts:40, 82`](../packages/canvas/src/registry/registry.ts), [`parse.ts:51, 70`](../packages/canvas/src/registry/parse.ts), [`inspector.tsx:99, 114`](../apps/web/src/components/editor/inspector.tsx), [`outline.tsx:144`](../apps/web/src/components/editor/outline.tsx).
   - **Smell:** Every call into a block definition casts `node as never` / `node.props as never`, bypassing type checking. Separately, `selectFontIds` in [`document-view.tsx:20`](../packages/canvas/src/render/document-view.tsx) hardcodes `if (node.type === 'text' && node.props.style.font)`, violating block extensibility.
   - **Fix:** Expose a small typed helper on `BlockRegistry` (e.g., `renderNode`, `renderInspector`, `describeNode`) to isolate the one existential cast inside the registry, and add an optional `fonts?: (props: BlockProps<T>) => string[]` capability hook on `BlockDefinition` so `FontLoader` stays block-agnostic.

3. **Duplicate `BlockDragProvider` instances sharing one `drop` slot in the store**
   - **Where:** [`packages/canvas/src/editor/canvas.tsx:12`](../packages/canvas/src/editor/canvas.tsx), [`apps/web/src/components/editor/outline.tsx:60`](../apps/web/src/components/editor/outline.tsx), [`packages/canvas/src/editor/dnd.tsx:190-213`](../packages/canvas/src/editor/dnd.tsx).
   - **Bug:** Both `Canvas` and `Outline` mount separate `<BlockDragProvider>` trees, register draggables with raw `nodeId`, and write into the same `state.drop` (`{ parentId, index }`). Dragging a block in the Outline draws a `DropLine` on the Canvas too (and vice versa), and cross-surface drags aren't possible.
   - **Fix:** Either lift one provider above both panels with namespaced draggable IDs (`canvas:${id}`, `outline:${id}`) and surface-scoped drop state, or replace canvas DnD with a pointer engine (see B5) and keep `@dnd-kit` strictly local to Outline.

4. **`locked` is modeled in the schema but barely enforced**
   - **Where:** [`packages/canvas/src/core/document.ts:31`](../packages/canvas/src/core/document.ts), [`packages/canvas/src/editor/node-renderer.tsx:225`](../packages/canvas/src/editor/node-renderer.tsx).
   - **Bug:** `node.locked` only disables dragging on `AbsoluteItem`. A locked node can still be deleted (`Backspace`/`Delete`, `BlockToolbar`), duplicated, moved, hidden, or edited in `InlineText` and `Inspector`, and there is no UI to toggle `locked`.
   - **Fix:** Enforce `locked` centrally in `operations.ts` / `editor.ts` (blocking `moveNode`, `removeNode`, `setPlacement`, `updateProps`) or remove the unused field until locking UX is implemented.

5. **RAW files are silently dropped on upload + `Promise.all` orphans files on partial failure**
   - **Where:** [`packages/canvas/src/editor/editor.ts:218-223`](../packages/canvas/src/editor/editor.ts).
   - **Bug 1:** `uploadAssets` filters with `/^(image|video)\//.test(file.type)`. Browsers report `file.type === ""` for RAW photography formats (`.arw`, `.cr2`, `.dng`, `.nef`, `.raf`), so RAW files are silently dropped on the client — directly contradicting [`packages/backend/src/uploads.ts:15`](../packages/backend/src/uploads.ts) and [`packages/storage/src/keys.ts:20-34`](../packages/storage/src/keys.ts) which explicitly support RAW extensions!
   - **Bug 2:** `Promise.all(media.map(uploadAsset))` fails the entire batch if 1 of 50 uploads fails, leaving 49 uploaded files orphaned in S3 and Postgres with none added to the document.
   - **Fix:** Share a media-file matcher (MIME or known extension) between client and backend, use `Promise.allSettled` so succeeded uploads are still added while failed ones surface an error toast/retry, and surface upload progress.

6. **Deleted files and blocks leak forever in `doc.assets`, Postgres `assets`, and object storage**
   - **Where:** [`packages/canvas/src/blocks/collection/index.tsx:106`](../packages/canvas/src/blocks/collection/index.tsx), [`packages/canvas/src/blocks/island/index.tsx:66`](../packages/canvas/src/blocks/island/index.tsx), [`packages/canvas/src/core/operations.ts:109-116`](../packages/canvas/src/core/operations.ts), [`packages/backend/src/projects.ts:42`](../packages/backend/src/projects.ts).
   - **Smell:** Removing a photo from a `Collection`/`Island` or deleting a block only drops the `AssetId` reference from the block's `props`. `doc.assets` keeps the asset forever, so project file count & byte totals never decrease, and storage never reclaims unused uploads (even when unreferenced by undo history or after project save). Conversely, `FilesSection` displays `props.assetIds.length` even if an `AssetId` is missing from `doc.assets`.
   - **Fix:** Decide explicitly whether `doc.assets` is a reusable "Project Media Library" (with its own UI to view/delete library files) or garbage-collected when unreferenced (with periodic/save-time storage cleanup after undo history clears).

7. **`Island` shows a non-functional "Grid" layout picker & `ThemeGroupSection` is half-wired**
   - **Where:** [`packages/canvas/src/blocks/island/index.tsx:100`](../packages/canvas/src/blocks/island/index.tsx), [`apps/web/src/components/editor/theme-controls.tsx:23-49, 127-135`](../apps/web/src/components/editor/theme-controls.tsx), [`packages/canvas/src/editor/editor.ts:271-284`](../packages/canvas/src/editor/editor.ts), [`apps/web/src/components/editor/project-settings.tsx`](../apps/web/src/components/editor/project-settings.tsx).
   - **Bugs:**
     - `Island` opts into `themeGroups: ['gallery']`, so the Inspector renders `GalleryControls` including the 4-way Grid layout picker (`justified | grid | masonry | horizontal`), but `IslandRender` completely ignores `gallery.layout`!
     - `ThemeGroupSection`'s JSDoc claims it renders a reset button when a block overrides the project theme, but no reset button exists, and `setOverride` leaves `{ gallery: undefined }` instead of deleting the key.
     - `ProjectSettings` has no UI to edit project-level `theme.gallery` defaults, so the theme inheritance system for galleries is effectively dead.
   - **Fix:** Either split `gallery` layout from shared `spacing`/`size`/`roundness`, add project-level gallery defaults + a real reset action in `ThemeGroupSection`, and clean up empty `overrides` objects in `setOverride`.

8. **`useEditorHotkeys` hijacks `Cmd+Z` / `Cmd+Y` inside non-document form inputs**
   - **Where:** [`packages/canvas/src/editor/hotkeys.ts:23-37`](../packages/canvas/src/editor/hotkeys.ts).
   - **Bug:** The `Cmd+Z` / `Cmd+Y` handler runs _before_ `if (isEditingText(event.target)) return`. That means pressing `Cmd+Z` while typing a URL slug, password, or color hex in the Inspector (none of which live in the undo history!) undoes the **canvas document** instead of the text input.
   - **Fix:** Let native undo work inside `<input>`/`<textarea>` that are not bound to document history (or mark document-bound inputs explicitly with e.g. `data-doc-input`), and provide graceful handling when pressing `Backspace`/`Cmd+D` on a non-removable slot node.

9. **`InlineText` `innerText` quirks and caret jumping**
   - **Where:** [`packages/canvas/src/blocks/shared/inline-text.tsx:37-43, 64-70`](../packages/canvas/src/blocks/shared/inline-text.tsx).
   - **Smell:** Reading `element.innerText` on every keystroke triggers synchronous layout reflow and produces browser-dependent trailing newlines on empty `contentEditable` nodes. Mutating `element.innerText = toSingleLine(...)` inside `onInput` jumps the caret to position 0 on paste.
   - **Fix:** Use `textContent` and intercept `onPaste` / `onBeforeInput` to normalize line breaks without replacing the whole node's text mid-edit.

10. **Fragile `parseDocument` migrations and silent user-data loss on schema mismatch**
    - **Where:** [`packages/canvas/src/registry/parse.ts:43-52, 60-81`](../packages/canvas/src/registry/parse.ts), [`packages/canvas/src/blocks/text/index.tsx:243-259`](../packages/canvas/src/blocks/text/index.tsx), [`packages/canvas/src/blocks/cover/index.tsx:174-175`](../packages/canvas/src/blocks/cover/index.tsx).
    - **Bug:** If `definition.schema.safeParse(props)` fails on a single field (for example, `textBlock.migrate` returning `padding: undefined` for an unexpected v1 string), `parseDocument` **discards the entire node's props and resets it to empty defaults** — wiping the user's text or photo list on load/save!
    - Also, `parse.ts:51, 70` passes `doc: raw as never` (unmigrated raw nodes) to `create` / `createSlotNode`, and `cover` v2 relies on an implicit side-channel (`storedProps` before schema stripping) to transfer `title`/`subtitle` to slots.
    - **Fix:** Use field-level `.catch(...)` / recovery defaults where safe instead of wiping a whole block on one invalid field, and run explicit tree-level migrations (`(doc, node) => ...`) instead of relying on `storedProps` side effects.

11. **Stale `useState` capture in `EditorProvider` and `CanvasViewer`**
    - **Where:** [`packages/canvas/src/editor/context.tsx:12-18`](../packages/canvas/src/editor/context.tsx), [`packages/canvas/src/render/canvas-viewer.tsx:15-20`](../packages/canvas/src/render/canvas-viewer.tsx).
    - **Bug:** `EditorProvider` initializes `render` in `useState(() => ...)` once; if the `editor` prop changes without a `key` remount, blocks keep reading the old `editor.store`. `CanvasViewer` similarly freezes `registry` in `useState` and syncs `doc` in a `useEffect`, causing a 1-frame stale render when `doc` updates (and diverging during SSR if `doc` changes across renders).
    - **Fix:** Memoize `RenderContextValue` cleanly from `editor` (or sync without freezing `registry`), and avoid `useEffect`-based prop-to-store sync where possible.

12. **Date formatting bug on empty or malformed dates**
    - **Where:** [`packages/canvas/src/core/format.ts:19-44`](../packages/canvas/src/core/format.ts).
    - **Bug:** `parts('')` produces `{ year: 0, month: 0, day: 1 }` → `"1 January, 0"`, and `parts('invalid')` produces `"1 January, NaN"`, and an out-of-range month produces `"1 undefined, 2026"`.
    - **Fix:** Validate `YYYY-MM-DD` with a regex and return a clean fallback string (e.g., `''` or `'—'` / original input) when invalid.

13. **Dead code, empty directories, and inconsistent lint rules**
    - **Where:** [`packages/canvas/src/editor/persistence.ts`](../packages/canvas/src/editor/persistence.ts) (`persistEditor` — unused), [`packages/ui/src/hooks/useStableCallback.ts`](../packages/ui/src/hooks/useStableCallback.ts) (unused despite being featured in [`docs/internal/web.md:47`](internal/web.md)), empty directory `packages/canvas/src/demo/`, unused CSS var `--page-header-height` in [`packages/canvas/src/blocks/cover/variants.tsx:97`](../packages/canvas/src/blocks/cover/variants.tsx).
    - Also, [`apps/web/vite.config.ts:41`](../apps/web/vite.config.ts) runs React Compiler across `@valley/canvas` and `@valley/ui`, yet `valley/no-manual-memo` in [`.oxlintrc.json:41`](../.oxlintrc.json) only covers `apps/web/src/**`, leaving manual `memo`/`useMemo`/`useCallback` scattered in `packages/canvas/src`.

---

### B. `apps/web` (Editor Shell, Persistence & UX)

1. **Autosave (`syncProject`) has race conditions, silent failures, and discards immer patches**
   - **Where:** [`apps/web/src/data/api.ts:51-95`](../apps/web/src/data/api.ts).
   - **Bugs:**
     - **Silent failure & slug desync:** Save failures and `slugError` only log to `console.error`/`console.warn`. If a user types a taken/invalid slug, the server keeps the old slug, but the UI never updates `settings.slug` or shows an error — leaving `Share` and `Visit` pointing at a 404 URL!
     - **Out-of-order overwrite race:** `flush(true)` (on `visibilitychange` / `pagehide`) bypasses the `saving` promise queue, so an earlier slow `save()` can resolve _after_ the keepalive save and overwrite newer data in Postgres (no revision/version check or optimistic concurrency).
     - **Unmount flush is unawaited and lacks `keepalive`:** Navigating away in SPA routing fires `flush()` in the `useEffect` cleanup without awaiting or guaranteeing completion before the next route loads `listProjects()`.
     - **Immer patches are generated on every edit and thrown away:** `syncProject` re-uploads the entire `CanvasDocument` JSON on every save, easily exceeding the browser's 64 KB `keepalive` body cap on medium/large galleries.
   - **Fix:** Add explicit save status (`saved | saving | error`) + `slugError` feedback in UI, add an optimistic `revision` counter on `projects` so stale writes can't clobber newer ones, and either consume immer patches on the server or batch/compress saves cleanly.

2. **Plaintext passwords in DB JSONB & biased generator**
   - **Where:** [`apps/web/src/components/editor/project-settings.tsx:53-54, 136-143`](../apps/web/src/components/editor/project-settings.tsx), [`packages/canvas/src/core/settings.ts:12-13`](../packages/canvas/src/core/settings.ts), [`packages/db/src/schema.ts:48, 54`](../packages/db/src/schema.ts).
   - **Smell:** `settings.password` is stored in plaintext inside `projects.settings` JSONB and sent back to the browser on every load, while `apps/gallery` doesn't even support unlocking password-protected galleries yet (it simply returns 404). Additionally, `randomPassword()` uses `n.toString(36).slice(-1)` on random bytes, introducing modulo bias (256 % 36 ≠ 0) and limiting entropy.
   - **Fix:** Store a salted password hash (`scrypt` / `argon2`) in a dedicated server-only column (never returned in `ProjectSettings` unless shareable access-code semantics are intentional and encrypted), use rejection sampling over an explicit alphabet for generated codes, and implement the gallery unlock flow (or hide the control until ready).

3. **Dead / stubbed interactive UI controls**
   - **Where:** [`apps/web/src/components/editor/project-chrome.tsx:23-42, 58-61`](../apps/web/src/components/editor/project-chrome.tsx) (`Retouch`, `Analytics`, `Favorites`, `Language`), [`apps/web/src/components/editor/project-settings.tsx:158-160`](../apps/web/src/components/editor/project-settings.tsx) (`Archive this project`), [`apps/web/src/components/projects/project-card.tsx:90-95`](../apps/web/src/components/projects/project-card.tsx).
   - **Smell:** Several buttons and sidebar items look interactive (hover states, button semantics) but have no handlers. On `ProjectCard`, the file-count and view-count `<Button>`s sit at `z-10` above the stretched card `<Link>`, so clicking them does nothing and blocks navigation to the project.
   - **Fix:** Render non-interactive stats as non-button elements (or pass clicks through to the card link) and hide/disable unimplemented features behind feature flags or explicit "Coming soon" states.

4. **"Download" in `FileMenu` downloads the WebP preview instead of the original**
   - **Where:** [`packages/canvas/src/blocks/collection/file-menu.tsx:11-16`](../packages/canvas/src/blocks/collection/file-menu.tsx), [`packages/backend/src/media-processing.ts:7`](../packages/backend/src/media-processing.ts), [`packages/backend/src/uploads.ts:131`](../packages/backend/src/uploads.ts).
   - **Bug:** `media-processing.ts` explicitly preserves originals ("Originals stay untouched for downloads"), yet `Asset` only stores `src` (which points to `previewKey ?? originalKey`). Clicking Download downloads a re-encoded 2560px WebP named `IMG_1234.jpg` (wrong extension and degraded quality!).
   - **Fix:** Add an optional `originalSrc` (or asset download route by asset ID) on `Asset` so downloads stream `originalKey` with `Content-Disposition: attachment`.

5. **`createProject` orphans empty projects if upload fails**
   - **Where:** [`apps/web/src/data/api.ts:26-45`](../apps/web/src/data/api.ts).
   - **Smell:** Creates the DB row first, then runs client-side tus uploads, then saves the document. If the upload fails or the tab closes mid-upload, an empty `"Untitled project"` remains in the project list.
   - **Fix:** Handle partial/failed uploads gracefully (e.g., navigate into the project immediately with live upload progress, or clean up on failure).

---

### C. `@valley/backend`, `@valley/storage`, `@valley/db`, `apps/gallery`

1. **`isPublishedKey` triggers a full-table Postgres JSONB scan on every gallery media miss**
   - **Where:** [`packages/backend/src/gallery.ts:52-86`](../packages/backend/src/gallery.ts), [`packages/db/src/schema.ts:34-60`](../packages/db/src/schema.ts).
   - **Smell:** When `/media/<key>` doesn't match `assets.originalKey` / `assets.previewKey` (or on any 404/bot probe), `isPublishedKey` scans `projects` running `jsonb_each(projects.doc -> 'assets')` across every published project! Meanwhile `projects` lacks an index on `(visibility, protected)`.
   - **Fix:** Keep a normalized `project_media_keys` (or ensure every published document asset + avatar is indexed in `assets` / a dedicated lookup table updated in `saveProject`) and add an index on `(visibility, protected)`. Never run `jsonb_each` in a hot media-serving request path.

2. **tus upload endpoint lacks key validation & project authorization on PATCH/HEAD/DELETE**
   - **Where:** [`packages/backend/src/uploads.ts:92-113`](../packages/backend/src/uploads.ts), [`packages/storage/src/local.ts:100-102`](../packages/storage/src/local.ts).
   - **Security bug:** `getFileIdFromRequest` decodes the URL path (`decodeURIComponent`) and hands it directly to `@tus/file-store` (`FileStore({ directory: this.#root })`) without calling `assertKey()` or verifying `writablePrefixes` or checking project ownership on `PATCH`/`HEAD`/`DELETE`.
     - With `ImmichStorage`, `FileStore` points at Immich's entire `root` rather than `root/folder`, bypassing `writablePrefixes` if a crafted ID reaches tus.
     - Once multi-user auth plugs into `requireAccount`, any authenticated user could `PATCH`/`DELETE` another user's in-progress upload by ID.
   - **Fix:** Validate every ID from `getFileIdFromRequest` with `assertKey()` + `storage.keyPrefix`, bind `FileStore` to the writable subfolder when `writablePrefixes` is set, and check project ownership in `onIncomingRequest` for non-POST upload methods.

3. **`serveMedia` does two storage round-trips per GET + unhandled `StorageError` 500s**
   - **Where:** [`packages/backend/src/media.ts:26-64`](../packages/backend/src/media.ts), [`apps/web/src/routes/api/media/$.ts:6-10`](../apps/web/src/routes/api/media/$.ts).
   - **Smell:** Every GET request calls `storage.head(key)` and then `storage.read(key)` — doubling S3 latency and request cost. Also, invalid keys (e.g., `..` or `//`) throw `StorageError('invalid-key')`, which bubbles up as a 500 instead of 400/404 in `/api/media/$` (and `/media/$` in `apps/gallery`).
   - **Fix:** Catch `StorageError` (`invalid-key` → 400/404), and let `GET` without `If-None-Match` (or with conditional `IfNoneMatch` passed directly to S3 `GetObjectCommand`) complete in a single storage round-trip.

4. **Unbounded concurrent `storage.delete` calls in `deleteProject`**
   - **Where:** [`packages/backend/src/projects.ts:136-137`](../packages/backend/src/projects.ts), [`packages/storage/src/s3.ts:120-127`](../packages/storage/src/s3.ts).
   - **Smell:** `deleteProject` runs `Promise.allSettled(keys.map((key) => storage.delete(key)))`, firing one `DeleteObjectsCommand` per key simultaneously (thousands of concurrent requests for a large shoot).
   - **Fix:** Add `deleteMany(keys: string[])` to `Storage` (batching 1,000 keys per S3 `DeleteObjectsCommand` and bounding concurrency on `LocalStorage`).

5. **`AppBar` & `GalleryView` are tightly coupled to `'cover'` and run layout reads on every scroll tick**
   - **Where:** [`apps/gallery/src/components/app-bar.tsx:19-27`](../apps/gallery/src/components/app-bar.tsx), [`apps/gallery/src/components/gallery-view.tsx:16-19`](../apps/gallery/src/components/gallery-view.tsx).
   - **Smell:** Both inspect `node.type === 'cover'` / `[data-block="cover"]` directly. If a user builds a custom Hero Frame instead of the `cover` block, the transparent overlay bar won't work. Also, `isOverCover` calls `getBoundingClientRect()` synchronously on every scroll event.
   - **Fix:** Replace block-type checking with a generic document/node trait (e.g., `fullBleedHeader` or "hero" flag on the first Frame) and observe it with `IntersectionObserver` instead of scroll-listener layout reads.

6. **Fire-and-forget `recordView` inside SSR loader**
   - **Where:** [`apps/gallery/src/server/gallery.server.ts:19-25`](../apps/gallery/src/server/gallery.server.ts).
   - **Smell:** Counts views during SSR route loads (inflated by bots, link unfurlers, and prefetches) and doesn't await the promise (can be terminated early on serverless runtimes).
   - **Fix:** Record views via a lightweight client-side beacon (`navigator.sendBeacon` / POST endpoint) with basic bot filtering or deduping.

7. **Near-zero automated test coverage**
   - **Where:** Only [`packages/storage/src/local.test.ts`](../packages/storage/src/local.test.ts) and oxlint rule tests exist in the entire repo.
   - **Risk:** Core invariants (`parseDocument`, migrations across `text` v1–v7 & `cover` v1–v2, `operations.ts`, undo/redo + `mergeKey`, `resolveDocument`/`referenceDocument`, `saveProject` slug collision handling, `parseRange`) have zero regression tests. Refactoring `@valley/canvas` toward a Frame/Auto-Layout engine without unit tests for the tree/parser/history layer will be error-prone.

---

## 4. Recommended Sequencing

If the goal is to move toward a **Figma-like (mostly 1D + 2D Frames) canvas** without dragging existing debt forward:

1. **Phase 0 — Quick correctness & security wins (1–2 days)**
   - Fix RAW file upload filtering & `Promise.allSettled` in `editor.ts`.
   - Fix `useEditorHotkeys` `Cmd+Z` hijacking inside non-document inputs.
   - Fix `syncProject` race condition + surface save/`slugError` state in UI.
   - Harden tus `getFileIdFromRequest` with `assertKey()` + `writablePrefixes` + project authorization; catch `StorageError` in media routes.
   - Fix `Island` hiding the unused `layout` picker, fix `format.ts` date guards, and fix `ProjectCard` stat buttons blocking the card link.
2. **Phase 1 — Package boundaries & test harness (2–3 days)**
   - Extract `@valley/canvas/core` (zero React/UI deps) so `@valley/backend` no longer pulls frontend packages.
   - Add unit tests for `parseDocument`, migrations, `operations.ts`, `createEditor` history, and `refs.ts`.
   - Fix `isPublishedKey` (eliminate `jsonb_each` scan) and add `Storage.deleteMany`.
3. **Phase 2 — Canvas engine foundation (the unlock for Frames)**
   - Decouple **Document Rendering** from **Editor Overlay Chrome** (remove `h-10` flow headers from `FlowItem`; render selection, hover, labels, drop lines, and toolbars in an overlay layer).
   - Add the **Artboard / Stage** wrapper (virtual width, zoom/pan, container-query sizing instead of `vw`/`sm:`/`dvh`).
   - Replace `stack`/`slots`/`AbsolutePlacement` with a unified **`Frame` + Auto-Layout + Child Sizing/Constraints** model (schema v2 with clean migration from v1), making `children` order the single z-order source of truth.
   - Make `Outline` recursive for all nested containers, and make `Collection`/`Cover` WYSIWYG in edit mode.
4. **Phase 3 — Direct manipulation & progressive 2D UX**
   - Introduce explicit transaction sessions (`begin`/`commit`/`abort`) and multi-selection (`selectedIds`, `hoveredId`, `editingId`).
   - Replace canvas `@dnd-kit/react` with a pointer state machine supporting live drag, smart snap guides, reparenting into/out of Frames with coordinate conversion, 8-handle resize, and rotation.
   - Expose 1D flow by default and reveal 2D Frame / free-positioning controls progressively.
