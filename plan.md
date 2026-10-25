# VOLTERRA multi-page expansion plan

## Approved direction
Expand the existing published VOLTERRA prototype into a complete, responsive, multi-page EV mobility and ownership platform while preserving its premium cinematic identity, localStorage demo records, generated imagery, and clear demo-only boundaries.

## Implementation approach
- Keep the current React + TypeScript + Vite stack and organized CSS system.
- Replace pathname-only handling with a small explicit route map covering `/`, `/services`, `/roadside-assistance`, `/charging`, `/rentals`, `/maintenance`, `/trip-planner`, `/my-garage`, `/about`, `/contact`, `/admin`, and `/sign-in`; retain `/garage` as a backwards-compatible alias.
- Introduce shared page shell, navigation, footer, page hero, form, status, confirmation, and demo-disclaimer components so every route has consistent branding and keyboard-visible controls.
- Promote current modal flows into dedicated page experiences while retaining detail modals/drawers for vehicle and provider views where useful.
- Extend the localStorage model with saved vehicles/providers and reminder-ready Garage fields; keep Contact and Sign In feedback explicitly page-local demo interactions without presenting localStorage as secure authentication or a production backend.
- Reuse existing generated EV imagery and station/vehicle demo data; do not add unsupported live claims, payments, dispatch, telemetry, provider verification, or company history.
- Keep `/admin` clearly marked as a demo operations interface with status filters, request details, and status updates.
- Synchronize `public/manus-routes.json`, README setup notes, and the publishing build configuration.

## Page scope
1. Home: preserve the strong cinematic hero, quick actions, service overview, how-it-works, charging preview, rentals preview, care, values, trip CTA, closing CTA, footer.
2. Services: dedicated service directory with working navigation to all five service pages.
3. Roadside Assistance: fast SOS form, process guidance, request-received demo confirmation, no-dispatch language.
4. Charging: manual location search, connector/category filters, illustrative provider cards, map placeholder, detail views.
5. Rentals: pickup/return search, category filter, demo vehicle cards/details, date validation, booking confirmation.
6. Maintenance: service categories, date/time/location/contact/notes form, appointment confirmation.
7. Trip Planner: start/destination/range/stop preference form, illustrative route and charging-stop result.
8. My Garage: saved vehicles, SOS/rental/service records, service history, saved providers, reminders, quick actions, local-only account note.
9. About: mission, problem, principles, services CTA; independent concept only.
10. Contact: enquiry form, reason/name/contact/message, FAQ, service links, in-page confirmation.
11. Admin: demo operations inbox, filters, detail/status controls, activity overview, secure-admin disclaimer.
12. Sign In: polished demo account-access form with email/password, forgot/create links, explicit no-secure-authentication boundary.

## Design system
- Continue the VOLTERRA editorial automotive-tech movement: cinematic dark surfaces, warm-white editorial sections, electric lime actions, restrained purple/cyan/pink functional accents, uppercase mono labels, large compressed-feeling display hierarchy, thin borders, blur, and subtle lift/opacity motion.
- Use shared Header/Footer on every customer-facing route, with a prominent SOS action and responsive mobile navigation.
- Preserve accessible focus states, semantic labels, Escape-close for overlays, reduced-motion behavior, and no horizontal overflow.

## Project structure
- `src/App.tsx`: route composition, shared state, cross-page handlers, and page modules.
- `src/data.ts`: demo imagery, vehicles, providers, services, FAQs, and values.
- `src/storage.ts`: browser-local demo persistence and reference generation.
- `src/types.ts`: shared domain records and status types.
- `src/styles.css`: shared visual system plus page-specific responsive layouts.
- `public/manus-routes.json`: complete direct-route manifest.
- `README.md` / `TODO.md`: setup and acceptance evidence.

## Delivery
Run diagnostics, `npm ci && npm run build`, verify direct route responses and the route manifest, checkpoint to canonical `main`, and publish only after the configured static build contract is valid. No real backend, auth, payments, live provider feeds, or secrets are required for this prototype.


## Cinematic system adaptation
- Preserve VOLTERRA's EV service architecture and all existing direct routes while giving the home route a more theatrical, editorial layer inspired by the new brief.
- Add a 3D Rolodex-style `cube-wrapper` hero module inside the EV hero: four image-backed faces for charge, road, rentals, and care; `perspective: 2000px`, `transform-style: preserve-3d`, CSS `rotateX` animation, and reduced-motion fallback.
- Add a full-width EV case-study/journey grid with a featured journey and two supporting stories, macOS-style traffic-light controls, grayscale-to-color hover, glass borders, and uppercase editorial labels.
- Add an illustrative Ownership Plans section with three tiers adapted to EV support, a centered highlighted Growth plan, purple glow, glass side cards, an explicit demo-pricing label, and an interactive range calculator that updates the estimate as the user changes monthly active-service units.
- Scope the new black/cyan/pink/purple cinematic tokens to the homepage modules so the existing warm-white service pages and readable forms remain coherent and usable.
- Keep the fixed mix-blend-difference navigation, existing generated EV imagery, localStorage request flows, route manifest, build contract, and demo disclaimers intact.


## Working motion layer
- Add a local H.264 MP4 hero loop at `/media/volterra-journey-loop.mp4`, assembled from the approved VOLTERRA EV imagery with subtle camera movement and no audio so autoplay is reliable in Preview.
- Wire the video with `autoplay`, `muted`, `loop`, `playsInline`, a poster fallback, an accessible Pause/Play Motion control, and a reduced-motion fallback that hides the video and restores the still image.
- Credit the work visibly as `DESIGNED BY LESLIE K CHIBUMBA` in the hero metadata and footer.


## India-first localization
- Keep the homepage as the complete all-services experience and localize its default discovery context to India, with Bengaluru as the starting city and an explicit India demo-network label.
- Replace US city defaults and provider examples with Indian city examples including Bengaluru, Mumbai, Pune, Delhi NCR, and Hyderabad; use kilometres for distances and EV ranges.
- Convert demonstrative rental pricing and ownership-plan pricing to Indian rupees, including INR/day vehicle cards and illustrative ₹2,499 / ₹6,999 monthly ownership tiers; keep all pricing clearly marked as demo-only.


## Public homepage and verification gate

The homepage at `/` remains publicly viewable and contains the complete service overview and India-localized demo content. Every other customer/admin feature route is protected by a local demo account gate. Visitors enter an email address or Indian phone number, receive a generated six-digit preview code shown in the UI, verify it, and then browse the full platform. The verified demo session persists in browser localStorage; real SMS/email delivery and production authentication are intentionally not claimed.
