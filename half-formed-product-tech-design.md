# Half-Formed — Product & Technical Design Document
*A working name — swap it freely. It's a placeholder for "a space for ideas that aren't ready yet."*

**One-line thesis:** a website organized into small, topic-bound conversation rooms ("pods") where the interface itself — not just a stated policy — removes the fear-tax on sharing a half-baked idea.

This document goes from design philosophy → visual system → screens → animation → full technical architecture (frontend, backend, database, storage, infra) → phased build plan. It's meant to be a living reference, not a locked spec — flag anything that should change.

---

## 1. Design principles (carried over, condensed)

Everything below traces back to four decisions made in the ideation phase:

1. **No public scoreboards.** Reactions signal resonance, not rank.
2. **Bounded rooms, not infinite feeds.** Small groups build trust; open broadcast doesn't.
3. **The interface enforces the ground rules.** "Be kind" as a posted policy does nothing; a compose box that nudges good-faith framing does something.
4. **Different topics need different mechanics**, not just different labels — politics, psychology, and sociology each get their own conversational shape.

Everything in the UI/UX and architecture sections exists to serve one of these four.

---

## 2. Information architecture

```
half-formed/
├── Discover              → "The Commons Map" — ambient view of all active pods
├── Pod (/pod/:id)        → the reading-room conversation itself
├── Start a Pod           → create a new room under a topic vertical
├── Profile (/me)         → pseudonym, history, saved threads
├── Onboarding            → handle creation, interest picks, one-screen ground rules
└── Archive (/archive)    → past pods, summarized (not raw transcripts)
```

Topic verticals are first-class objects in the data model, not just tags — each one carries its own **discussion mode** (see §5), accent color, and default room capacity. Launch verticals: **Sociology, Psychology, Politics, Philosophy** — expandable later.

---

## 3. Visual design system

Steering away from the three looks that current AI-generated design defaults to (cream + terracotta; near-black + acid accent; broadsheet hairline grids) — this needed a warmer, quieter register than any of those, closer to a study at dusk than a dashboard.

### Color tokens

| Token | Hex | Role |
|---|---|---|
| `ink-deep` | `#1B2420` | Primary background — a mossy charcoal, not pure black |
| `parchment` | `#EDE6D3` | Primary text on dark surfaces; card fill in light contexts |
| `ash` | `#8B9490` | Secondary text — timestamps, metadata, capacity counters |
| `sage-signal` | `#7C9B7E` | System accent — "resonates" reaction, success states, focus rings |
| `clay-thread` | `#C17F56` | Sociology vertical identity |
| `dusk-lavender` | `#9C8CA8` | Psychology vertical identity |
| `harbor-teal` | `#4F8583` | Politics vertical identity — deliberately the coolest, calmest hue for the highest-stakes room |

Vertical colors aren't decoration — they're wayfinding. A user should be able to tell which kind of room they're in from color alone before reading a word, the way library sections used to have different-colored spines.

### Typography

- **Display — Fraunces** (variable serif). Used for pod titles and the Commons Map labels only. Warm, slightly irregular ink-trap detailing — reads as handwritten-adjacent, not corporate.
- **Body — Karla.** Humanist grotesque, rounded terminals, high screen legibility, quieter than Inter's now-ubiquitous default feel.
- **Utility/mono — IBM Plex Mono.** Reserved for anything that's data, not prose: timestamps, "5/8 here," discussion-mode tags.

### Layout concept

Not a card grid. The pod view is a **single centered reading column** (max-width ~680px) — vertical rhythm like a page in a book, not a dashboard. The only place density is allowed is the Commons Map itself, and there it's ambient, not tabular.

### Signature element: The Commons Map

