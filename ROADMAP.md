# Plan and roadmap

This is the guide for where the product is going and in what order. Read it before
starting any milestone. `CLAUDE.md` holds the commands, code structure and technical
decisions; this file holds the product direction.

This is a directional guide, not a fixed contract. What we learn from using the product
can change the order of milestones, and when it does, this file is updated.

Status legend: **Done**, **Next**, **Planned** (current intended order), **Later**.

---

## 1. What we are building

A community-first gym app. It is not primarily a gym-management tool.

**Purpose:** help gym members train consistently because they feel part of a community,
while giving them training, nutrition, recovery, physiotherapy, progress tracking and
professional services in one place.

Existing gym apps show "8 / 10 spots booked". They don't show who is going. We want
the class itself to be a social coordination mechanism: "Male and Matias are going"
is a stronger reason to show up than "2 spots left".

Community comes first. Everything else connects to it later:

community + training + progress + nutrition + recovery/physiotherapy + professional services

## 2. How we decide what to build

Before any feature, ask:

> Does this increase useful member-to-member participation, motivation,
> accountability, or belonging?

We design around loops, not feature checklists. The core loop:

1. Member sees people they've trained with attending
2. Decides to book
3. Attends the class
4. Records a result
5. Others react, compare, congratulate
6. Member feels progress and belonging
7. Comes back, and the community gets stronger

Each milestone should close or strengthen one step of this loop. We do not build
something only because competitor apps have it.

## 3. How we measure

**North-star metric: Weekly Socially Engaged Members (WSEM).** A member counts if,
during the week, they do at least one meaningful community action: attend a class with
others, book after seeing another member attending, join a challenge, react to or
congratulate someone, share a PR or result, invite someone, or take part in a
discussion or check-in.

**Secondary KPIs**

1. Weekly active members
2. % of members socially engaged
3. Classes booked after viewing attendees
4. Average repeat attendance with familiar members
5. Member-to-member interactions per week
6. Class attendance rate
7. Booking → attendance conversion
8. 4-week member retention
9. Community challenge participation
10. Invite-driven bookings

Not goals in themselves: app opens, page views, calculator clicks.

Tracked later, and secondary to community and retention: nutrition and physiotherapy
appointment conversion, calculator usage, workout progress, professional service revenue.

## 4. Current hypothesis

> Making other members' training intentions visible may increase the probability that
> members commit to training, especially when the visible attendees are people they
> have trained with before.

We are not proving causality yet. We are keeping behavioural traces so it can be
analysed later.

**Measurement principle:** record what the member actually saw, not merely what
existed in the database. A member hidden behind "+5" was not seen.

**Funnel**

| Step | Measured today? |
|---|---|
| Social exposure (card viewed, attendee list opened) | Yes, console only |
| Class booking | Yes, console only |
| Actual attendance | No |
| Repeat attendance | No |

The long-term outcome is training consistency, not button clicks.

**Later experiment (not built):** randomly compare no social information vs generic
attendee information vs familiar-member information. This needs real usage first.

## 5. Working method

- One vertical slice at a time: a complete, usable experience, not a layer.
- Plan first, get approval, then build.
- After every significant change: `npm run check`, inspect the app, fix, continue.
- Maximum three correction rounds per milestone. Don't add features on a broken flow.
- If an architectural choice could make future community features hard, stop and
  explain it before locking it in.
- Optimise for understandable code, easy iteration, community interactions,
  measurable behaviour and product learning. Not maximum abstraction.

---

## 6. Roadmap

### Milestone 1 — "Who's going?" · Done (commit `4fa153e`)

> As a gym member, I can open the app, see today's classes, see which members are
> attending each class, open a class, and join it.

Built:

- Mock login (member picker), Home with today's classes, class detail, join.
- Attendee avatars and a summary sentence, visually ahead of the capacity number.
- Training familiarity: people you've attended classes with are shown first and marked.
- Exposure analytics to the console: `class_card_viewed`, `attendee_list_opened`,
  `class_joined`, with the IDs of the members who were actually identifiable.
- Mock data behind an async repository, pure logic with tests, `npm run check`.

Known gaps, found by actually using it. Most are the reason Milestone 2 exists:

- Only verified in headless Chrome at phone size. Not yet run on a real device.
- After joining, the member's own avatar takes one of three card slots, so fewer other
  people are visible to members who have already committed.
- The "People you've trained with" marker relies on a coloured ring alone.
- A full class is a dead end.
- The greeting wraps onto two lines on a narrow screen.
- Avatars are initials, a weaker identity cue than a name or photo.
- State resets on reload; nothing is stored.

