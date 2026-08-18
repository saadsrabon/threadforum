# ThreadSphere — Development Progress

> Last updated: **2026-08-17**

## Current Phase: 3 — Social interactions & polish

| Task | Status |
|------|--------|
| Create community wizard | ✅ Done |
| User profile page | ✅ Done |
| Follow users API + UI | ✅ Done |
| Socket.io live comments | ✅ Done |
| Socket.io live notifications | ✅ Done |
| Create community cover upload | ✅ Done |
| Reaction toggles | ✅ Done |
| Bookmark toggles + saved page | ✅ Done |
| Join community button | ✅ Done |
| Image upload API | ✅ Done |
| DM / personal messaging | ⏭ Skipped (not in scope) |
| Account settings (profile + password) | ✅ Done |
| Public profile for connecting | ✅ Done |
| Bookmarks hub (default saved page) | ✅ Done |
| Optional community on thread create (personal posts) | ✅ Done |

---

## Session 8 — Personal posts (no community required)

**API**
- `communityId` optional/nullable on thread create
- Migration: nullable `community_id`, partial unique indexes for slug per scope
- Standalone thread URLs in notifications when no community

**Pages**
- `/create/thread` — "Personal post — no community" option
- `/t/[threadId]` — standalone thread detail (redirects to community URL when applicable)
- Feed, profile, bookmarks, search — handle threads without a community

---

## Session 9 — Live notification badge & sound

**Web**
- `NotificationProvider` — joins user socket room globally, tracks unread count
- Header bell shows unread badge + ring animation on new notifications
- Short chime via Web Audio when a notification arrives (after first user interaction)
- Notifications inbox: scrollable feed grouped by Today / Yesterday / This week / This month / older months, infinite scroll, category filters

---

## Session 10 — Session persistence (token refresh)

**Web**
- API requests proxied via `/api/*` so auth cookies live on the web origin (fixes middleware + fast logout)
- Auto-refresh on 401 in `apiFetch` using `POST /auth/refresh`
- Proactive refresh every 14 minutes + on window focus while logged in
- Socket.io still connects directly to API host (`NEXT_PUBLIC_SOCKET_URL`)

---

**API**
- `PATCH /users/me` — update display name, bio, location, website, avatar, public visibility
- `POST /auth/change-password` — change password with current password verification
- `GET /auth/me` — extended with location, website, isPublic

**Pages**
- `/settings` — account settings (profile + security tabs)
- `/u/[username]` — enhanced public profile for connecting (follow, bio, posts, communities)
- `/bookmarks` — full 3-column saved threads hub with community filters and remove

---

## Session 6 — Skeletons, empty states, auth gates

**UX**
- Route-level `loading.tsx` skeletons for all pages
- Creative `EmptyState` components (feed, search, bookmarks, notifications, comments, etc.)
- Global + segment `not-found.tsx` pages (404, community, thread, user)
- `middleware.ts` protects `/bookmarks`, `/notifications`, `/create/*`
- `AuthProvider` + auth-aware header (login/signup vs user menu)
- Public browsing; reactions, bookmarks, comments, join, follow require login

---

## Session 5 — Reactions, bookmarks, uploads, join

**API**
- `POST /threads/:id/react` — toggle reaction, socket emit
- `POST /threads/:id/bookmark` — toggle bookmark
- `GET /bookmarks` — list saved threads
- `POST /uploads/image` — image upload (multer, served at `/uploads`)
- `POST/DELETE /communities/:slug/join` — join or leave community
- Thread detail includes `userReacted` / `userBookmarked` when logged in

**Pages & components**
- `/bookmarks` — saved threads inbox
- `ReactionButton`, `BookmarkButton`, `JoinCommunityButton`, `ImageUpload`
- Community page cover banner + icon
- Create community wizard — cover & icon upload on Appearance step
- Messaging UI removed from header and profiles

---

## Session 4 — Community wizard, profiles, realtime

**API**
- `POST /communities` — create community (wizard submit)
- `GET /users/:username` — profile, posts, communities
- `POST/DELETE /users/:username/follow`
- Socket emits on comment, notification, follow

**Pages**
- `/create/community` — 5-step dark wizard (details, appearance, rules, privacy, preview)
- `/u/[username]` — 3-column profile (mockup layout)
- Thread pages auto-refresh on new comments via Socket.io
- Notifications inbox refreshes live

---

## Demo credentials

| Email | Password |
|-------|----------|
| `demo@threadsphere.dev` | `Password1` |

**Sample profiles:** `/u/maya_lin`, `/u/ethan_cole`, `/u/demo_user`

---

## Key URLs

| Page | URL |
|------|-----|
| Create community | http://localhost:3000/create/community |
| User profile | http://localhost:3000/u/maya_lin |
| Create thread | http://localhost:3000/create/thread |
| Personal thread | http://localhost:3000/t/{threadId} |
| Notifications | http://localhost:3000/notifications |
| Bookmarks | http://localhost:3000/bookmarks |
| Account settings | http://localhost:3000/settings |
| Public profile | http://localhost:3000/u/maya_lin |

---

## Try it

1. Log in → react or bookmark a thread → check `/bookmarks`
2. Log in → `/create/community` → upload cover on Appearance step → visit new community
3. Visit a community → Join Community → create a thread
4. Open a thread in two tabs → react in one → count updates in the other via socket

---

## Commands

```bash
docker compose up -d
cd apps/api && npm run dev
cd apps/web && npm run dev
```

**Env:** set `API_PUBLIC_URL=http://localhost:4001` in `apps/api/.env` for upload URLs.
