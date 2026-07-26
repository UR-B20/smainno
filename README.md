# Innovation Projects · Capability Showcase

An interactive showcase for three innovation projects, dated 27 July 26 —
rebuilt as something you can actually use.

Each project has a **working replica**: a real application with seeded demo
data, so a reviewer can raise the record, post the update, run the check and
watch the deadline pass, rather than looking at a screenshot of someone else
doing it.

| Project | What it does | Replica |
| --- | --- | --- |
| **Digital IPS** | Informal punishment reporting, deliberation and record-keeping | FormSG-style intake → SharePoint-style register → deliberation with precedent → downstream coordination → dashboard |
| **FUA Tracker** | Follow-up actions from meetings and conferences | Teams-embedded app: leader overview, FUA register, personal subtask queue, append-only update flow, two-step raise wizard |
| **SmartCheck** | Recurring compliance and readiness checks | Mobile checker (page-by-page checklist, photo-backed issues) plus an admin desktop: dashboard, template builder, schedules & notifications |

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # typecheck + production build to dist/
npm run preview  # serve the production build
```

The app is a static, client-only bundle. It uses a hash router and a relative
base path, so `dist/` can be served from any static host or opened from a
subdirectory without server rewrites.

## Publishing it

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push
to `main`. It needs one setting turned on once:

> **Settings → Pages → Build and deployment → Source: GitHub Actions**

After that the site is live at **https://ur-b20.github.io/smainno/** — a plain
public link, fine to paste into Telegram or WhatsApp. The page carries Open
Graph tags and a `og.png` card, so the link unfurls with a proper preview
instead of a bare URL, and a web manifest so it can be added to a home screen.

## On a phone

The replicas are built to be *used* on a handset, not squinted at:

- Project pages link out to a full-screen replica instead of embedding a
  shrunken desktop frame.
- FUA Tracker and Digital IPS swap their sidebars for a bottom tab bar — the
  same move the real Teams and intranet clients make. SmartCheck's checker was
  already a phone app.
- Dense tables become card lists; multi-column screens stack; dialogs become
  full-height sheets.
- Layout is driven by **container queries**, so each app reads its own width.
  The same components are correct at 390px full-bleed and at 1280px inside a
  device frame on the desktop site.
- The demo controls (clock, roles, reset) collapse behind one button so they
  cost a single line instead of three.

## How to use the replicas

Every replica sits behind a thin console strip that is **not** part of the
product — it exists so a reviewer can drive the demo:

- **Clock controls (`+1h` / `+4h` / `+1d` / `Now`)** — each replica runs on a
  simulated clock. Move it forward to watch a SmartCheck window expire into
  `Missed`, an IPS case breach its 24-hour mandate, or an FUA due date turn from
  amber to red.
- **Role switch** — sign in as a different person. Menus, permissions and work
  queues change with the role: members do not see leader-only screens, and
  non-deliberating appointments cannot record an IPS award.
- **View switch (SmartCheck)** — swap between the phone checker and the admin
  desktop.
- **Reset** — wipes the persisted demo data and re-seeds it.

State is kept in `localStorage`, so you can leave and come back. Nothing leaves
the browser.

Each project page embeds its replica in a device frame; `#/demo/<project-id>`
opens the same replica full-window.

## What is faithful, and what is invented

Faithful to the source material: the problem statements, the screen callouts
(the A/B/C annotations), the six-step FUA loop, and the SmartCheck life cycle
with its navy/gold/red legend.

Where the deck described a *behaviour*, the replica implements it rather than
illustrating it:

- FUA parent status is **derived** from its subtasks (`rollUp`) and can never be
  set by hand; you may only post updates against subtasks assigned to you.
- Every FUA update, SmartCheck submission and IPS stage change is **appended**.
  Nothing in any replica overwrites or deletes a record.
- SmartCheck occurrences are **derived from schedules** for any date you ask
  for, so a window nobody touched still resolves to `Missed`, and skips are
  excluded from the completion rate.
- The IPS 24-hour mandate runs from the **incident time**, not from when the
  file was opened, and downstream tasking is raised by the award itself.

Invented for the demo: all names, units, cases and findings. SmartCheck photo
captures are simulated, since the replica runs entirely client-side.

None of this is a system of record.

## Layout

```
src/
  data/deck.ts          Showcase narrative, lifted from the deck
  showcase/             Landing, project pages, full-screen demo route
  components/           Dark "operations console" primitives, icons, device frame
  demos/
    shared/             Bone-surfaced app kit + the demo console strip
    fua/                FUA Tracker replica (store, screens, raise, update)
    smartcheck/         SmartCheck replica (checker phone + admin desktop)
    ips/                Digital IPS replica (intake -> register -> deliberation)
  lib/                  Class helper, time formatting, persisted demo store
```

Each replica owns a `store.ts` holding its model, seed data and selectors; the
derived state (roll-ups, occurrence states, mandate compliance) lives there
rather than in components.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router (hash) ·
self-hosted Inter and JetBrains Mono. No runtime network access.