### Milestone 2 — Community experience redesign · Next

Question to answer: **does the community experience feel valuable enough that we want
real members using it?**

Keep the current mock architecture. Improve the existing member experience before
adding any backend complexity.

- Keep the current user's avatar out of the limited social exposure slots after they
  join, so committed members still see as many other people as before.
- Make training familiarity clearer than a coloured ring.
- Improve the information hierarchy of Home and the class card.
- Improve class detail.
- Fix narrow-screen layout issues.
- Test the app in Expo Go on a real phone.
- Explore the UX for a full class and a future waitlist, without building the waitlist
  system itself.

Exposure analytics must keep matching what is actually on screen after the redesign.

Loop step: none new. It makes steps 1–2 worth having.

### Milestone 3 — Thin gym-owner interface · Planned

Goal: learn the second actor's workflow before making the data model permanent.

Only the smallest owner experience:

- today's classes
- attendee list
- capacity
- edit class capacity
- basic class creation and editing, if needed

This is not a full admin platform.

### Milestone 4 — Real members, real data · Planned

Goal: the same experience, but with real accounts and data that persists, so real
members of one gym can use it and their behaviour can be analysed. By now both the
member and the owner side have shaped the data model.

- Supabase project, the four tables (`gyms`, `profiles`, `classes`, `class_bookings`).
- Real authentication replacing the member picker.
- Joining as one atomic database operation (no double booking, no overbooking).
- Attendance visibility enforced in the database, not only in the app.
- Analytics events stored instead of logged to the console.
- Replace `classesRepository.ts`; screens should not need to change.

Loop step: none new. It makes steps 1–2 real and measurable.

### Milestone 5 — Did they actually come? · Planned

Goal: close the gap between intention and behaviour.

- Check-in or coach-confirmed attendance (`attended`, `no_show`).
- Cancel a booking.
- "My classes" and a schedule beyond today.
- Familiarity now grows from real attendance.

Loop step 3. Unlocks KPIs 4, 6, 7 and the last two funnel steps.

### Milestone 6 — Privacy controls · Planned

Goal: members choose whether their attendance is visible.

- `show_class_attendance` on the profile, with a simple setting.
- Hidden members still count toward capacity but are never named.

Should ship before or together with any wider rollout. No health information is ever
shown socially.

### Milestone 7 — Results and recognition · Planned

Goal: give members a reason to come back after the class.

- Record a result or PR for a class.
- Reactions and congratulations from others who were there.
- A small activity feed limited to the member's gym.

Loop steps 4–6. Unlocks KPI 5.

### Milestone 8 — Bringing each other along · Planned

Goal: turn passive visibility into active invitation.

- Invite a member to a class.
- Notifications: "Matias joined HYROX at 6 PM", "Male invited you".
- The real waitlist, if the full-class UX explored in Milestone 2 showed it is worth building.

Unlocks KPI 10.

### Milestone 9 — Challenges and events · Planned

Goal: shared goals beyond a single class.

- Gym challenges, team competitions, gym events.

Unlocks KPI 9.

### Later, in no fixed order

- **Explicit relationships:** follows or training partners, alongside derived familiarity.
- **Experiments:** the randomised comparison described in section 4.
- **Performance:** workout history, strength standards, body measurements, trends.
- **Fitness calculators (Python + FastAPI):** TDEE, protein, 1RM, VO2 max, muscle gain,
  calorie-deficit duration, strength standards, creatine. Each must explain the result,
  the formula, assumptions, limitations and how to apply it.
- **Nutrition:** educational content, professional profiles, appointments, later
  personalised plans.
- **Physiotherapy and recovery:** mobility content, professional profiles, appointments,
  assigned exercise programmes, adherence tracking.
- **Gym, coach and professional dashboard (Next.js):** the full version of what
  Milestone 3 starts: class management, attendance, membership information.
- **Payments and professional service revenue.**

---

## 7. Explicitly not doing yet

Nutrition, calculators, physiotherapy, AI features, payments, chat, challenges and a
full admin platform all wait until the community loop works with real members. The
only owner-facing work before then is the thin interface in Milestone 3.

Supabase, authentication and stored analytics wait until Milestone 4.

## 8. Open questions

- What tells us Milestone 2 succeeded? "Feels valuable enough" needs a concrete test,
  for example showing it to a few members on a real phone.
- Where does the thin owner interface live: a role inside the mobile app, or a first
  small web page?
- How will attendance be confirmed: member check-in, coach confirmation, or both?
- Should an initials avatar count as "identifiable" in analytics before real photos exist?
- Which gym is the first real community, and how many members does it have?