The Discover screen's hero isn't a headline — it's a live, softly animated constellation. Each active pod is a node:
- **Size** = how many people are present right now (never a vote count)
- **Color** = topic vertical
- **Proximity to other nodes** = how much cross-pollination of ideas has happened between rooms (loosely inspired by Pol.is's opinion-clustering visualizations, but rendered as ambient art rather than a data chart)

This is the one place the product spends its "boldness budget." Everything else stays quiet and disciplined around it.

```
┌──────────────────────────────────────────────────┐
│  half-formed                              [ me ]  │
│                                                     │
│      ·        .              ·                    │
│           ⬤ sociology(5)      ·    ⬤ psychology(3) │
│       ·         ⬤ politics(8)         ·           │
│                                          ·         │
│              ·        ⬤ philosophy(2)              │
│                                                     │
│   [ + start a pod ]         [ search topics ]      │
└──────────────────────────────────────────────────┘
```

### Pod / reading-room screen

```
┌────────────────────────────────────┐
│ ← sociology · harbor glow · 5/8 here│
├────────────────────────────────────┤
│                                      │
│  someone_quiet                      │
│  what if suburbs are less about     │
│  isolation and more about a design  │
│  trade-off nobody named out loud?   │
│                                      │
│      ◦ resonates (3)   ◦ curious(1) │
│                                      │
│  another_voice                      │
│  steelmanning that: the design      │
│  reflects a real, if unstated,      │
│  preference for control over...     │
│                                      │
├────────────────────────────────────┤
│ [ share a half-formed thought · · ] │
└────────────────────────────────────┘
```

Note the compose bar's placeholder text — "share a half-formed thought," not "post" or "comment." Copy is doing product work here, not decoration: it resets the bar for what's welcome.

---

## 4. Motion & animation catalog

Restraint is the point — one orchestrated moment on load, a small, deliberate set of micro-interactions everywhere else. Nothing pulses, bounces, or confetti-bursts, because those are dopamine-loop patterns borrowed from engagement-optimized apps, which is exactly the psychology this product is opting out of.

| Moment | Behavior | Timing / easing |
|---|---|---|
| Discover page load | Commons Map nodes breathe in with a staggered fade + scale | ~600ms, spring (high damping, no overshoot) |
| Entering a pod | Camera-zoom metaphor: map dissolves into the reading column, tinted by that vertical's color | ~450ms crossfade |
| New message arrives | Soft upward drift (8–12px) + fade — "a thought surfacing," not a chat bubble popping in | ~280ms ease-out |
| Someone is composing | A single slow-pulsing ellipsis — deliberately slower than typical chat apps, to signal *take your time* | 2s cycle |
| Reaction tapped | One small radial ripple from the icon, `sage-signal` colored — no burst, no counter animation jumping | ~350ms, single pass |
| Pod archives | Content softly desaturates and settles downward into the Archive shelf icon — memory settling, not deletion | ~1.2s |
| `prefers-reduced-motion` | All of the above collapse to plain opacity crossfades | — |

Build these with **Framer Motion** (spring-based, first-class reduced-motion support) rather than hand-rolled CSS keyframes — it keeps the physics consistent across every micro-interaction instead of each one feeling separately tuned.

---

## 5. Core mechanics → how they're actually built

| Mechanic | Implementation |
|---|---|
| No public scoreboard | Reaction counts are shown but never sortable/rankable; no "top posts" view exists anywhere in the schema or UI |
| Bounded pods | `pods.capacity` enforced server-side (default 8, configurable per topic); once full, new joiners see a "start a related pod" prompt instead of a waitlist |
| Ground rules in the UI | Compose box requires a `mode` selection when replying critically — "add," "question," or "steelman first" — before the text field unlocks. Small friction, big behavioral nudge |
| Vertical-specific discussion modes | `topics.discussion_mode` field: `threaded` (psychology — normal replies, support-group norms), `bridging` (politics — Pol.is-style: users submit statements, others agree/disagree/pass, **no direct reply chains**), `open` (sociology/philosophy — normal threaded but with the steelman-first friction) |
| Ephemerality | `pods.expires_at`; on expiry, a Claude-generated summary replaces the raw transcript in `/archive` — the discussion is preserved, not the surveillance-able record |

---

## 6. Frontend architecture

**Framework:** Next.js (App Router) + TypeScript, strict mode.
**Styling:** Tailwind CSS, but every color/spacing/type value is pulled from the token table in §3 as CSS variables — Tailwind config extends the theme rather than using its defaults, so the app never looks like an unstyled starter.
**Components:** Radix UI primitives (accessible, unstyled) reskinned fully to the token system — gets keyboard nav, focus states, and ARIA correctness for free without inheriting anyone else's visual language.
**Animation:** Framer Motion, per §4.
**State/data:** TanStack Query for server state (pods, messages) + Supabase's realtime client for live updates (see §8) — no separate global state library needed at this scale.

```
apps/web/
├── app/
│   ├── discover/          # Commons Map
│   ├── pod/[id]/          # reading-room view
│   ├── onboarding/
│   ├── archive/
│   └── me/
├── components/
│   ├── commons-map/       # SVG/Canvas constellation renderer
│   ├── pod/               # message list, compose bar, reaction ripple
│   └── ui/                 # reskinned Radix primitives
├── lib/
│   ├── supabase-client.ts
│   └── design-tokens.ts
└── styles/tokens.css        # the §3 palette/type as CSS variables
```

---

## 7. Backend architecture

Given the scale this needs to start at (a pilot with a few hundred users, not millions), a full custom backend is more infrastructure than the idea needs on day one. Recommended approach:

**Supabase as the backend-as-a-service core** — managed Postgres + Auth + Storage + Realtime in one place. (Worth noting: you already have a Supabase connector available in this workspace — when this moves from design to build, I can provision the schema below directly.)

- **Auth:** Supabase Auth, email/magic-link only. The email is used solely for account recovery and abuse rate-limiting — it is never shown publicly. Public identity is the chosen handle, full stop.
- **Realtime:** Supabase Realtime (Postgres logical replication under the hood) pushes new messages/presence to open pod views — no separate WebSocket server to run and scale ourselves.
- **Custom logic** (things a database can't do alone) as **Edge Functions** (Deno, deployed alongside Supabase):
  - `moderate-message` — runs new messages through a lightweight classifier before they're visible to the room; flags (not silently blocks) anything that needs human review
  - `summarize-pod` — triggered on `pods.expires_at`; calls Claude via the Anthropic API to generate the archive summary that replaces the raw transcript
  - `suggest-steelman` — optional, on-demand: helps a user rephrase a critical reply in good faith before posting

This keeps the entire backend in one managed platform instead of stitching together a separate Node API server, a separate WebSocket server, and a separate job queue — meaningfully less to operate for a small team or solo build.

*(If this later needs backend logic too complex for Edge Functions — e.g., heavier moderation pipelines — a thin Fastify service can sit alongside Supabase without replacing it. Not needed for MVP.)*

---

## 8. Database & storage

### Postgres schema (core tables)

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  email_hash text not null,          -- recovery/abuse use only, never displayed
  avatar_url text,
  trust_score int default 0,
  created_at timestamptz default now()
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- "Sociology", "Politics"...
  slug text unique not null,
  accent_hex text not null,
  discussion_mode text not null,      -- 'threaded' | 'bridging' | 'open'
  default_capacity int default 8
);

create table pods (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id),
  title text not null,
  seed_prompt text,
  capacity int not null,
  status text default 'active',       -- 'active' | 'archived'
  created_at timestamptz default now(),
  expires_at timestamptz
);

