# VOLTERRA acceptance checklist

## Shared platform shell
- [x] Preserve the premium VOLTERRA identity: Graphite `#101110`, near-black `#080909`, warm white `#F6F6F2`, soft grey `#A4A7A3`, electric lime `#C8F169`, bold modern typography, cinematic imagery, restrained animation, generous spacing, shared navigation/footer, and responsive behavior.
- [x] Add direct, meaningful routes for `/`, `/services`, `/roadside-assistance`, `/charging`, `/rentals`, `/maintenance`, `/trip-planner`, `/my-garage`, `/about`, `/contact`, `/admin`, and `/sign-in`; keep `/garage` as a backwards-compatible alias.
- [x] Keep navigation and CTA controls working across desktop, tablet, and mobile, including a working mobile menu and prominent SOS action.

## Home and service directory
- [x] Keep the landing hero headline “Your EV. Your journey. Covered.”, supporting copy, Explore Services and Get Roadside Help CTAs, quick actions, service overview, how-it-works, charging preview, rental showcase, values, final CTA, and footer.
- [x] Create a dedicated Services page with working cards and navigation to Roadside Assistance, Charging, EV Rentals, Maintenance, and Trip Planner.

## Dedicated service pages
- [x] Roadside Assistance uses the headline “Stranded? Let's get you moving.”, collects issue type, location, vehicle, contact, description, and consent, validates the request, shows a `Request received — demo` reference/status, explains the process, and never claims real dispatch.
- [x] Charging provides manual location search, charging/provider listings, connector/category filters, workshops, tyre/repair, towing, detailing, map placeholder, detail views, and clear illustrative/demo labels.
- [x] Rentals provides pickup location/date, return date, vehicle category filter, search, vehicle cards with image/model/seats/range/demo price, detail view, booking request form, confirmation reference/status, and date validation.
- [x] Maintenance provides the specified service categories plus vehicle/date/time/location/contact/notes booking form and demo appointment reference/status.
- [x] Trip Planner provides start, destination, optional range, charging-stop preference, illustrative route summary, distance/time, suggested stops, connector information, and no-telemetry disclaimer.

## Account, support, and operations
- [x] My Garage at `/my-garage` shows saved vehicles, SOS requests, rental requests/bookings, service appointments/history, saved charging stations, maintenance reminders, account settings, clear status labels, quick actions, localStorage persistence, and local-only/security disclaimer.
- [x] About explains VOLTERRA mission, problem, principles, and Services CTA without invented history, partnerships, certifications, or unsupported statistics.
- [x] Contact provides enquiry reason, name, email/contact, message, FAQs, service links, and an in-page confirmation without claiming an email was sent.
- [x] Admin remains a clearly labelled demo Operations Centre with overview cards, SOS/rental/service records, filters, detail/status controls, and no-secure-authentication/no-live-dispatch disclaimer.
- [x] Sign In provides email/password fields, sign-in, forgot-password, and create-account controls as a clearly labelled demo experience without claiming secure authentication.

## Connected demo behavior and quality
- [x] Preserve one connected demo data model so requests submitted from service pages appear in My Garage and Admin; persist records in browser-local storage.
- [x] Keep all simulated providers, prices, availability, route estimates, dispatch, payment, telemetry, and account/authentication claims clearly labelled as demo or illustrative.
- [x] Maintain accessible labels, keyboard focus states, Escape-close overlays, inline validation/errors/confirmations, reduced-motion support, responsive layouts, no horizontal overflow, and no dead controls.
- [x] Keep README setup/run instructions, synchronized `public/manus-routes.json`, and the static publish build contract current.
- [x] Run diagnostics, production build, direct route/manifest checks, read-only acceptance review, and canonical checkpoint before delivery; publication remains separately configured and was not requested for this handoff.


## Cinematic EV adaptation
- [x] Adapt the home hero with a fixed mix-blend-difference navigation, deep #050505 stage, oversized editorial background type, a 2000px-perspective four-face 3D cube using existing EV imagery, uppercase face labels, and a smooth infinite X-axis rotation with reduced-motion support.
- [x] Add an EV-adapted case-study/journey grid with one full-width featured journey, two supporting cards, macOS-style red/yellow/green window controls, 1px glass borders, and grayscale-to-color hover transitions.
- [x] Add an illustrative Ownership Plans/pricing section with Essential, Growth, and Command tiers; center-highlight the Growth tier; use a deep purple glow and glass side cards; clearly label all plan data as demo pricing.
- [x] Add a purple glassmorphism calculator with a custom range slider and dynamic estimate display based on active monthly EV services, with accessible labeling and reduced-motion-safe interaction.
- [x] Preserve all existing VOLTERRA service routes, request flows, localStorage records, demo-only disclaimers, build configuration, and direct-route manifest while applying the new visual language to the home experience.


## Working hero video
- [x] Serve a real local H.264 MP4 hero loop at `/media/volterra-journey-loop.mp4` with 1280×720 framing, 30fps, 9-second duration, `autoplay`, `muted`, `loop`, `playsInline`, poster fallback, an accessible Pause/Play Motion control, and reduced-motion fallback; visibly credit the work as `DESIGNED BY LESLIE K CHIBUMBA` in the hero and footer.


## India-first homepage localization
- [x] Keep the homepage as the full all-services experience and localize the demo context to India: Bengaluru defaults, Indian city/provider examples, kilometre units, Indian trip defaults, INR rental/day pricing, INR ownership-plan pricing, and clearly labelled illustrative/demo-only prices.


## Public homepage and verification access
- [x] Keep `/` publicly viewable with the complete homepage experience. Gate every other feature route behind a signup flow that accepts an email or Indian phone number, generates a six-digit preview verification code, verifies the entered code, persists the local demo session, and unlocks all VOLTERRA features afterward. Clearly disclose that the code is shown in Preview rather than delivered by a real SMS/email provider.
