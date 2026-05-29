# AGENTS.md

## Project Overview

This project is a modern minimalist web application called **jaitonmaillot.fr**.

It is a lightweight community utility built to help users reconnect misplaced football jerseys caused by logistical errors (e.g. incorrect shirt shipping or wrong personalization).

The core concept is extremely simple:

> Users search for a name (flocage) they were supposed to receive or received incorrectly, and discover if someone else has declared it.

No complex matching system, no accounts, no social network logic.

Just a fast, searchable registry.

---

## Tech Stack

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Lucide Icons
* Supabase (simple database)

---

## Core Product Philosophy

The product must remain:

* extremely fast
* dead simple
* frictionless
* public by default
* search-first

It is not a platform. It is a tool.

---

## Core User Flow

### 1. Search

User lands on homepage:

* Input: “Quel nom est sur ton maillot ?”
* Instant search results appear

If match exists:

* Show entries where someone has declared receiving that flocage

---

### 2. Declare a jersey

Secondary action:

User can submit a jersey they received:

Fields:

* flocage (string)
* size (optional)
* @X / Twitter handle (optional but recommended)
* photo (optional)
* timestamp

No account required.

---

### 3. Result display

Each result shows:

* flocage
* optional metadata (size, photo)
* contact action (X profile link or mail button)

No internal messaging system.

---

## Data Model (Supabase)

Single table: `jerseys`

Fields:

* id (uuid)
* flocage (text, indexed)
* size (text, nullable)
* twitter_handle (text, nullable)
* photo_url (text, nullable)
* created_at (timestamp)

---

## Pages

### `/`

Minimal homepage:

* search input
* results list
* CTA: “Déclarer un maillot”

---

### `/declare`

Simple form:

* flocage
* size
* twitter handle
* photo upload

---

## Design Philosophy

Must remain aligned with:

* Vercel
* Linear
* Stripe
* Apple
* Raycast

The UI should feel:

* calm
* minimal
* intentional
* utility-first

No clutter. No gimmicks.

---

## UI Rules

Follow global design system strictly:

* whitespace over borders
* typography-driven hierarchy
* neutral palette
* subtle accents only
* mobile-first layout

Search is the primary interaction.

---

## Critical UX Principle

The product is not a dashboard.

It is a single search bar with a database behind it.

Everything else is secondary.

---

## Performance Constraints

* instant search response
* minimal client JS
* no heavy state management
* no unnecessary rerenders

---

## Moderation Strategy (MVP)

Keep it minimal:

* basic rate limiting
* simple spam protection
* optional manual deletion later

Do not over-engineer trust & safety early.

---

## Growth Model

The product is designed for:

* Twitter virality
* community amplification
* screenshot sharing
* simple URL sharing

Every result page should be shareable.

---

## Coding Principles

Maintain:

* strict TypeScript
* reusable components
* small UI primitives
* clean separation of concerns

Avoid:

* over-abstraction
* unnecessary architecture layers
* premature optimization

---

## Important Principle

The product must feel like:

> “I can check this in 5 seconds and be done”

Not:

> “I need to understand how this platform works”

Less but better.

