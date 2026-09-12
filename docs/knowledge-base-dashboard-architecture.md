# Knowledge Base Dashboard — Architecture

One dashboard per knowledge base. The header says which knowledge base you are in and
lets you switch, the scene shows its brains spinning, a tap flies into a brain and back
out again. The knowledge base's tools live on a left rail that is always there; a brain's
own tools appear top-right only while that brain is open. It works the same on a phone,
with the rail as a bottom tab bar and panels as bottom sheets.

This replaces four separate dashboards (knowledge base, expertise brain, experience
brain, process map), each on its own route with its own left rail and its own scene,
where opening a brain was a full page load.

## User stories

| As | I want | So that |
| --- | --- | --- |
| Owner | to land in my most recent knowledge base and switch to another from the header | I am always working inside one, the way a Vercel project is selected |
| Owner or viewer | to see the brains spinning and tap one to fly into it | the brain opens where it lives, not on another page |
| Owner or viewer | to fly back out to the spinning brains | I can move between brains without losing my place |
| Owner | the knowledge base's tools (interview, documents, review, share, chatbots, API, log, settings) on a rail that stays put | I never leave the scene to use them, whether or not a brain is open |
| Owner or viewer | a brain's own tools (ask, model or contents or map, settings or share) top-right when it is open | each view has exactly the tools it needs, beside the knowledge base's |
| Owner or viewer | a clear way back — a breadcrumb, Escape, the rail's Brains item, the open brain's chip | I am never stuck inside a brain |
| Phone user | all of the above, with a tappable list of brains and panels that slide up | the product is usable on site, not only at a desk |
| Anyone | a link to a brain to open that brain directly | deep links and the browser's back button keep working |

## The views

**Header.** On any `/knowledge-base/[id]` route the wordmark is followed by the knowledge
base switcher: the current name with a chevron; the menu hangs beneath the trigger
(`absolute top-full left-0` inside the trigger's `relative` wrapper — nothing above it
clips) and lists every knowledge base the account owns (name, brain count), then "New
knowledge base" and "All knowledge bases". A click outside, or Escape, closes it.
`/knowledge-base` redirects to the most recently updated knowledge base; an account with
none sees the create form.

**Dashboard.** The scene fills the viewport below the header (no footer on these routes).
Left: the rail (`KnowledgeBaseRail`) — "Brains" first, the constellation glyph that leads
to the knowledge base and is lit while you are on it, then the knowledge base tools as
icon buttons. Bottom-centre: the brain strip — one chip per brain, labelled by kind
(Expertise, Experience, Process) in the kind's colour with the brain's name as its
tooltip; it is the accessible switcher and, on a phone, the main one.

**Constellation state** (`/knowledge-base/[id]`): the three brains spin; top-left is
"Add a second brain"; the pointer hint sits beneath the strip on wide screens. Tapping a
brain in the scene or the strip flies the camera into it while the brain's view fades in
on top.

**Brain state** (`/knowledge-base/[id]/brains/[brainId]`): the brain's own view — the
expertise constellation, the experience regions, or the process map over its flow scene.
Top-left is the breadcrumb (`BrainBreadcrumb`): "← {knowledge base}" linked, then the
brain's name and kind. Top-right is the brain's toolbar. The breadcrumb, Escape (when no
panel or menu is open), the rail's Brains item, the strip's current chip and the browser
back button all fade the view out and fly the camera back.

**Panels.** A tool opens its panel beside the scene: on a wide screen a 380px column —
the knowledge base's to the left of the scene, sliding in from the left; the brain's to
the right, sliding in from the right — and one may stand on each side at once. On a phone
every panel is a bottom sheet to about 85% of the height with a handle, dismissed by
dragging down, the scrim or the close button, and opening one closes the other.

**All knowledge bases** (`/knowledge-base/all`): the register as it is today — every
knowledge base and its brains, invitations, shared brains, your chatbots, the create form.

## Site map