create table pod_memberships (
  pod_id uuid references pods(id),
  user_id uuid references users(id),
  joined_at timestamptz default now(),
  primary key (pod_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid references pods(id),
  author_id uuid references users(id),
  parent_id uuid references messages(id),   -- null in 'bridging' mode
  reply_mode text,                          -- 'add' | 'question' | 'steelman'
  content text not null,
  created_at timestamptz default now()
);

create table reactions (
  message_id uuid references messages(id),
  user_id uuid references users(id),
  type text not null,                 -- 'resonates' | 'changed_my_mind' | 'curious'
  primary key (message_id, user_id, type)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id),
  reporter_id uuid references users(id),
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);

create table archive_summaries (
  pod_id uuid primary key references pods(id),
  summary_text text not null,
  key_threads jsonb,                  -- structured points of divergence/consensus
  generated_at timestamptz default now()
);
```

### Where each kind of data lives

| Data | Store | Why |
|---|---|---|
| Users, pods, messages, reactions, reports | **Postgres** (Supabase) | Relational, needs integrity constraints (foreign keys matter here — a message can't outlive its pod) |
| Live presence, "who's typing," ephemeral session state | **Redis** (Upstash, serverless-friendly) | Sub-second reads/writes, doesn't need durability |
| Avatars, exported archive-summary cards | **Object storage** — Supabase Storage (S3-compatible), or Cloudflare R2 for zero egress fees at scale | Binary blobs, not relational |
| Topic/pod search & discovery | **Postgres full-text search** (`tsvector`) for MVP; upgrade to Meilisearch only if fuzzy/semantic search becomes a real need | Avoids standing up a whole search infra before it's needed |
| Future: semantic "which pod fits this half-formed thought" matching | `pgvector` extension (native to Supabase) | Lives in the same database — no extra service |

---

## 9. Infrastructure

| Layer | Choice | Why |
|---|---|---|
| Frontend hosting | **Vercel** | Native Next.js support, edge caching, zero-config previews per PR |
| Backend / DB / auth / realtime / storage | **Supabase** | One managed platform for all of §8, already connected in this workspace |
| Caching / presence | **Upstash Redis** | Serverless-billed, pairs naturally with Vercel's edge functions |
| CDN / abuse protection | **Cloudflare** in front of Vercel | DDoS protection, bot-mitigation for the report/vote endpoints specifically |
| LLM calls (moderation, summarization, steelman assist) | **Anthropic API** (Claude) from Supabase Edge Functions | Keeps the moderation logic server-side and auditable, never client-exposed |

---

## 10. Security, privacy & moderation

- **Pseudonymous by default.** Email exists only as a hash for recovery/rate-limiting — never queryable from the public schema.
- **Rate limiting by device/IP fingerprint hash**, not identity — lets abuse controls work without breaking the anonymity promise.
- **Moderation is hybrid:** the `moderate-message` Edge Function flags likely-problematic content pre-publish for the two most sensitive verticals (politics, psychology); genuinely harmful content is blocked, borderline content goes to a human review queue rather than being auto-removed — false positives are a bigger threat to trust here than a short review delay.
- **Encryption:** TLS in transit; Supabase's Postgres is encrypted at rest by default.
- **Report flow:** any message can be reported; three reports auto-hides pending review rather than requiring a moderator to catch it first.

---

## 11. Phased build plan

| Phase | Scope | Goal |
|---|---|---|
| **0 — Prototype** (2–3 wks) | Static Next.js app, one topic vertical, mock data, full visual/animation polish, no auth or backend | Test whether the *feel* actually reads as safe to real people before building infra |
| **1 — Core loop** (4–6 wks) | Supabase schema + auth, create/join pods, post messages (poll-based refresh, no realtime yet) | Validate the core loop with a small pilot group (a few dozen people, one or two verticals) |
| **2 — Realtime + memory** | Supabase Realtime, reactions, `summarize-pod` archiving | Pods feel alive; nothing lingers as raw transcript forever |
| **3 — Vertical mechanics** | `bridging` mode for politics, moderation Edge Function, trust score | The parts that make different topics behave differently, not just look different |
| **4 — Scale & expand** | Additional verticals, semantic pod-matching (`pgvector`), mobile web polish, native app if warranted | Only after the core loop is proven to hold up with real strangers |

---

## 12. Open decisions worth your input

- **Which vertical to prototype first** — politics is the most differentiated concept (bridging mode) but also the highest-risk to moderate; psychology may be the gentler place to test the core loop first.
- **Solo build vs. small team** — affects how much of §7–9 to simplify further for v0.
- **Naming** — "Half-Formed" is a placeholder; worth sitting with for a day before it sticks.

---

*Next natural step, if useful: an actual clickable prototype of the Discover + Pod screens (Commons Map animation and all), or I can go ahead and provision the Supabase schema in §8 directly through the connected integration.*
