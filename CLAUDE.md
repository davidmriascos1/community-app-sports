# Community-first gym app

Expo (SDK 57) + React Native + TypeScript. Supabase, FastAPI and a Next.js dashboard come later.
See `AGENTS.md` for Expo-specific rules (use `npx expo install`, check versioned docs).
See `ROADMAP.md` for the product plan, hypothesis, metrics and milestone order. Read it before starting a milestone.

## Product principle

Community comes first. Before building a feature, ask: does this increase useful
member-to-member participation, motivation, accountability or belonging?
North-star metric: Weekly Socially Engaged Members. We work in vertical slices, one
usable experience at a time.

## Commands

Requires Node 22.13+ / 24.3+. On this machine Node 24 is installed side by side:

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run check   # typecheck + lint + tests; run after every significant change
npm run web     # browser preview
npm start       # QR code for Expo Go
```

## Structure

- `src/app/` — routes only (Expo Router). Each file renders a screen from `src/screens/`.
- `src/screens/`, `src/components/` — UI. No business logic.
- `src/features/` — pure functions with tests (`classes/`, `community/`).
- `src/hooks/` — connect data + feature logic to screens.
- `src/lib/classesRepository.ts` — the only data access. Mock today; replace with Supabase here.
- `src/types/` — domain types, snake_case to match future database columns.

## Decisions to keep

- **Training familiarity, not friendship.** A familiar member is someone the user has
  attended classes with. Never call them friends. Logic lives in `features/community/familiarity.ts`.
- **Attendee counts are derived from bookings, never stored.** With Supabase, joining must be
  atomic in the database (unique `class_id + user_id`, capacity checked there).
- **Privacy has one gate:** `canSeeAttendance()` in `features/community/attendees.ts`.
  `show_class_attendance` will be checked there, and must also be enforced in the database.
  Never show health information socially.
- **Analytics measures what the user actually saw, not what existed in the database.**
  `features/community/socialView.ts` builds one object that both the UI renders and
  `lib/analytics.ts` logs. Members behind "+N" are not "visible" until the list is opened.
  Console only for now: no storage, no A/B testing.

## Behavioural funnel (only the first two steps are measured today)

social exposure → class booking → actual attendance → repeat attendance

The long-term outcome is training consistency, not button clicks.

## Milestone 1 (done)

Login (mock member picker) → today's classes with attendee avatars → class detail → join.

Not built yet: real auth, Supabase, cancel booking, check-in, friends/follows, feed,
challenges, chat, nutrition, physio, calculators, payments, admin.