```
/knowledge-base ──▶ /knowledge-base/[id] ◀──▶ /knowledge-base/[id]/brains/[brainId]
      │                     ▲   header switcher ▲
      └──(none yet)──▶ create form              │
/knowledge-base/all ────────┘ (switcher: All knowledge bases)
/workspace/[entityId]/domains/[domainId]   ──307──▶ the brain route when filed in a knowledge base the caller can open
/workspace/[entityId]/workflows/[workflowId] ──307──▶ the brain route when filed in a knowledge base the caller can open
```

`[id]` is a uuid param matcher so `all` is its own route. `[brainId]` is a `kb_brains` id
(expertise or experience) or a `workflows` id (process); the loader resolves which.

## Layout and data

`src/routes/knowledge-base/[knowledgeBaseId=uuid]/+layout.server.ts` loads what the
whole dashboard needs: the knowledge base, ownership, brains, process maps, shares,
chatbots and the workbench (documents, review, API tokens, log for the primary expertise
brain). `+layout.svelte` mounts the scene once and renders the rail, the two panels, the top bar
and the strip; child pages render inside it, so the scene survives navigation between the
constellation and a brain — that is what makes the fly-in possible. Its queries run
together (`Promise.all`), as do each brain view loader's.

The knowledge base page (`+page.server.ts`) keeps the knowledge base actions (archive,
delete, share, remove share, create chatbot). Panels rendered by the layout post to that
page's actions by absolute path, so they work from a brain URL too.

The brain page (`brains/[brainId]/+page.server.ts`) resolves the brain and loads its
view: expertise → contexts, page index, page links, conversation, access role; experience →
items, bound domain brains, schema types; process → conversation, latest map, viewers. Each
loader and each kind's actions live in their own module.

The root layout loads the account's knowledge bases (one query) so the header switcher
needs nothing from the dashboard.

## Tools and panels

A tool is `{ key, label, iconPaths, panel }` where `panel` is a snippet. The
`dashboardTools` context keeps two independent sides (`DashboardToolSide`), `left` and
`right`, each with its own registrations and its own active key. `KnowledgeBaseToolset`
registers the knowledge base tools on the left; a brain view registers its own on the
right under an owner key per brain, on mount, and releases them on destroy. The latest
registration on a side is on show, so an incoming brain's tools stand whichever order the
outgoing brain releases in. `DashboardTools` is built with a "room for one panel only"
check (the phone breakpoint): where it holds, opening a panel on one side closes the
other's. The interview stays on the left and focuses on the open brain's kind.

| State | Left (knowledge base) — owner | Left — viewer | Right (brain) — owner | Right — viewer |
| --- | --- | --- | --- | --- |
| Constellation | interview, documents, review, share, chatbots, API, log, settings | interview, log | — | — |
| Expertise brain | same | same | ask, model, settings | ask, model |
| Experience brain | same | same | ask, contents, settings | ask, contents |
| Process brain | same | same | draw the map, map, share | draw the map, map |

## Motion

The galaxy offers `focusSlot(id)` (camera flies to the brain, the others dim), `releaseFocus()`,
`pause()`, `resume()`, `hide()` and `show()`. `BrainFlight` (`brainFlight.svelte.ts`) keeps
the galaxy in step with the URL and with the brain's view, and the view's readiness gates
the cross-fade:

- **Entering.** A tap calls `flight.flyInto(id)` (galaxy shown and resumed, camera flies,
  `openingBrainId` set) and `goto(href)`; the route's confirmation of the same brain does not
  restart the flight. The breadcrumb reads "Opening {kind}…" with a pulse from the click
  until the view has drawn (`navigating.to` while the load is in flight, then
  `flight.openingBrainId`); the galaxy keeps spinning, focused. The page mounts
  `BrainViewFrame` at opacity 0 — mounted, so the scene builds — and each scene host
  (`BrainConstellation`, `RegionBrain`, `FlowBrain`) fires `onReady` from its animation
  loop's first drawn frame (`createSceneLoop(frame, onFirstFrame)`). On ready the frame
  reads `flight.viewFadeDelayMilliseconds` (the time left until the camera lands; 0 for a
  deep link) and fades in over `viewFadeMilliseconds` after that delay, calling
  `flight.settleBehindView(delay + fade)`; only when that timer fires does the galaxy
  `pause()` and `hide()`.
