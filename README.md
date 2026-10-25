# VOLTERRA

VOLTERRA is a premium, multi-page EV mobility and ownership platform prototype. It brings roadside assistance, charging discovery, EV rentals, maintenance, trip planning, support, and a local My Garage view into one connected experience.

## Run locally

```bash
npm install
npm run dev
```

The development server listens on port `3000`. Build the static production output with:

```bash
npm run build
npm run preview
```

## Direct pages

- `/` — Home / cinematic landing page
- `/services` — service directory
- `/roadside-assistance` — demo SOS request flow
- `/charging` — charging and nearby-services discovery
- `/rentals` — sample EV rental fleet and booking request
- `/maintenance` — demo service appointment booking
- `/trip-planner` — illustrative route planning
- `/my-garage` — local activity dashboard (`/garage` remains as an alias)
- `/about` — mission and principles
- `/contact` — support form and FAQ
- `/admin` — clearly labelled demo Operations Centre
- `/sign-in` — clearly labelled demo account access

## Prototype boundaries

All provider listings, distances, availability, route estimates, rental prices, and vehicle inventory are illustrative. SOS submission records a local demo request and does not dispatch a real provider. Rental submission does not take payment. The sign-in screen is not secure authentication and does not create a production account. My Garage and request records use browser `localStorage`; this is not a secure account system or backend database.

The Admin Operations Centre is a front-end demonstration only. A production version would require server-side authentication, authorization, audit logs, a database, real providers, maps/routing, notifications, payments, and secure integrations.

## Structure

- `src/App.tsx` — route map, shared state, page modules, forms, and connected demo flows
- `src/data.ts` — demo imagery, vehicles, service categories, and provider listings
- `src/storage.ts` — localStorage persistence and reference IDs
- `src/types.ts` — shared domain types
- `src/styles.css` — VOLTERRA design system and responsive page layouts
- `public/manus-routes.json` — direct-route manifest used by Manus Preview

No API secrets are required or included in the frontend.


## Cinematic homepage layer

The homepage now includes a cinematic EV adaptation of the visual reference: a 2000px-perspective rotating journey cube, uppercase editorial background type, EV journey case-study cards with window controls and grayscale-to-color hover, and an illustrative Essential/Growth/Command ownership-plan section with a purple glassmorphism calculator. Plan figures are demonstration-only; no payment or provider fulfillment is connected.


The hero also includes a playable, muted, looping 9-second local MP4 motion backdrop at `/media/volterra-journey-loop.mp4`, with a Pause/Play Motion control, still-image fallback, and reduced-motion support. Design credit: **Leslie K Chibumba**.


## India-first demo defaults

The homepage remains the complete all-services experience and now uses India-first demo context: Bengaluru as the default search and pickup city, Indian city/provider examples across Bengaluru, Mumbai, Pune, Delhi NCR, and Hyderabad, kilometres for distances and ranges, and illustrative INR rental and ownership-plan pricing. The data is fictional demonstration content and is not a live Indian provider directory.


## Public homepage and demo access

The homepage at `/` is public. Feature routes redirect visitors to the signup page, where they can enter an email address or Indian phone number, receive a generated six-digit verification code displayed in the Preview, and verify it to unlock the complete platform. The verified demo session is stored locally in the browser. No real SMS/email is sent and no secure production authentication account is created.
