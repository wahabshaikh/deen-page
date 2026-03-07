# Product Requirements Document (PRD)

## deen.page

---

# 1. Product Overview

**deen.page** is a curated directory of Muslim Builders & Islamic Projects.

The platform indexes Muslim developers, founders, and indie hackers building tools for the Ummah and provides them with a public profile and project showcase.

Profiles may be **indexed by the platform**, **verified by builders**, or **created through invites**. The directory prioritizes **project discovery**, with builder profiles acting as the identity layer.

Primary exploration happens through projects rather than people.

---

# 2. Core Problem

Muslim builders frequently release Islamic applications, APIs, and tools, often sharing launches on X (Twitter). Social feeds rapidly bury these announcements.

Consequences:

- Islamic tools become difficult to rediscover
- Builders cannot easily find collaborators
- Community members cannot locate projects to support
- Islamic developer infrastructure remains fragmented

No centralized index currently exists for Muslim builders and their projects.

---

# 3. Product Vision

Create the **directory of Muslim Builders & Islamic Projects**.

The platform becomes a central discovery layer for:

- Islamic apps
- Muslim developers
- Islamic open-source tools
- emerging Islamic developer ecosystems

---

# 4. Goals (MVP)

1. Index Muslim builders and their projects.
2. Allow builders to verify ownership of indexed profiles.
3. Allow new builders to join via invite codes.
4. Provide public builder pages that can be shared on X (Twitter).
5. Provide a searchable directory of projects and builders.
6. Enable discovery through project categories.

---

# 5. Non-Goals (MVP)

Excluded from V1:

- messaging between users
- comments
- likes or voting systems
- in-platform donations
- analytics dashboards
- follower systems
- reputation systems
- internal communication tools

External platforms such as X (Twitter) remain the communication layer.

---

# 6. Target Personas

## Builder (Primary)

Muslim developers building Islamic software.

Needs:

- visibility for projects
- a simple public builder page
- discovery of other Muslim builders
- collaborators or co-founders

---

## Discoverer (Secondary)

Developers or community members searching for Islamic tools.

Needs:

- find Islamic applications
- explore open-source projects
- discover Muslim builders

---

## Supporter (Tertiary)

Investors or community supporters interested in Islamic technology.

Needs:

- discover promising projects
- identify builders creating valuable tools

---

# 7. Core System Model

The platform centers around projects.

System hierarchy:

```
Project
  ↳ Builder
      ↳ Profile Page
```

Projects drive discovery.
Profiles provide the identity layer.

---

# 8. Builder States

Builders exist in two primary states.

### Indexed

Builder was added manually by the platform.

Characteristics:

- appears in directory
- public profile exists
- cannot edit profile

---

### Verified

Builder authenticated via X (Twitter) OAuth and verified ownership.

Characteristics:

- profile ownership verified
- editing enabled
- receives invite codes

---

# 9. Onboarding Flows

## Flow A — Verify Indexed Profile

1. Builder discovers their profile.
2. Clicks **Verify Profile**.
3. Signs in via X (Twitter) OAuth.
4. System verifies X handle match.
5. Builder becomes **verified**.
6. Builder receives invite codes.

---

## Flow B — Join via Invite

1. User signs in via X (Twitter) OAuth.
2. User enters invite code.
3. System validates invite.
4. New builder profile created.
5. Builder becomes **verified**.

---

# 10. Invite System

Invite codes allow verified builders to onboard new builders not yet indexed.

Rules:

- each verified builder receives **3 invite codes**
- invites are **single-use**
- invites expire after **14 days**
- invite creator is tracked

Invite lifecycle:

```
create → distribute → redeemed → consumed
```

Purpose:

- controlled directory expansion
- community-driven onboarding

---

# 11. Builder Profile

Each builder has a public page.

Example URL:

```
deen.page/wahab
```

Profile fields:

- name
- avatar
- X handle
- GitHub URL (optional)
- personal website URL (optional)
- support link (optional)
- country (optional)
- status tags

Bio is excluded in V1 to minimize friction.

Status tags include:

- Looking for Co-founder
- Raising Funds
- Available for Freelance
- Open Source Contributor
- Building in Public

Optional support link:

- Buy Me a Coffee
- Stripe
- other donation platform

---

# 12. Projects

Projects are the primary discovery unit.

Each builder can add multiple projects.

**Add flow:** Enter URL first. System fetches favicon, title, and description from the URL. Builder can edit these before saving. Builder selects categories and optional store links.

Project fields:

- URL
- title (fetched from URL, editable)
- description (fetched from URL, editable)
- favicon (fetched from URL, editable)
- categories (platform/format, multiple)
- builder ID
- optional GitHub repository
- optional App Store link
- optional Play Store link
- optional Chrome Web Store link

Categories indicate the platform or format. A project can have multiple:

- Web
- iOS
- Android
- Chrome Extension
- Repo
- CLI
- API
- etc.

Verified builders can add, edit, and delete their projects.

Example URL:

```
deen.page/projects/quran-ai
```

---

# 13. Public Directory

The homepage aggregates projects and builders.

Homepage sections:

- Recently Added Projects
- Featured Islamic Projects
- Open Source Projects
- Builders Looking for Co-founder

Directory supports:

- project browsing
- builder browsing
- category filtering
- text search

Search fields:

- builder name
- X handle
- project title
- project description

---

# 14. Profile Indicators

Profiles display ownership status.

Possible labels:

- Verified Builder
- Indexed Builder

This clarifies which profiles are platform-indexed versus builder-owned.

---

# 15. Technical Architecture

Framework
Next.js (App Router)

UI
Tailwind CSS
DaisyUI

Authentication
X OAuth using Better Auth

Database
MongoDB

ORM / ODM
Mongoose

Hosting
Vercel

Dynamic Open Graph images generated with:

```
@vercel/og
```

Used for:

```
deen.page/{builder}
deen.page/projects/{project}
```

These images optimize sharing on X (Twitter).

---

# 16. URL Structure

Recommended routes:

```
deen.page/{builder}
deen.page/projects/{project}
deen.page/category/{category}
```

Projects enable search discovery.

---

# 17. Data Management

No admin interface is required for V1.

Builders and projects can be created and edited directly through MongoDB using MongoDB Compass.

Initial directory population will be performed manually.

---

# 18. Growth Loop

Platform expansion model:

```
Admin indexes builders
↓
Builders verify profiles
↓
Builders receive invites
↓
New builders join via invites
↓
Directory expands
```

Builders sharing their pages on X (Twitter) drives discovery.

---

# 19. Launch Requirements

Minimum dataset before launch:

- **100+ builders**
- **100+ projects**

Builders will be sourced from Islamic build threads and open-source repositories shared on X (Twitter).

---

# 20. Success Criteria (MVP)

The MVP is considered successful if the directory reaches:

- **100+ builders**
- **100+ projects**

Secondary signals:

- profiles verified
- invites redeemed
- project pages shared on X (Twitter).