- **Leaving.** The route drops the brain: `flight.flyOut()` shows and resumes the galaxy at
  once, the frame's out transition fades the view over it, and `releaseFocus()` runs
  `viewFadeMilliseconds` later, so the flight back starts as the view is gone. Switching
  brain to brain is a fly-in with the outgoing view fading out over the moving galaxy.
- **Prefetch.** Hovering a brain in the galaxy (`onHover` through `KbConstellation`) or a
  chip calls the intent preloader, which `preloadData(href)`s after
  `prefetchIntentMilliseconds` of rest, so a sweep across the ring loads once.

Landing directly on a brain URL starts focused with no flight. `prefers-reduced-motion`
turns flights and fades into cuts. Durations and easings are named constants in
`dashboardMotion.ts`; the flight's landing clock is `flightLanding.ts`. The dashboard does
not dim during a slow navigation (other routes still do).

Every scene (galaxy, expertise constellation, experience regions, process flow) rests
while the tab is hidden through one `pageVisibility` rune (`restWhilePageHidden`), and the
stage (`createStage.ts`) caps pixel ratio at 1.5 on narrow screens and 2 on wide ones,
asks for the high-performance GPU only on wide screens, and forces context loss on dispose
so flying between brains never exhausts WebGL contexts.

## Phones

The screen-size check is `screen.isWideScreen`, a live media query on the `lg` breakpoint.
The header is exactly `--site-header-height` tall, the switcher name truncates, and `main`
on dashboard routes is the rest of the viewport with no scrolling.

The dashboard has one top row, one bottom stack and a tab bar, so nothing can collide:

- **Top row** (`DashboardTopBar`, 56px): on the left "Add a second brain" in the
  constellation state or the breadcrumb (`BrainBreadcrumb`, truncating); on the right,
  inside a brain only, the brain's toolbar — 44px icon buttons that scroll sideways with a
  hidden scrollbar when they overflow, capped to 62% of the width on phones so the
  breadcrumb keeps its room.
- **Bottom stack** (`BrainStrip`): the kind chips (44px tall on phones, wrapping to a
  second row); the pointer hint beneath them is hidden on phones.
- **Tab bar** (`KnowledgeBaseRail`, `order-last` below `lg`): Brains and the knowledge base
  tools as 44px targets along the bottom, scrolling sideways if they overflow; on wide
  screens the same rail is a 56px column on the left.
- **Scene HUDs** ("Whole brain / focused" pills, the constellation key, the neuron detail's
  close, the process map's close) sit top-left under the breadcrumb at `sceneHudPosition`;
  the top-right belongs to the toolbar alone. Pointer hints (`sceneHintPosition`) only show
  on wide screens.
- **Panels** are bottom sheets to 85% of the height (`DashboardSheet`) whichever side owns
  them, one at a time: the handle drags the sheet down and lets go past 120px or with a
  flick to dismiss, otherwise it snaps back (`SheetDrag`); the page behind stops scrolling
  while a sheet is open; the scrim, the close button and Escape still close it.
- **Process map**: the 2D map overlay stays up once the map tool has opened it, whether or
  not the tool's panel (legend and station detail) is open, and closes from its own chip;
  the SVG scales to the width and the overlay scrolls when it is taller than the viewport.
- **Galaxy**: the camera rests further back in portrait so the whole ring fits
  (`kbGalaxyFraming.ts`), labels shrink below 768px and again below 480px, a touch with
  no more than 6px of drift is a tap, and a lifted finger clears the hover.

## Not built

The old four dashboards are removed once the new one covers them. The workspace domain
and workflow routes stay for brains that are not filed, and for shared viewers without
knowledge base access, with their own rail and panels.

The process brain keeps its own map-drawing chat (`WorkspaceChat`) as the right-side tool
"Draw the map": the knowledge base interview on the left files into brains but does not
draw process maps, and a filed process brain's workspace route redirects here, so without
it a filed map could never grow.
