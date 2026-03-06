# Product Requirements Document (PRD): deen.page

## 1. Executive Summary

**deen.page** is an invite-only directory and identity layer for Muslim indie hackers, founders, and developers building Islamic applications. It provides builders with a centralized, shareable profile to showcase their projects, signal their professional availability (e.g., seeking co-founders, funding), and accept direct financial support from the community.

## 2. Problem Statement

Muslim builders creating tools for the Ummah lack a dedicated, high-signal platform to showcase their portfolios. General directories are too broad, and algorithmic social feeds bury project announcements. Furthermore, there is a disconnect between builders creating free Islamic utilities (Sadaqah Jariyah) and community members or investors who want to financially support or partner on these exact types of projects.

## 3. Goals & Non-Goals

**Goals for V1 (MVP):**

- Establish a frictionless onboarding pipeline using X (Twitter) OAuth.
- Implement a robust invite-code system coupled with a manual approval fallback to ensure high directory quality.
- Allow users to create public-facing profiles with X handle, support link, looking for status and project(s).
- Provide a searchable, filterable directory of active builders.

**Non-Goals for V1:**

- In-app messaging or direct messaging between users (users will be directed to X).
- Native payment processing (we will rely on external links like Buy Me a Coffee or Stripe).
- Complex analytics dashboards for profile views.

## 4. Target Personas

- **The Shipper (Primary):** A developer or founder actively building apps. They need a clean vanity URL to use in their social bios and a way to signal what they need (funding, collaborators).
- **The Supporter/Investor (Secondary):** A community member, VC, or angel investor looking to discover halal tech, fund projects, or hire talent.

## 5. Core Functional Requirements

### 5.1. Authentication & Onboarding Pipeline

- **Requirement 1.1:** The system must support single sign-on (SSO) exclusively via X (Twitter) using Better Auth.
- **Requirement 1.2:** Upon initial login, the system must capture the user's X handle, display name, and profile picture.
- **Requirement 1.3:** New accounts must default to an `is_approved = false` state.
- **Requirement 1.4:** Users in the unapproved state must be restricted to a private dashboard to complete their profile and cannot be indexed on the public directory.

### 5.2. The Gatekeeping System (Invites & Approvals)

- **Requirement 2.1:** Unapproved users must be able to input a 6-character alphanumeric invite code.
- **Requirement 2.2:** Validating a correct invite code must instantly toggle the user's status to `is_approved = true`.
- **Requirement 2.3:** An admin must have the ability to manually toggle a user to `is_approved = true` from the database.
- **Requirement 2.4:** Upon approval, the system must automatically generate three (3) unique invite codes tied to the new user's account for them to distribute.

### 5.3. Profile Management

- **Requirement 3.1:** Users must be able to update their bio (max 160 characters).
- **Requirement 3.2:** Users must be able to add, edit, and delete "Projects." A project entity consists of a Title (e.g., _HalalMarker_, _Halal Quest_), an image (favicon.ico), a URL, and a short description.
- **Requirement 3.3:** Users must be able to select predefined "Status Tags" (e.g., Looking for Co-founder, Raising Funds, Available for Freelance).
- **Requirement 3.4:** Users must be able to provide an external monetization URL (e.g., Buy Me a Coffee, Stripe, etc.).

### 5.4. Public Directory & Discovery

- **Requirement 4.1:** The homepage must aggregate all users where `is_approved = true`.
- **Requirement 4.2:** The directory must support filtering by "Status Tags" so investors or collaborators can easily find relevant builders.
- **Requirement 4.3:** The directory must support basic text search against user names and project titles.

## 6. Technical Architecture Overview

- **Framework:** Next.js (App Router) for server-side rendering and API routes.
- **Database:** MongoDB for flexible document storage.
- **Authentication:** Better Auth integrated with X OAuth provider.
- **Open Graph Generation:** `@vercel/og` to dynamically generate shareable Twitter cards for each profile route (`/wahab`).

## 7. Success Metrics (KPIs for MVP)

To evaluate the success of the initial launch, track the following:

- **Activation Rate:** Percentage of users who complete their profile after X OAuth.
- **Invite Velocity:** The average time it takes for a newly granted invite code to be claimed by a new user.
- **Profile Share Rate:** Number of times the dynamic OG images are triggered (indicating the link was shared on X or other platforms).
- **Directory Density:** Number of active projects listed across all approved profiles.
