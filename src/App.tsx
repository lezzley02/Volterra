import { useEffect, useMemo, useRef, useState, type Dispatch, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type SetStateAction } from 'react'
import {
  ArrowUpRight, BatteryCharging, CalendarDays, CarFront, Check, ChevronDown, ChevronRight, CircleHelp,
  Compass, Gauge, Grid2X2, HeartPulse, LocateFixed, MapPin, Menu, MessageSquareText, Navigation,
  PanelTop, Route, Search, Settings2, ShieldCheck, Sparkles, Timer, Wrench, X, Zap,
} from 'lucide-react'
import { benefits, CHARGE_IMAGE, HERO_IMAGE, RENTAL_IMAGE, serviceCategories, stations, vehicles } from './data'
import { loadState, makeReference } from './storage'
import type { GarageState, ModalType, ServiceAppointment, Station, Status, Vehicle } from './types'

const navItems = [
  ['Home', '/'], ['Services', '/services'], ['Charging', '/charging'], ['EV Rentals', '/rentals'], ['Trip Planner', '/trip-planner'], ['About', '/about'],
] as const

const customerPaths = ['/', '/services', '/roadside-assistance', '/charging', '/rentals', '/maintenance', '/trip-planner', '/my-garage', '/garage', '/about', '/contact', '/sign-in', '/admin']
const protectedPaths = customerPaths.filter(route => route !== '/' && route !== '/sign-in')
const routeTitles: Record<string, string> = {
  '/': 'VOLTERRA — EV Mobility & Ownership Platform', '/services': 'Services — VOLTERRA', '/roadside-assistance': 'Roadside Assistance — VOLTERRA',
  '/charging': 'Charging & Nearby Services — VOLTERRA', '/rentals': 'EV Rentals — VOLTERRA', '/maintenance': 'Maintenance & Repairs — VOLTERRA',
  '/trip-planner': 'EV Trip Planner — VOLTERRA', '/my-garage': 'My Garage — VOLTERRA', '/garage': 'My Garage — VOLTERRA',
  '/about': 'About VOLTERRA', '/contact': 'Contact & Support — VOLTERRA', '/admin': 'Admin Operations Centre — VOLTERRA', '/sign-in': 'Sign In — VOLTERRA',
}

type Confirmation = { kind: string; id: string; status: Status }

type AdminRecord = { kind: 'SOS' | 'Rental' | 'Service'; id: string; label: string; detail: string; status: Status; createdAt: string }

const statusClass = (status: string) => status.toLowerCase().replaceAll(' ', '-')

export default function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [state, setState] = useState<GarageState>(() => loadState())
  const [session, setSession] = useState<{ contact: string } | null>(() => {
    try { const raw = localStorage.getItem('volterra-demo-session-v1'); return raw ? JSON.parse(raw) : null } catch { return null }
  })
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedStation, setSelectedStation] = useState<(typeof stations)[number] | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [toast, setToast] = useState('')
  const [chargingFilter, setChargingFilter] = useState('All')
  const [locationQuery, setLocationQuery] = useState('Bengaluru')
  const [rentalQuery, setRentalQuery] = useState({ pickup: 'Bengaluru', pickupDate: '', returnDate: '', category: 'Any vehicle' })
  const [sosForm, setSosForm] = useState({ type: 'Low battery or stranded vehicle', location: '', vehicle: '', contact: '', description: '', consent: false })
  const [serviceForm, setServiceForm] = useState({ vehicle: '', category: serviceCategories[0], date: '', time: '09:00', location: '', contact: '', notes: '' })
  const [rentalForm, setRentalForm] = useState({ renter: '', contact: '', pickup: 'Bengaluru', pickupDate: '', returnDate: '' })
  const [tripForm, setTripForm] = useState({ start: 'Bengaluru, Karnataka', destination: '', range: '450', stops: 'Fastest route' })
  const [tripResult, setTripResult] = useState(false)
  const [formError, setFormError] = useState('')
  const [videoPlaying, setVideoPlaying] = useState(true)
  const heroVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    document.title = routeTitles[path] || 'VOLTERRA — EV Mobility & Ownership Platform'
  }, [path])

  useEffect(() => {
    try { localStorage.setItem('volterra-demo-state-v1', JSON.stringify(state)) } catch { /* optional persistence */ }
  }, [state])

  useEffect(() => {
    try {
      if (session) localStorage.setItem('volterra-demo-session-v1', JSON.stringify(session))
      else localStorage.removeItem('volterra-demo-session-v1')
    } catch { /* optional demo persistence */ }
  }, [session])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!activeModal && !confirmation) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveModal(null)
        setConfirmation(null)
        setFormError('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeModal, confirmation])

  const go = (nextPath: string) => {
    if (protectedPaths.includes(nextPath) && !session) {
      setToast('Create a demo account with your email or phone to unlock this feature.')
      nextPath = '/sign-in'
    }
    window.history.pushState({}, '', nextPath)
    window.dispatchEvent(new PopStateEvent('popstate'))
    setMobileMenu(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollTo = (id: string) => {
    const routeMap: Record<string, string> = { services: '/services', charging: '/charging', rentals: '/rentals', maintenance: '/maintenance', trip: '/trip-planner', about: '/about' }
    if (routeMap[id]) { go(routeMap[id]); return }
    if (path !== '/') { go('/'); window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80) }
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  const openModal = (modal: ModalType) => { setFormError(''); setActiveModal(modal) }
  const closeModal = () => { setFormError(''); setActiveModal(null) }
  const notify = (message: string) => setToast(message)
  const handleAuthenticated = (contact: string) => {
    setSession({ contact })
    notify('Demo account verified. All VOLTERRA features are now unlocked.')
    go('/')
  }
  const toggleHeroVideo = () => {
    const video = heroVideoRef.current
    if (!video) return
    if (video.paused) { void video.play(); setVideoPlaying(true) } else { video.pause(); setVideoPlaying(false) }
  }
  const addVehicle = () => setState(prev => {
    if (prev.savedVehicles.some(item => item.vehicleId === 'v2')) { notify('That demo vehicle is already in My Garage.'); return prev }
    notify('Lumen GT added to your local demo Garage.')
    return { ...prev, savedVehicles: [{ id: 'vehicle-demo-2', vehicleId: 'v2', name: 'Lumen GT', range: '462 km', addedAt: new Date().toISOString() }, ...prev.savedVehicles] }
  })
  const saveStation = (station: Station) => setState(prev => {
    if (prev.savedStations.some(item => item.id === station.id)) { notify('That demo provider is already saved.'); return prev }
    notify(`${station.name} saved to your local demo Garage.`)
    return { ...prev, savedStations: [{ ...station, savedAt: new Date().toISOString() }, ...prev.savedStations] }
  })

  const pageFrame = (content: ReactNode) => <div className="site-shell page-shell"><Header path={path} go={go} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} openSOS={() => session ? openModal('sos') : go('/sign-in')} /><main className="page-main">{content}</main><Footer go={go} scrollTo={scrollTo} notify={notify} /><OverlayLayer activeModal={activeModal} closeModal={closeModal} confirmation={confirmation} setConfirmation={setConfirmation} selectedVehicle={selectedVehicle} selectedStation={selectedStation} setSelectedVehicle={setSelectedVehicle} sosForm={sosForm} setSosForm={setSosForm} serviceForm={serviceForm} setServiceForm={setServiceForm} rentalForm={rentalForm} setRentalForm={setRentalForm} submitSOS={submitSOS} submitService={submitService} submitRental={submitRental} formError={formError} requestVehicle={requestVehicle} tripForm={tripForm} setTripForm={setTripForm} tripResult={tripResult} setTripResult={setTripResult} setFormError={setFormError} saveStation={saveStation} />{toast && <div className="toast"><Check size={15} /> {toast}</div>}</div>

  const submitSOS = (event: FormEvent) => {
    event.preventDefault()
    if (!sosForm.location || !sosForm.vehicle || !sosForm.contact || !sosForm.consent) {
      setFormError('Add your location, vehicle, contact details, and consent before submitting.')
      return
    }
    const id = makeReference('SOS')
    setState(prev => ({ ...prev, sos: [{ ...sosForm, id, status: 'Request Received', createdAt: new Date().toISOString() }, ...prev.sos] }))
    setConfirmation({ kind: 'Roadside request', id, status: 'Request Received' })
    closeModal()
    setSosForm({ type: 'Low battery or stranded vehicle', location: '', vehicle: '', contact: '', description: '', consent: false })
  }

  const validateDates = (pickupDate: string, returnDate: string) => {
    if (!pickupDate || !returnDate) return 'Choose both a pickup and return date.'
    if (returnDate < pickupDate) return 'Return date cannot be earlier than pickup date.'
    return ''
  }

  const searchRentals = (event: FormEvent) => {
    event.preventDefault()
    const error = validateDates(rentalQuery.pickupDate, rentalQuery.returnDate)
    if (error) { setFormError(error); return }
    scrollTo('rentals')
    notify(`Showing demo vehicles for ${rentalQuery.pickup}.`)
  }

  const openVehicle = (vehicle: Vehicle) => { setSelectedVehicle(vehicle); setRentalForm(prev => ({ ...prev, pickup: rentalQuery.pickup, pickupDate: rentalQuery.pickupDate, returnDate: rentalQuery.returnDate })); openModal('vehicle') }
  const requestVehicle = () => { setActiveModal('rental'); setFormError('') }

  const submitRental = (event: FormEvent) => {
    event.preventDefault()
    const error = validateDates(rentalForm.pickupDate, rentalForm.returnDate)
    if (error || !rentalForm.renter || !rentalForm.contact) { setFormError(error || 'Add your name and contact details to continue.'); return }
    const id = makeReference('RNT')
    setState(prev => ({ ...prev, rentals: [{ id, vehicle: selectedVehicle?.name || rentalQuery.category, pickup: rentalForm.pickup, pickupDate: rentalForm.pickupDate, returnDate: rentalForm.returnDate, renter: rentalForm.renter, contact: rentalForm.contact, status: 'Pending', createdAt: new Date().toISOString() }, ...prev.rentals] }))
    setConfirmation({ kind: 'Rental request', id, status: 'Pending' })
    closeModal()
    setSelectedVehicle(null)
    setRentalForm({ renter: '', contact: '', pickup: 'Bengaluru', pickupDate: '', returnDate: '' })
  }

  const submitService = (event: FormEvent) => {
    event.preventDefault()
    if (!serviceForm.vehicle || !serviceForm.date || !serviceForm.location || !serviceForm.contact) { setFormError('Add your vehicle, date, workshop location, and contact details.'); return }
    const id = makeReference('SRV')
    const appointment: ServiceAppointment = { ...serviceForm, id, status: 'Pending', createdAt: new Date().toISOString() }
    setState(prev => ({ ...prev, appointments: [appointment, ...prev.appointments] }))
    setConfirmation({ kind: 'Service appointment', id, status: 'Pending' })
    closeModal()
    setServiceForm({ vehicle: '', category: serviceCategories[0], date: '', time: '09:00', location: '', contact: '', notes: '' })
  }

  const filteredStations = useMemo(() => stations.filter(station => chargingFilter === 'All' ? true : chargingFilter === 'CCS' ? Boolean(station.connector?.includes('CCS')) : station.category === chargingFilter), [chargingFilter])

  if (protectedPaths.includes(path) && !session) return pageFrame(<SignInPage notify={notify} onAuthenticated={handleAuthenticated} gated />)
  if (path === '/services') return pageFrame(<ServicesPage go={go} />)
  if (path === '/roadside-assistance') return pageFrame(<RoadsidePage form={sosForm} setForm={setSosForm} submit={submitSOS} error={formError} go={go} />)
  if (path === '/charging') return pageFrame(<ChargingPage stations={filteredStations} locationQuery={locationQuery} setLocationQuery={setLocationQuery} chargingFilter={chargingFilter} setChargingFilter={setChargingFilter} notify={notify} openStation={(station) => { setSelectedStation(station); openModal('station') }} go={go} />)
  if (path === '/rentals') return pageFrame(<RentalsPage rentalQuery={rentalQuery} setRentalQuery={setRentalQuery} searchRentals={searchRentals} formError={formError} openVehicle={openVehicle} go={go} />)
  if (path === '/maintenance') return pageFrame(<MaintenancePage form={serviceForm} setForm={setServiceForm} submit={submitService} error={formError} />)
  if (path === '/trip-planner') return pageFrame(<TripPlannerPage form={tripForm} setForm={setTripForm} result={tripResult} setResult={setTripResult} error={formError} setError={setFormError} />)
  if (path === '/my-garage' || path === '/garage') return pageFrame(<GarageView state={state} go={go} openSOS={() => openModal('sos')} openService={() => openModal('service')} scrollTo={scrollTo} notify={notify} onAddVehicle={addVehicle} />)
  if (path === '/about') return pageFrame(<AboutPage go={go} />)
  if (path === '/contact') return pageFrame(<ContactPage go={go} notify={notify} />)
  if (path === '/sign-in') return pageFrame(<SignInPage notify={notify} onAuthenticated={handleAuthenticated} />)
  if (path === '/admin') return pageFrame(<AdminView state={state} setState={setState} go={go} />)
  if (!customerPaths.includes(path)) return pageFrame(<NotFoundPage go={go} />)

  return <div className="site-shell">
    <Header path={path} go={go} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} openSOS={() => session ? openModal('sos') : go('/sign-in')} />
    <main>
      <section className="hero cinematic-hero" aria-labelledby="hero-title">
        <video ref={heroVideoRef} className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={HERO_IMAGE} aria-label="VOLTERRA cinematic EV journey video"><source src="/media/volterra-journey-loop.mp4" type="video/mp4" /></video>
        <div className="hero-image" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="hero-grid" /><div className="hero-bg-type" aria-hidden="true">VOLTERRA</div><JourneyCube />
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> INDIA EV OWNERSHIP PLATFORM / DEMO</div>
          <h1 id="hero-title">Your EV.<br /><em>Your journey.</em><br />Covered.</h1>
          <p>Charging, roadside assistance, rentals and expert care. Everything your electric drive needs, brought together in one seamless platform.</p>
          <div className="hero-actions"><button className="button button-primary" onClick={() => scrollTo('services')}>Explore Services <ArrowUpRight size={16} /></button><button className="button button-ghost" onClick={() => go('/roadside-assistance')}>Get Roadside Help <ShieldCheck size={16} /></button></div>
          <div className="hero-note"><span>01</span> One platform. Every part of the journey.</div>
        </div>
        <div className="hero-meta"><span>VOLTERRA / 001</span><span className="design-credit">DESIGNED BY LESLIE K CHIBUMBA</span><span>INDIA DEMO NETWORK / STATUS: SIMULATED</span><button className="video-toggle" onClick={toggleHeroVideo} aria-pressed={videoPlaying}>{videoPlaying ? 'Pause motion' : 'Play motion'}</button><span className="scroll-cue">Scroll to move <ChevronDown size={14} /></span></div>
      </section>

      <section className="quick-actions section-pad" aria-label="Quick actions">
        <div className="section-kicker"><span>START HERE</span><span className="line" /><span>04 / 04</span></div>
        <div className="quick-grid">
          <QuickCard icon={<ShieldCheck />} number="01" title="Roadside SOS" description="Need help with your EV right now?" action="Request Assistance" onClick={() => go('/roadside-assistance')} accent="lime" />
          <QuickCard icon={<LocateFixed />} number="02" title="Find Charging" description="Discover stations and useful EV stops." action="Find Chargers" onClick={() => go('/charging')} />
          <QuickCard icon={<CarFront />} number="03" title="EV Rentals" description="Find an electric vehicle for your next journey." action="Explore Rentals" onClick={() => go('/rentals')} />
          <QuickCard icon={<Wrench />} number="04" title="Book a Service" description="Keep your EV running at its best." action="Book Service" onClick={() => go('/maintenance')} />
        </div>
      </section>

      <JourneyStories />

      <section className="intro section-pad" id="services">
        <div className="section-kicker"><span>THE PLATFORM</span><span className="line" /><span>01 — 05</span></div>
        <div className="intro-grid"><h2>Everything your EV needs.<br /><span>One destination.</span></h2><p>From everyday maintenance to unexpected roadside problems, VOLTERRA helps you manage more of your electric driving experience in one place.</p></div>
        <div className="service-grid">
          <ServiceCard index="01" icon={<ShieldCheck />} title="Roadside Assistance" text="Battery-related emergencies, breakdown support, flat tyres, lockouts, and EV-compatible towing." onClick={() => go('/roadside-assistance')} />
          <ServiceCard index="02" icon={<Zap />} title="Charging Network" text="Discover stations, review connector compatibility, and plan charging stops." onClick={() => go('/charging')} />
          <ServiceCard index="03" icon={<CarFront />} title="EV Rentals" text="Browse electric vehicles, compare options, and submit rental requests." onClick={() => go('/rentals')} />
          <ServiceCard index="04" icon={<Wrench />} title="Maintenance & Repairs" text="Book inspections, diagnostics, battery health checks, tyre services, and detailing." onClick={() => go('/maintenance')} />
          <ServiceCard index="05" icon={<Route />} title="EV Trip Planner" text="Plan journeys, estimate travel distances, and explore potential charging stops." onClick={() => go('/trip-planner')} wide />
        </div>
      </section>

      <section className="how section-pad dark-panel"><div className="section-kicker"><span>THE FLOW</span><span className="line" /><span>03 STEPS</span></div><div className="how-heading"><h2>Your EV life.<br /><span>Simplified.</span></h2><div className="route-mark">V<span />L<span />T</div></div><div className="steps"><Step number="01" title="Choose your service" text="Select charging, roadside help, rentals, maintenance, or trip planning." /><Step number="02" title="Tell us what you need" text="Provide your vehicle details, location, dates, or service preferences." /><Step number="03" title="Stay in control" text="Track demo requests, review bookings, and manage vehicle information through My Garage." /></div></section>

      <OwnershipPlans />

      <section className="charging section-pad" id="charging"><div className="section-kicker"><span>DEMO NETWORK</span><span className="line" /><span>ILLUSTRATIVE RESULTS</span></div><div className="split-heading"><h2>Find the next<br /><span>good stop.</span></h2><div><p>Explore charging and EV services around a manual location. These are illustrative demo results, not live availability.</p><button className="text-button" onClick={() => go('/trip-planner')}>Plan a route <ArrowUpRight size={15} /></button></div></div><div className="charging-layout"><div className="map-panel" style={{ backgroundImage: `url(${CHARGE_IMAGE})` }}><div className="map-overlay"><div className="map-label"><Navigation size={13} /> DEMO MAP / {locationQuery || 'SEARCH AREA'}</div><div className="map-pin pin-one"><span /></div><div className="map-pin pin-two"><span /></div><div className="map-pin pin-three"><span /></div><div className="map-route" /></div><div className="map-footer"><span><span className="live-dot lime" /> Demo network layer</span><span>Location permission optional</span></div></div><div className="station-panel"><div className="station-search"><Search size={16} /><input aria-label="Search by city or location" value={locationQuery} onChange={e => setLocationQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && notify(`Demo results updated for ${locationQuery}.`)} /><button onClick={() => notify(`Demo results updated for ${locationQuery}.`)}>Search</button></div><div className="filter-row">{['All', 'Charging station', 'EV workshop', 'Tyre & repair', 'Towing', 'Detailing', 'CCS'].map(filter => <button key={filter} className={chargingFilter === filter ? 'active' : ''} onClick={() => setChargingFilter(filter)}>{filter}</button>)}</div><div className="station-list">{filteredStations.map((station, index) => <button className="station-item" key={station.id} onClick={() => { setSelectedStation(station); openModal('station') }}><span className="station-index">0{index + 1}</span><span className="station-main"><strong>{station.name}</strong><small>{station.category} · {station.distance} illustrative</small></span><span className="station-state">{station.connector || 'SERVICE'}<ChevronRight size={15} /></span></button>)}</div></div></div></section>

      <section className="rentals section-pad" id="rentals"><div className="section-kicker"><span>DEMO FLEET</span><span className="line" /><span>NO PAYMENT REQUIRED</span></div><div className="split-heading"><h2>Your next electric<br /><span>drive starts here.</span></h2><div><p>Curated sample vehicles, demonstrative pricing, and a lightweight request flow for your next journey.</p><span className="demo-pill"><Sparkles size={14} /> Demonstration inventory</span></div></div><form className="rental-search" onSubmit={searchRentals}><div><label>Pickup location</label><input value={rentalQuery.pickup} onChange={e => setRentalQuery({ ...rentalQuery, pickup: e.target.value })} placeholder="City or location" /></div><div><label>Pickup date</label><input type="date" value={rentalQuery.pickupDate} onChange={e => setRentalQuery({ ...rentalQuery, pickupDate: e.target.value })} /></div><div><label>Return date</label><input type="date" value={rentalQuery.returnDate} onChange={e => setRentalQuery({ ...rentalQuery, returnDate: e.target.value })} /></div><div><label>Vehicle preference</label><select value={rentalQuery.category} onChange={e => setRentalQuery({ ...rentalQuery, category: e.target.value })}><option>Any vehicle</option><option>Premium crossover</option><option>Performance sedan</option><option>Urban hatch</option></select></div><button className="button button-primary" type="submit">Search fleet <Search size={15} /></button></form>{formError && <div className="inline-error">{formError}</div>}<div className="vehicle-grid">{vehicles.filter(vehicle => rentalQuery.category === 'Any vehicle' || vehicle.category === rentalQuery.category).map(vehicle => <button className="vehicle-card" key={vehicle.id} onClick={() => openVehicle(vehicle)}><div className="vehicle-image" style={{ backgroundImage: `url(${vehicle.image})` }}><span>DEMO VEHICLE</span><ArrowUpRight /></div><div className="vehicle-copy"><div><h3>{vehicle.name}</h3><p>{vehicle.category}</p></div><strong>₹{vehicle.price}<small>/ day</small></strong></div><div className="vehicle-specs"><span><CarFront size={14} /> {vehicle.seats} seats</span><span><BatteryCharging size={14} /> {vehicle.range}</span><span>View vehicle <ChevronRight size={14} /></span></div></button>)}</div></section>

      <section className="care section-pad dark-panel" id="about"><div className="section-kicker"><span>OWNERSHIP CARE</span><span className="line" /><span>KEEP MOVING</span></div><div className="care-grid"><div><h2>Care that keeps<br /><span>you moving.</span></h2><p>Expert support for the moments that keep your EV at its best — from routine checks to battery confidence.</p><button className="button button-primary" onClick={() => go('/maintenance')}>Book a service <ArrowUpRight size={15} /></button></div><div className="care-list">{['Routine inspections', 'EV diagnostics', 'Battery health checks', 'Tyre replacement and alignment', 'Brakes and suspension', 'Detailing', 'General repairs'].map((item, index) => <button key={item} onClick={() => go('/maintenance')}><span>0{index + 1}</span>{item}<ArrowUpRight size={14} /></button>)}</div></div></section>

      <section className="values section-pad"><div className="section-kicker"><span>OUR POINT OF VIEW</span><span className="line" /><span>DESIGNED FOR THE ELECTRIC ERA</span></div><div className="values-heading"><h2>More calm.<br /><span>More control.</span></h2><p>VOLTERRA is the composed layer between your plans and the road ahead.</p></div><div className="benefits-grid">{benefits.map(([number, title, text]) => <div className="benefit" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>

      <section className="trip-section section-pad" id="trip"><div className="trip-banner"><div><div className="eyebrow">TRIP PLANNER / ESTIMATES ONLY</div><h2>Put some distance<br /><em>between you and ordinary.</em></h2><p>Build an illustrative route with potential charging stops. Results are estimates, not guaranteed navigation or battery telemetry.</p><button className="button button-light" onClick={() => go('/trip-planner')}>Plan a journey <Route size={16} /></button></div><div className="trip-orbit"><div className="orbit-ring ring-a" /><div className="orbit-ring ring-b" /><div className="orbit-core"><Navigation size={28} /></div></div></div></section>

      <section className="closing section-pad"><div className="closing-image" style={{ backgroundImage: `url(${HERO_IMAGE})` }} /><div className="closing-content"><div className="eyebrow"><span className="live-dot" /> ALWAYS MOVING</div><h2>Keep moving.<br /><span>We'll help with the rest.</span></h2><p>Your electric journey deserves a smarter support system.</p><div className="hero-actions"><button className="button button-primary" onClick={() => scrollTo('services')}>Explore Services <ArrowUpRight size={16} /></button><button className="button button-ghost" onClick={() => go('/garage')}>Open My Garage <Grid2X2 size={16} /></button></div></div></section>
    </main>
    <Footer go={go} scrollTo={scrollTo} notify={notify} />
    <OverlayLayer activeModal={activeModal} closeModal={closeModal} confirmation={confirmation} setConfirmation={setConfirmation} selectedVehicle={selectedVehicle} selectedStation={selectedStation} setSelectedVehicle={setSelectedVehicle} sosForm={sosForm} setSosForm={setSosForm} serviceForm={serviceForm} setServiceForm={setServiceForm} rentalForm={rentalForm} setRentalForm={setRentalForm} submitSOS={submitSOS} submitService={submitService} submitRental={submitRental} formError={formError} requestVehicle={requestVehicle} tripForm={tripForm} setTripForm={setTripForm} tripResult={tripResult} setTripResult={setTripResult} setFormError={setFormError} saveStation={saveStation} />
    {toast && <div className="toast"><Check size={15} /> {toast}</div>}
  </div>
}

function Header({ path, go, mobileMenu, setMobileMenu, openSOS }: { path: string; go: (path: string) => void; mobileMenu: boolean; setMobileMenu: (value: boolean) => void; openSOS: () => void }) {
  return <header className={`topbar ${mobileMenu ? 'menu-open' : ''}`}><button className="brand" onClick={() => go('/')} aria-label="VOLTERRA home"><span className="brand-mark"><span /><span /></span><span>VOLTERRA</span></button><nav className="desktop-nav">{navItems.map(([label, route]) => <button key={route} className={path === route ? 'active' : ''} onClick={() => go(route)}>{label}</button>)}</nav><div className="nav-actions"><button className="garage-link" onClick={() => go('/my-garage')}>My Garage <Grid2X2 size={14} /></button><button className="sos-button" onClick={openSOS}><span className="pulse-ring" /> Roadside SOS</button><button className="menu-trigger" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu} aria-label="Toggle navigation menu">{mobileMenu ? <X /> : <Menu />}</button></div>{mobileMenu && <div className="mobile-nav">{navItems.map(([label, route]) => <button key={route} onClick={() => go(route)}>{label}<ArrowUpRight size={15} /></button>)}<button onClick={() => go('/my-garage')}>My Garage <Grid2X2 size={15} /></button><button className="mobile-sos" onClick={openSOS}>Roadside SOS <ShieldCheck size={15} /></button></div>}</header>
}

function QuickCard({ icon, number, title, description, action, onClick, accent }: { icon: ReactNode; number: string; title: string; description: string; action: string; onClick: () => void; accent?: string }) {
  return <button className={`quick-card ${accent || ''}`} onClick={onClick}><div className="card-top"><span className="quick-icon">{icon}</span><span>{number}</span></div><div><h3>{title}</h3><p>{description}</p></div><span className="card-action">{action} <ArrowUpRight size={15} /></span></button>
}

function ServiceCard({ index, icon, title, text, onClick, wide }: { index: string; icon: ReactNode; title: string; text: string; onClick: () => void; wide?: boolean }) {
  return <button className={`service-card ${wide ? 'wide' : ''}`} onClick={onClick}><div className="service-card-top"><span>{index}</span><span className="service-icon">{icon}</span></div><h3>{title}</h3><p>{text}</p><span className="card-action">Explore <ArrowUpRight size={15} /></span></button>
}

function Step({ number, title, text }: { number: string; title: string; text: string }) { return <div className="step"><span className="step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><ChevronRight className="step-arrow" /></div> }

function Footer({ go, scrollTo, notify }: { go: (path: string) => void; scrollTo: (id: string) => void; notify: (message: string) => void }) {
  return <footer className="footer section-pad"><div className="footer-main"><div><button className="brand footer-brand" onClick={() => go('/')}><span className="brand-mark"><span /><span /></span><span>VOLTERRA</span></button><p>Your EV, always moving.</p><span className="footer-status"><span className="live-dot lime" /> DEMO NETWORK / ONLINE</span></div><div className="footer-links"><div><span>Explore</span><button onClick={() => go('/services')}>Services</button><button onClick={() => go('/charging')}>Charging</button><button onClick={() => go('/rentals')}>EV Rentals</button><button onClick={() => go('/maintenance')}>Maintenance</button><button onClick={() => go('/trip-planner')}>Trip Planner</button><button onClick={() => go('/about')}>About</button></div><div><span>Support</span><button onClick={() => go('/my-garage')}>My Garage</button><button onClick={() => go('/contact')}>Contact</button><button onClick={() => notify('Privacy policy placeholder — connect a production policy before launch.')}>Privacy Policy</button><button onClick={() => notify('Terms placeholder — connect production terms before launch.')}>Terms of Service</button></div></div></div><div className="footer-bottom"><span>© 2026 VOLTERRA</span><span>DESIGNED BY LESLIE K CHIBUMBA</span><span>India-first EV services concept</span><p>Actual service availability depends on location and participating providers.</p></div></footer>
}

function GarageView({ state, go, openSOS, openService, scrollTo, notify, onAddVehicle }: { state: GarageState; go: (path: string) => void; openSOS: () => void; openService: () => void; scrollTo: (id: string) => void; notify: (message: string) => void; onAddVehicle: () => void }) {
  const total = state.sos.length + state.rentals.length + state.appointments.length
  return <main className="dashboard-page"><div className="dashboard-header section-pad"><div><button className="back-link" onClick={() => go('/')}><ChevronRight size={14} className="rotate-180" /> Back to platform</button><div className="eyebrow">MY GARAGE / LOCAL DEMO PROFILE</div><h1>The calm side<br /><span>of ownership.</span></h1><p>Requests, appointments and vehicles in one clear view. Stored locally in this browser for demonstration only.</p></div><div className="dashboard-actions"><button className="button button-primary" onClick={openSOS}>Request Assistance <ShieldCheck size={15} /></button><button className="button button-outline" onClick={openService}>Book a Service <Wrench size={15} /></button><button className="button button-outline" onClick={() => go('/charging')}>Find Charging <LocateFixed size={15} /></button><button className="button button-outline" onClick={() => go('/rentals')}>Browse Rentals <CarFront size={15} /></button></div></div><section className="metrics section-pad"><Metric label="Open requests" value={String(total).padStart(2, '0')} icon={<ActivityIcon />} /><Metric label="Saved vehicles" value={String(state.savedVehicles.length).padStart(2, '0')} icon={<CarFront />} /><Metric label="Next reminder" value="14d" icon={<Timer />} /><Metric label="Profile state" value="DEMO" icon={<Settings2 />} /></section><div className="dashboard-grid section-pad"><div className="dashboard-column"><DashboardSection title="Activity timeline" eyebrow="REQUESTS & BOOKINGS">{total === 0 ? <EmptyState title="Nothing here yet" text="When you submit a demo request, it will appear here with a reference and status." action="Explore services" onClick={() => scrollTo('services')} /> : <>{state.sos.map(item => <RecordRow key={item.id} icon={<ShieldCheck />} label="Roadside SOS" title={item.type} detail={`${item.location} · ${item.vehicle}`} status={item.status} reference={item.id} />)}{state.rentals.map(item => <RecordRow key={item.id} icon={<CarFront />} label="Rental request" title={item.vehicle} detail={`${item.pickup} · ${item.pickupDate} → ${item.returnDate}`} status={item.status} reference={item.id} />)}{state.appointments.map(item => <RecordRow key={item.id} icon={<Wrench />} label="Service appointment" title={item.category} detail={`${item.vehicle} · ${item.date} at ${item.time}`} status={item.status} reference={item.id} />)}</>}</DashboardSection><DashboardSection title="Service history" eyebrow="A QUIET RECORD"><EmptyState title="No completed services" text="Your completed service records will settle here after a provider flow is connected." action="Book a service" onClick={openService} /></DashboardSection></div><div className="dashboard-column"><DashboardSection title="Saved vehicles" eyebrow="YOUR ELECTRIC DRIVE">{state.savedVehicles.map(vehicle => <div className="saved-vehicle" key={vehicle.id}><div className="saved-vehicle-icon"><BatteryCharging /></div><div><strong>{vehicle.name}</strong><span>{vehicle.range} · Local demo profile with care reminders.</span></div></div>)}<button className="button button-outline garage-add-vehicle" onClick={onAddVehicle}>Add vehicle <ArrowUpRight size={14} /></button></DashboardSection><DashboardSection title="Saved places" eyebrow="READY WHEN YOU ARE">{state.savedStations.length === 0 ? <EmptyState title="No saved providers" text="Save a station or workshop from the discovery layer to see it here." action="Find charging" onClick={() => go('/charging')} /> : state.savedStations.map(station => <div className="saved-place-row" key={station.id}><span className="saved-place-icon"><LocateFixed size={15} /></span><div><strong>{station.name}</strong><small>{station.category} · {station.distance} illustrative</small></div><span className="status confirmed">SAVED</span></div>)}</DashboardSection><DashboardSection title="Account settings" eyebrow="LOCAL DEMO ONLY"><button className="settings-row settings-button" onClick={() => notify('Preferences are a local demo placeholder.') }><span><Settings2 size={16} /> Preferences</span><ChevronRight size={16} /></button><button className="settings-row settings-button" onClick={() => notify('Notifications are a local demo placeholder.') }><span><MessageSquareText size={16} /> Notifications</span><ChevronRight size={16} /></button><DashboardSection title="Maintenance reminders" eyebrow="KEEP MOVING">{state.reminders.map(reminder => <div className="reminder-row" key={reminder.id}><span className="reminder-dot" /><div><strong>{reminder.title}</strong><small>{reminder.vehicle} · due in {reminder.due}</small></div></div>)}</DashboardSection><div className="settings-note">Local storage is not a secure account system or a replacement for a backend database.</div></DashboardSection></div></div></main>
}

function AdminView({ state, setState, go }: { state: GarageState; setState: Dispatch<SetStateAction<GarageState>>; go: (path: string) => void }) {
  const [filter, setFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const records: AdminRecord[] = [
    ...state.sos.map(item => ({ kind: 'SOS' as const, id: item.id, label: item.type, detail: `${item.location} · ${item.contact}`, status: item.status, createdAt: item.createdAt })),
    ...state.rentals.map(item => ({ kind: 'Rental' as const, id: item.id, label: item.vehicle, detail: `${item.renter} · ${item.pickupDate} → ${item.returnDate}`, status: item.status, createdAt: item.createdAt })),
    ...state.appointments.map(item => ({ kind: 'Service' as const, id: item.id, label: item.category, detail: `${item.vehicle} · ${item.date} at ${item.time}`, status: item.status, createdAt: item.createdAt })),
  ]
  const visibleRecords = records.filter(item => (filter === 'All' || item.kind === filter) && (statusFilter === 'All' || item.status === statusFilter))
  const totalRequests = records.length
  const completedRequests = records.filter(item => item.status === 'Completed').length
  const openRequests = records.filter(item => item.status !== 'Completed' && item.status !== 'Cancelled').length
  const completionRate = totalRequests ? Math.round((completedRequests / totalRequests) * 100) : 0
  const requestMix = [{ label: 'Roadside SOS', count: state.sos.length, color: 'lime' }, { label: 'EV rentals', count: state.rentals.length, color: 'cyan' }, { label: 'Maintenance', count: state.appointments.length, color: 'pink' }]
  const maxMix = Math.max(...requestMix.map(item => item.count), 1)
  const cityNames = ['Bengaluru', 'Mumbai', 'Pune', 'Delhi NCR', 'Hyderabad']
  const cityActivity = cityNames.map(city => ({ city, count: [...state.sos.map(item => item.location), ...state.rentals.map(item => item.pickup), ...state.appointments.map(item => item.location)].filter(value => value.toLowerCase().includes(city.toLowerCase())).length }))
  const updateStatus = (kind: AdminRecord['kind'], id: string, status: Status) => setState(prev => ({ ...prev, sos: prev.sos.map(item => item.id === id ? { ...item, status } : item), rentals: prev.rentals.map(item => item.id === id ? { ...item, status } : item), appointments: prev.appointments.map(item => item.id === id ? { ...item, status } : item) }))
  return <main className="admin-page"><div className="dashboard-header section-pad"><div><button className="back-link" onClick={() => go('/')}><ChevronRight size={14} className="rotate-180" /> Back to platform</button><div className="eyebrow"><span className="live-dot" /> PROTOTYPE / ADMIN OPERATIONS CENTRE</div><h1>See the whole<br /><span>road ahead.</span></h1><p>Statistics, service demand, city activity, and request operations in one local demo dashboard. It is not secure admin authentication and should not be used for real dispatch.</p></div><div className="admin-stamp">DEMO ONLY<br /><span>NO LIVE PROVIDERS</span></div></div><section className="admin-metrics section-pad"><Metric label="Open requests" value={String(openRequests).padStart(2, '0')} icon={<Gauge />} /><Metric label="Total requests" value={String(totalRequests).padStart(2, '0')} icon={<ActivityIcon />} /><Metric label="Completion rate" value={`${completionRate}%`} icon={<Check />} /><Metric label="Indian demo cities" value={String(cityActivity.filter(item => item.count > 0).length || 5).padStart(2, '0')} icon={<MapPin />} /></section><section className="admin-analytics section-pad"><div className="admin-analytics-head"><div><div className="eyebrow">PRODUCT ANALYTICS / LOCAL DEMO</div><h2>What is happening<br /><span>across the platform.</span></h2></div><div className="admin-period">ALL-TIME DEMO<br /><span>LOCAL BROWSER DATA</span></div></div><div className="analytics-grid"><article className="analytics-card analytics-card-wide"><div className="analytics-card-head"><span>REQUEST MIX</span><small>{totalRequests} total records</small></div><div className="analytics-bars">{requestMix.map(item => <div className="analytics-bar-row" key={item.label}><div><span>{item.label}</span><strong>{item.count}</strong></div><div className="analytics-track"><i className={item.color} style={{ width: `${Math.max(item.count / maxMix * 100, item.count ? 8 : 0)}%` }} /></div></div>)}</div></article><article className="analytics-card"><div className="analytics-card-head"><span>STATUS HEALTH</span><small>request lifecycle</small></div><div className="status-health"><strong>{completionRate}%</strong><span>completed or resolved</span><div className="health-track"><i style={{ width: `${completionRate}%` }} /></div><small>{openRequests} active · {records.filter(item => item.status === 'Cancelled').length} cancelled</small></div></article><article className="analytics-card"><div className="analytics-card-head"><span>INDIA ACTIVITY</span><small>location mentions</small></div><div className="city-list">{cityActivity.map(item => <div className="city-row" key={item.city}><span>{item.city}</span><strong>{item.count}</strong></div>)}</div></article><article className="analytics-card analytics-card-wide"><div className="analytics-card-head"><span>READOUT</span><small>operator notes</small></div><div className="analytics-readout"><div><strong>{state.savedVehicles.length}</strong><span>saved vehicles</span></div><div><strong>{state.savedStations.length}</strong><span>saved providers</span></div><div><strong>{state.reminders.length}</strong><span>active reminders</span></div><p>Use the request inbox below to update statuses. These analytics are derived from browser-local demo records and are not live traffic, revenue, provider, or customer analytics.</p></div></article></div></section><section className="admin-table-wrap section-pad"><div className="admin-toolbar"><div><div className="eyebrow">REQUEST INBOX</div><h2>Every request.<br /><span>Clear status.</span></h2></div><div className="admin-filters"><select value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>SOS</option><option>Rental</option><option>Service</option></select><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option><option>Pending</option><option>Request Received</option><option>Pending Assignment</option><option>Confirmed</option><option>In Progress</option><option>Completed</option></select></div></div>{visibleRecords.length === 0 ? <EmptyState title="Inbox is quiet" text="New demo requests from the customer experience will appear here." action="View platform" onClick={() => go('/')} /> : <div className="admin-table">{visibleRecords.map(record => <div className="admin-row" key={record.id}><div className="admin-type"><span className={`admin-type-icon ${record.kind.toLowerCase()}`}>{record.kind === 'SOS' ? <ShieldCheck size={16} /> : record.kind === 'Rental' ? <CarFront size={16} /> : <Wrench size={16} />}</span><div><strong>{record.label}</strong><span>{record.kind} · {record.id}</span></div></div><div className="admin-detail">{record.detail}</div><div><span className={`status ${statusClass(record.status)}`}>{record.status}</span></div><select className="status-select" value={record.status} onChange={e => updateStatus(record.kind, record.id, e.target.value as Status)}><option>Pending</option><option>Request Received</option><option>Pending Assignment</option><option>Confirmed</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select></div>)}</div>}</section></main>
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) { return <div className="metric"><span className="metric-icon">{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div> }
function ActivityIcon() { return <span className="activity-icon"><span /><span /><span /></span> }
function DashboardSection({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) { return <section className="dashboard-section"><div className="section-kicker"><span>{eyebrow}</span><span className="line" /><span>VIEW</span></div><h2>{title}</h2>{children}</section> }
function RecordRow({ icon, label, title, detail, status, reference }: { icon: ReactNode; label: string; title: string; detail: string; status: Status; reference: string }) { return <div className="record-row"><span className="record-icon">{icon}</span><div className="record-copy"><span>{label} · {reference}</span><strong>{title}</strong><small>{detail}</small></div><span className={`status ${statusClass(status)}`}>{status}</span></div> }
function EmptyState({ title, text, action, onClick }: { title: string; text: string; action: string; onClick: () => void }) { return <div className="empty-state"><span className="empty-mark"><CircleHelp size={20} /></span><h3>{title}</h3><p>{text}</p><button className="text-button" onClick={onClick}>{action} <ArrowUpRight size={14} /></button></div> }

function OverlayLayer(props: { activeModal: ModalType; closeModal: () => void; confirmation: Confirmation | null; setConfirmation: (value: Confirmation | null) => void; selectedVehicle: Vehicle | null; selectedStation: (typeof stations)[number] | null; setSelectedVehicle: (value: Vehicle | null) => void; sosForm: typeof defaultSos; setSosForm: Dispatch<SetStateAction<typeof defaultSos>>; serviceForm: typeof defaultService; setServiceForm: Dispatch<SetStateAction<typeof defaultService>>; rentalForm: typeof defaultRental; setRentalForm: Dispatch<SetStateAction<typeof defaultRental>>; submitSOS: (event: FormEvent) => void; submitService: (event: FormEvent) => void; submitRental: (event: FormEvent) => void; formError: string; requestVehicle: () => void; saveStation: (station: Station) => void; tripForm: typeof defaultTrip; setTripForm: Dispatch<SetStateAction<typeof defaultTrip>>; tripResult: boolean; setTripResult: (value: boolean) => void; setFormError: (value: string) => void }) {
  const { activeModal, closeModal, confirmation, setConfirmation, selectedVehicle, selectedStation, setSelectedVehicle, sosForm, setSosForm, serviceForm, setServiceForm, rentalForm, setRentalForm, submitSOS, submitService, submitRental, formError, requestVehicle, saveStation, tripForm, setTripForm, tripResult, setTripResult, setFormError } = props
  const dialogRef = useRef<HTMLDivElement>(null)
  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')).filter(item => !item.hasAttribute('disabled'))
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return <>{activeModal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && closeModal()}><div ref={dialogRef} tabIndex={-1} onKeyDown={trapFocus} className="modal" role="dialog" aria-modal="true" aria-label={activeModal === 'sos' ? 'Roadside SOS request' : activeModal === 'service' ? 'Book a service' : activeModal === 'rental' ? 'Rental request' : activeModal === 'trip' ? 'Trip planner' : 'Details'}><button autoFocus className="modal-close" onClick={closeModal} aria-label="Close dialog"><X size={18} /></button>{activeModal === 'sos' && <SOSForm form={sosForm} setForm={setSosForm} submit={submitSOS} error={formError} />}{activeModal === 'service' && <ServiceForm form={serviceForm} setForm={setServiceForm} submit={submitService} error={formError} />}{activeModal === 'vehicle' && selectedVehicle && <VehicleDetail vehicle={selectedVehicle} onRequest={requestVehicle} onClose={() => { setSelectedVehicle(null); closeModal() }} />}{activeModal === 'rental' && <RentalForm vehicle={selectedVehicle} form={rentalForm} setForm={setRentalForm} submit={submitRental} error={formError} />}{activeModal === 'station' && selectedStation && <StationDetail station={selectedStation} onSave={() => { saveStation(selectedStation); closeModal() }} />}{activeModal === 'trip' && <TripForm form={tripForm} setForm={setTripForm} result={tripResult} setResult={setTripResult} error={formError} setError={setFormError} />}</div></div>}{confirmation && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setConfirmation(null)}><div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" tabIndex={-1}><div className="confirmation-mark"><Check size={28} /></div><div className="eyebrow">DEMO REQUEST RECORDED</div><h2 id="confirmation-title">You're still<br /><span>in control.</span></h2><p>Your {confirmation.kind.toLowerCase()} has been added to My Garage with a simulated status. No provider has been dispatched.</p><div className="confirmation-id"><span>REFERENCE</span><strong>{confirmation.id}</strong><span className={`status ${statusClass(confirmation.status)}`}>{confirmation.status}</span></div><div className="confirmation-actions"><button className="button button-primary" onClick={() => setConfirmation(null)}>Done <Check size={15} /></button><button className="button button-outline" onClick={() => { setConfirmation(null); window.history.pushState({}, '', '/garage'); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0) }}>Open My Garage <Grid2X2 size={15} /></button></div></div></div>}</>
}

const defaultSos = { type: 'Low battery or stranded vehicle', location: '', vehicle: '', contact: '', description: '', consent: false }
const defaultService = { vehicle: '', category: serviceCategories[0], date: '', time: '09:00', location: '', contact: '', notes: '' }
const defaultRental = { renter: '', contact: '', pickup: 'Bengaluru', pickupDate: '', returnDate: '' }
const defaultTrip = { start: 'Bengaluru, Karnataka', destination: '', range: '450', stops: 'Fastest route' }

function ModalHead({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="modal-head"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{text}</p></div> }
function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) { return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label> }
function SOSForm({ form, setForm, submit, error }: { form: typeof defaultSos; setForm: React.Dispatch<React.SetStateAction<typeof defaultSos>>; submit: (event: FormEvent) => void; error: string }) { return <><ModalHead eyebrow="ROADSIDE SOS / SIMULATED" title="Let's get you moving." text="Submit a demo assistance request. This prototype records a request only — it does not dispatch a provider." /><form onSubmit={submit} className="modal-form"><Field label="Issue type"><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Low battery or stranded vehicle</option><option>Flat tyre</option><option>Vehicle breakdown</option><option>EV-compatible towing</option><option>Lockout</option><option>Other roadside issue</option></select></Field><Field label="Current location"><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Street, city or manual location" /></Field><Field label="Vehicle make and model"><input value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} placeholder="e.g. Arc One, 2025" /></Field><Field label="Contact details"><input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Phone or email" /></Field><Field label="What happened?" wide><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Add any useful context" /></Field><label className="consent"><input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} /><span>I understand this is a demonstration request and no real assistance will be dispatched.</span></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary form-submit" type="submit">Submit demo request <ShieldCheck size={16} /></button></form></> }
function ServiceForm({ form, setForm, submit, error }: { form: typeof defaultService; setForm: React.Dispatch<React.SetStateAction<typeof defaultService>>; submit: (event: FormEvent) => void; error: string }) { return <><ModalHead eyebrow="MAINTENANCE / DEMO APPOINTMENT" title="Care, scheduled." text="Choose a service and a preferred time. Availability is illustrative until provider integrations are connected." /><form onSubmit={submit} className="modal-form"><Field label="Vehicle"><input value={form.vehicle} onChange={e => setForm({ ...form, vehicle: e.target.value })} placeholder="e.g. Lumen GT" /></Field><Field label="Service category"><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{serviceCategories.map(item => <option key={item}>{item}</option>)}</select></Field><Field label="Preferred date"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field><Field label="Preferred time"><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></Field><Field label="Workshop or location"><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City or preferred workshop" /></Field><Field label="Contact details"><input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Phone or email" /></Field><Field label="Additional notes" wide><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Anything the workshop should know?" /></Field>{error && <div className="form-error">{error}</div>}<button className="button button-primary form-submit" type="submit">Book demo appointment <CalendarDays size={16} /></button></form></> }
function VehicleDetail({ vehicle, onRequest, onClose }: { vehicle: Vehicle; onRequest: () => void; onClose: () => void }) { return <div className="detail-modal"><div className="detail-image" style={{ backgroundImage: `url(${vehicle.image})` }}><span>DEMO VEHICLE</span></div><div className="detail-copy"><div className="eyebrow">{vehicle.category}</div><h2>{vehicle.name}</h2><p>{vehicle.description}</p><div className="detail-specs"><span><CarFront size={15} /> {vehicle.seats} seats</span><span><BatteryCharging size={15} /> {vehicle.range}</span><span><strong>₹{vehicle.price}</strong> / day</span></div><div className="detail-actions"><button className="button button-primary" onClick={onRequest}>Request this vehicle <ArrowUpRight size={15} /></button><button className="text-button" onClick={onClose}>Back to fleet</button></div></div></div> }
function RentalForm({ vehicle, form, setForm, submit, error }: { vehicle: Vehicle | null; form: typeof defaultRental; setForm: React.Dispatch<React.SetStateAction<typeof defaultRental>>; submit: (event: FormEvent) => void; error: string }) { return <><ModalHead eyebrow="EV RENTAL / DEMO REQUEST" title={vehicle ? `Request the ${vehicle.name}.` : 'Start your electric drive.'} text="No payment is taken. This prototype uses demonstration inventory and availability." /><form onSubmit={submit} className="modal-form"><Field label="Your name"><input value={form.renter} onChange={e => setForm({ ...form, renter: e.target.value })} placeholder="Full name" /></Field><Field label="Contact details"><input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Phone or email" /></Field><Field label="Pickup location"><input value={form.pickup} onChange={e => setForm({ ...form, pickup: e.target.value })} /></Field><Field label="Pickup date"><input type="date" value={form.pickupDate} onChange={e => setForm({ ...form, pickupDate: e.target.value })} /></Field><Field label="Return date"><input type="date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} /></Field>{error && <div className="form-error">{error}</div>}<button className="button button-primary form-submit" type="submit">Submit rental request <CarFront size={16} /></button></form></> }
function StationDetail({ station, onSave }: { station: (typeof stations)[number]; onSave: () => void }) { return <div className="station-detail"><div className="station-detail-icon"><LocateFixed size={28} /></div><div className="eyebrow">{station.category} / DEMO LISTING</div><h2>{station.name}</h2><p>{station.note}</p><div className="station-detail-grid"><span><small>Distance</small><strong>{station.distance} illustrative</strong></span><span><small>Connector</small><strong>{station.connector || 'Service listing'}</strong></span><span><small>Status</small><strong>{station.availability}</strong></span></div><div className="notice-box">Not live data. Verify provider details before relying on a real journey.</div><button className="button button-primary detail-save" onClick={onSave}>Save to My Garage <Grid2X2 size={15} /></button></div> }
function TripForm({ form, setForm, result, setResult, error, setError }: { form: typeof defaultTrip; setForm: React.Dispatch<React.SetStateAction<typeof defaultTrip>>; result: boolean; setResult: (value: boolean) => void; error: string; setError: (value: string) => void }) { return <><ModalHead eyebrow="TRIP PLANNER / ESTIMATES ONLY" title="Make a plan to move." text="Build an illustrative route. Distance, time, and charging stops are demo estimates — not guaranteed navigation or vehicle telemetry." /><form onSubmit={e => { e.preventDefault(); if (!form.start || !form.destination) { setError('Add a starting location and destination to estimate a route.'); return } setError(''); setResult(true) }} className="modal-form"><Field label="Starting location"><input value={form.start} onChange={e => { setForm({ ...form, start: e.target.value }); setResult(false); setError('') }} /></Field><Field label="Destination"><input value={form.destination} onChange={e => { setForm({ ...form, destination: e.target.value }); setResult(false); setError('') }} placeholder="Where are you going?" /></Field><Field label="Estimated driving range (km)"><input type="number" min="80" value={form.range} onChange={e => setForm({ ...form, range: e.target.value })} /></Field><Field label="Charging preference"><select value={form.stops} onChange={e => setForm({ ...form, stops: e.target.value })}><option>Fastest route</option><option>More charging options</option><option>Fewer stops</option></select></Field>{error && <div className="form-error">{error}</div>}<button className="button button-primary form-submit" type="submit">Estimate route <Route size={16} /></button></form>{result && <div className="trip-result"><div className="trip-result-head"><span className="live-dot lime" /> ILLUSTRATIVE ROUTE</div><strong>{form.start} → {form.destination}</strong><div className="trip-result-stats"><span><b>300 km</b><small>estimated distance</small></span><span><b>3h 12m</b><small>estimated travel time</small></span><span><b>02</b><small>suggested stops</small></span></div><div className="stop-cards"><span><Zap size={14} /> Bengaluru Orbital Charge Hub <small>CCS · illustrative</small></span><span><Zap size={14} /> Delhi NCR Relay Point 02 <small>Connector data unavailable</small></span></div></div>}</> }


type RentalSearchState = { pickup: string; pickupDate: string; returnDate: string; category: string }

type PageHeroProps = { kicker: string; title: string; emphasis?: string; body: string; image?: string; children?: ReactNode }
function PageHero({ kicker, title, emphasis, body, image, children }: PageHeroProps) {
  return <section className={`page-hero ${image ? 'has-image' : ''}`} style={image ? { backgroundImage: `linear-gradient(90deg, rgba(8,9,9,.95), rgba(8,9,9,.57)), url(${image})` } : undefined}><div className="page-hero-inner"><div className="eyebrow"><span className="live-dot lime" /> {kicker}</div><h1>{title}<br />{emphasis && <span>{emphasis}</span>}</h1><p>{body}</p>{children && <div className="page-hero-actions">{children}</div>}</div></section>
}

function ServicesPage({ go }: { go: (path: string) => void }) {
  return <><PageHero kicker="THE VOLTERRA PLATFORM" title="One platform." emphasis="Every part of the journey." body="Explore the connected services that make electric ownership feel clearer, calmer, and more capable." image={HERO_IMAGE}><button className="button button-primary" onClick={() => go('/roadside-assistance')}>Get roadside help <ShieldCheck size={15} /></button></PageHero><section className="directory-section section-pad"><div className="section-kicker"><span>EXPLORE SERVICES</span><span className="line" /><span>05 SYSTEMS</span></div><div className="directory-grid"><DirectoryCard number="01" icon={<ShieldCheck />} title="Roadside assistance" text="Low battery, breakdowns, tyres, lockouts, and EV-compatible towing in a fast demo request flow." route="/roadside-assistance" go={go} accent="lime" /><DirectoryCard number="02" icon={<Zap />} title="Charging discovery" text="Search demo stations, workshops, towing, tyre, repair, and detailing providers around a location." route="/charging" go={go} /><DirectoryCard number="03" icon={<CarFront />} title="EV rentals" text="Browse sample vehicles, compare range and seating, then submit a no-payment booking request." route="/rentals" go={go} /><DirectoryCard number="04" icon={<Wrench />} title="Maintenance & repairs" text="Book inspections, diagnostics, battery health checks, tyres, brakes, detailing, and repairs." route="/maintenance" go={go} /><DirectoryCard number="05" icon={<Route />} title="EV trip planner" text="Create an illustrative route with estimated travel details and suggested charging stops." route="/trip-planner" go={go} wide /></div></section><section className="page-callout dark-panel section-pad"><div><div className="eyebrow">OWNERSHIP, COMPOSED</div><h2>Less admin.<br /><span>More road.</span></h2></div><p>VOLTERRA brings the practical parts of electric driving into one connected concept. Every result is clearly labelled as demonstration data until real providers and integrations are connected.</p></section></>
}

function DirectoryCard({ number, icon, title, text, route, go, accent, wide }: { number: string; icon: ReactNode; title: string; text: string; route: string; go: (path: string) => void; accent?: string; wide?: boolean }) {
  return <button className={`directory-card ${accent || ''} ${wide ? 'wide' : ''}`} onClick={() => go(route)}><div className="directory-card-top"><span>{number}</span><span className="directory-icon">{icon}</span></div><h2>{title}</h2><p>{text}</p><span className="card-action">Open page <ArrowUpRight size={15} /></span></button>
}

function RoadsidePage({ form, setForm, submit, error, go }: { form: typeof defaultSos; setForm: Dispatch<SetStateAction<typeof defaultSos>>; submit: (event: FormEvent) => void; error: string; go: (path: string) => void }) {
  return <><PageHero kicker="ROADSIDE ASSISTANCE / DEMO" title="Stranded?" emphasis="Let's get you moving." body="Tell VOLTERRA what happened and where you are. This prototype records a request only — no real rescue team is dispatched." image={HERO_IMAGE}><button className="button button-primary" onClick={() => document.getElementById('sos-request-form')?.scrollIntoView({ behavior: 'smooth' })}>Start a request <ShieldCheck size={15} /></button></PageHero><section className="page-content-grid section-pad" id="sos-request-form"><div className="info-rail"><div className="section-kicker"><span>THE FAST ROUTE</span><span className="line" /><span>03 STEPS</span></div><h2>Clear details.<br /><span>Calmer next steps.</span></h2><p>Choose the issue, share a manual location, and add a way to contact you. The confirmation gives you a local reference for this demonstration.</p><div className="process-list"><Step number="01" title="Name the issue" text="Low battery, flat tyre, breakdown, towing, lockout, or another roadside concern." /><Step number="02" title="Share the scene" text="Give a street, city, landmark, vehicle, and contact method." /><Step number="03" title="Keep the reference" text="Your request is stored locally and appears in My Garage and Admin." /></div><button className="text-button" onClick={() => go('/my-garage')}>Open My Garage <ArrowUpRight size={15} /></button></div><div className="page-form-card dark-card"><SOSForm form={form} setForm={setForm} submit={submit} error={error} /></div></section></>
}

function ChargingPage({ stations: visibleStations, locationQuery, setLocationQuery, chargingFilter, setChargingFilter, notify, openStation, go }: { stations: Array<(typeof stations)[number]>; locationQuery: string; setLocationQuery: (value: string) => void; chargingFilter: string; setChargingFilter: (value: string) => void; notify: (message: string) => void; openStation: (station: (typeof stations)[number]) => void; go: (path: string) => void }) {
  const filters = ['All', 'Charging station', 'EV workshop', 'Tyre & repair', 'Towing', 'Detailing', 'CCS']
  return <><PageHero kicker="DEMO NETWORK / ILLUSTRATIVE RESULTS" title="Find your next" emphasis="charge." body="Discover charging and EV-related services around a manual location. Provider status, distance, and availability are demonstration data." image={CHARGE_IMAGE}><button className="button button-primary" onClick={() => go('/trip-planner')}>Plan a route <Route size={15} /></button></PageHero><section className="discovery-section section-pad"><div className="discovery-toolbar"><div><div className="eyebrow">SEARCH AREA</div><h2>Useful stops,<br /><span>clearly marked.</span></h2></div><div className="notice-box">Location permission is optional. Manual search works without a map service.</div></div><div className="charging-layout discovery-layout"><div className="map-panel" style={{ backgroundImage: `url(${CHARGE_IMAGE})` }}><div className="map-overlay"><div className="map-label"><Navigation size={13} /> DEMO MAP / {locationQuery || 'SEARCH AREA'}</div><div className="map-pin pin-one"><span /></div><div className="map-pin pin-two"><span /></div><div className="map-pin pin-three"><span /></div><div className="map-route" /></div><div className="map-footer"><span><span className="live-dot lime" /> Demo network layer</span><span>Not live availability</span></div></div><div className="station-panel"><div className="station-search"><Search size={16} /><input aria-label="Search by city or location" value={locationQuery} onChange={e => setLocationQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && notify(`Demo results updated for ${locationQuery}.`)} /><button onClick={() => notify(`Demo results updated for ${locationQuery}.`)}>Search</button></div><div className="filter-row">{filters.map(filter => <button key={filter} className={chargingFilter === filter ? 'active' : ''} onClick={() => setChargingFilter(filter)}>{filter}</button>)}</div><div className="station-list">{visibleStations.map((station, index) => <button className="station-item" key={station.id} onClick={() => openStation(station)}><span className="station-index">0{index + 1}</span><span className="station-main"><strong>{station.name}</strong><small>{station.category} · {station.distance} illustrative</small></span><span className="station-state">{station.connector || 'SERVICE'}<ChevronRight size={15} /></span></button>)}</div></div></div></section></>
}

function RentalsPage({ rentalQuery, setRentalQuery, searchRentals, formError, openVehicle, go }: { rentalQuery: RentalSearchState; setRentalQuery: Dispatch<SetStateAction<RentalSearchState>>; searchRentals: (event: FormEvent) => void; formError: string; openVehicle: (vehicle: Vehicle) => void; go: (path: string) => void }) {
  const visibleVehicles = vehicles.filter(vehicle => rentalQuery.category === 'Any vehicle' || vehicle.category === rentalQuery.category)
  return <><PageHero kicker="DEMO FLEET / NO PAYMENT REQUIRED" title="Your next electric" emphasis="drive starts here." body="Browse sample vehicles, compare the essentials, and send a rental request without payment. Prices and availability are illustrative." image={RENTAL_IMAGE}><button className="button button-primary" onClick={() => document.getElementById('rental-fleet')?.scrollIntoView({ behavior: 'smooth' })}>Browse the fleet <CarFront size={15} /></button></PageHero><section className="rentals rental-page-section section-pad" id="rental-fleet"><div className="section-kicker"><span>SEARCH THE FLEET</span><span className="line" /><span>DEMO INVENTORY</span></div><form className="rental-search" onSubmit={searchRentals}><div><label>Pickup location</label><input value={rentalQuery.pickup} onChange={e => setRentalQuery({ ...rentalQuery, pickup: e.target.value })} placeholder="City or location" /></div><div><label>Pickup date</label><input type="date" value={rentalQuery.pickupDate} onChange={e => setRentalQuery({ ...rentalQuery, pickupDate: e.target.value })} /></div><div><label>Return date</label><input type="date" value={rentalQuery.returnDate} onChange={e => setRentalQuery({ ...rentalQuery, returnDate: e.target.value })} /></div><div><label>Vehicle category</label><select value={rentalQuery.category} onChange={e => setRentalQuery({ ...rentalQuery, category: e.target.value })}><option>Any vehicle</option><option>Premium crossover</option><option>Performance sedan</option><option>Urban hatch</option></select></div><button className="button button-primary" type="submit">Search fleet <Search size={15} /></button></form>{formError && <div className="inline-error">{formError}</div>}<div className="vehicle-grid">{visibleVehicles.map(vehicle => <button className="vehicle-card" key={vehicle.id} onClick={() => openVehicle(vehicle)}><div className="vehicle-image" style={{ backgroundImage: `url(${vehicle.image})` }}><span>DEMO VEHICLE</span><ArrowUpRight /></div><div className="vehicle-copy"><div><h3>{vehicle.name}</h3><p>{vehicle.category}</p></div><strong>₹{vehicle.price}<small>/ day</small></strong></div><div className="vehicle-specs"><span><CarFront size={14} /> {vehicle.seats} seats</span><span><BatteryCharging size={14} /> {vehicle.range}</span><span>View details <ChevronRight size={14} /></span></div></button>)}</div><div className="notice-box rental-note">Prices, vehicle availability, and booking fulfilment are demonstration-only. <button className="text-button" onClick={() => go('/my-garage')}>View requests <ArrowUpRight size={14} /></button></div></section></>
}

function MaintenancePage({ form, setForm, submit, error }: { form: typeof defaultService; setForm: Dispatch<SetStateAction<typeof defaultService>>; submit: (event: FormEvent) => void; error: string }) {
  return <><PageHero kicker="MAINTENANCE / DEMO APPOINTMENT" title="Care that keeps" emphasis="you moving." body="Choose a service and preferred time. Availability is illustrative until provider integrations are connected." image={CHARGE_IMAGE}><button className="button button-primary" onClick={() => document.getElementById('maintenance-form')?.scrollIntoView({ behavior: 'smooth' })}>Book a service <Wrench size={15} /></button></PageHero><section className="page-content-grid section-pad" id="maintenance-form"><div className="info-rail"><div className="section-kicker"><span>THE CARE MENU</span><span className="line" /><span>07 SERVICES</span></div><h2>Keep the system<br /><span>in its rhythm.</span></h2><p>From routine inspections to battery health checks and detailing, this demo flow is built for the practical moments between journeys.</p><div className="care-list">{serviceCategories.map((item, index) => <div className="care-list-row" key={item}><span>0{index + 1}</span>{item}<Wrench size={14} /></div>)}</div></div><div className="page-form-card light-card"><ServiceForm form={form} setForm={setForm} submit={submit} error={error} /></div></section></>
}

function TripPlannerPage({ form, setForm, result, setResult, error, setError }: { form: typeof defaultTrip; setForm: Dispatch<SetStateAction<typeof defaultTrip>>; result: boolean; setResult: (value: boolean) => void; error: string; setError: (value: string) => void }) {
  return <><PageHero kicker="TRIP PLANNER / ESTIMATES ONLY" title="Go further." emphasis="Plan smarter." body="Build an illustrative route with potential charging stops. Distance and time are estimates, not guaranteed navigation or vehicle telemetry." image={HERO_IMAGE}><button className="button button-primary" onClick={() => document.getElementById('trip-planner-form')?.scrollIntoView({ behavior: 'smooth' })}>Build a route <Route size={15} /></button></PageHero><section className="page-content-grid section-pad" id="trip-planner-form"><div className="info-rail"><div className="section-kicker"><span>ROUTE LOGIC</span><span className="line" /><span>ILLUSTRATIVE</span></div><h2>Make a plan<br /><span>to move.</span></h2><p>Give the planner a start, destination, range, and charging preference. The result is a visual demonstration of the product direction.</p><div className="trip-side-stats"><span><strong>300 km</strong><small>illustrative distance</small></span><span><strong>02</strong><small>suggested stops</small></span></div></div><div className="page-form-card dark-card"><TripForm form={form} setForm={setForm} result={result} setResult={setResult} error={error} setError={setError} /></div></section></>
}

function AboutPage({ go }: { go: (path: string) => void }) {
  return <><PageHero kicker="ABOUT VOLTERRA / INDEPENDENT CONCEPT" title="Making electric mobility" emphasis="easier to live with." body="VOLTERRA is an independent platform concept for the everyday layer around electric driving — from the next charge to the next service appointment." image={HERO_IMAGE}><button className="button button-primary" onClick={() => go('/services')}>Explore services <ArrowUpRight size={15} /></button></PageHero><section className="about-story section-pad"><div className="section-kicker"><span>THE OPPORTUNITY</span><span className="line" /><span>ONE CONNECTED LAYER</span></div><div className="about-grid"><div><h2>Electric mobility is exciting.<br /><span>The admin around it should be easier.</span></h2></div><div><p>VOLTERRA brings charging discovery, roadside help, rentals, maintenance, and trip planning into one composed experience. It is designed to feel useful before it feels complex.</p><p>There is no invented company history, partnership claim, certification, or unsupported statistic here — only a clear product direction for a more considered ownership journey.</p></div></div></section><section className="principles-section section-pad dark-panel"><div className="section-kicker"><span>CORE PRINCIPLES</span><span className="line" /><span>04 SIGNALS</span></div><div className="principles-grid"><div><span>01</span><h3>Clear first</h3><p>Information should arrive in the order an owner needs it.</p></div><div><span>02</span><h3>EV focused</h3><p>Charging, battery confidence, and the road ahead are the starting point.</p></div><div><span>03</span><h3>Connected</h3><p>Requests should carry forward into a simple record, not disappear.</p></div><div><span>04</span><h3>Honest</h3><p>Demo data is labelled until real integrations are ready.</p></div></div><button className="button button-primary" onClick={() => go('/services')}>See the platform <ArrowUpRight size={15} /></button></section></>
}

function ContactPage({ go, notify }: { go: (path: string) => void; notify: (message: string) => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ reason: 'General question', name: '', contact: '', message: '' })
  const submit = (event: FormEvent) => { event.preventDefault(); if (!form.name || !form.contact || !form.message) { setError('Add your name, a contact method, and a message before submitting.'); return } setError(''); setSubmitted(true); notify('Your demo enquiry is acknowledged in this browser.') }
  return <><PageHero kicker="CONTACT & SUPPORT / DEMO" title="Keep the conversation" emphasis="moving." body="Ask about the platform concept, share product feedback, or find the right demo service. No email is sent from this prototype." image={CHARGE_IMAGE}><button className="button button-primary" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>Send an enquiry <MessageSquareText size={15} /></button></PageHero><section className="contact-layout section-pad" id="contact-form"><div className="contact-copy"><div className="section-kicker"><span>SUPPORT CHANNEL</span><span className="line" /><span>DEMO ONLY</span></div><h2>What can we<br /><span>help clarify?</span></h2><p>Use the form for a product question, feedback, provider note, or general enquiry. The result stays in this browser only.</p><div className="faq-list"><details><summary>Is VOLTERRA dispatching real roadside help?</summary><p>No. SOS requests are stored as demonstration records only.</p></details><details><summary>Are the charging results live?</summary><p>No. Stations, distance, availability, and provider status are illustrative.</p></details><details><summary>Can I pay for a rental here?</summary><p>No. Rental inventory and pricing are sample data and no payment is taken.</p></details></div></div><div className="page-form-card light-card">{submitted ? <div className="inline-confirmation"><div className="confirmation-mark"><Check size={24} /></div><div className="eyebrow">DEMO ENQUIRY RECORDED</div><h2>Thanks for<br /><span>the signal.</span></h2><p>Your message has been acknowledged in this browser. No email was sent.</p><button className="button button-primary" onClick={() => setSubmitted(false)}>Send another <ArrowUpRight size={15} /></button></div> : <form className="modal-form" onSubmit={submit}><ModalHead eyebrow="CONTACT / LOCAL DEMO" title="Start a line." text="A simple contact prototype with no external email delivery." /><Field label="Reason for enquiry"><select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}><option>General question</option><option>Product feedback</option><option>Provider suggestion</option><option>Partnership idea</option></select></Field><Field label="Name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></Field><Field label="Email or contact method"><input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Email, phone, or preferred contact" /></Field><Field label="Message" wide><textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" /></Field>{error && <div className="form-error">{error}</div>}<button className="button button-primary form-submit" type="submit">Submit demo enquiry <MessageSquareText size={16} /></button></form>}</div></section><section className="contact-links section-pad"><div className="section-kicker"><span>QUICK LINKS</span><span className="line" /><span>FIND YOUR WAY</span></div><div className="link-strip"><button onClick={() => go('/roadside-assistance')}>Roadside SOS <ArrowUpRight size={15} /></button><button onClick={() => go('/charging')}>Charging <ArrowUpRight size={15} /></button><button onClick={() => go('/rentals')}>Rentals <ArrowUpRight size={15} /></button><button onClick={() => go('/maintenance')}>Maintenance <ArrowUpRight size={15} /></button></div></section></>
}

function SignInPage({ notify, onAuthenticated, gated }: { notify: (message: string) => void; onAuthenticated: (contact: string) => void; gated?: boolean }) {
  const [stage, setStage] = useState<'contact' | 'verify'>('contact')
  const [contact, setContact] = useState('')
  const [code, setCode] = useState('')
  const [enteredCode, setEnteredCode] = useState('')
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const requestCode = (event: FormEvent) => {
    event.preventDefault()
    const normalized = contact.trim()
    const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)
    const phoneDigits = normalized.replace(/\D/g, '')
    if (!isEmail && phoneDigits.length < 10) { setError('Enter a valid email address or Indian phone number.'); return }
    const nextCode = String(Math.floor(100000 + Math.random() * 900000))
    setCode(nextCode)
    setEnteredCode('')
    setError('')
    setStage('verify')
    notify(`Demo verification code generated for ${normalized}.`)
  }
  const verifyCode = (event: FormEvent) => {
    event.preventDefault()
    if (enteredCode.trim() !== code) { setError('That verification code does not match. Use the demo code shown below.'); return }
    setError('')
    setVerified(true)
    onAuthenticated(contact.trim())
  }
  return <section className="auth-page section-pad"><div className="auth-card"><div className="brand auth-brand"><span className="brand-mark"><span /><span /></span><span>VOLTERRA</span></div><div className="eyebrow">INDIA ACCOUNT ACCESS / DEMO</div><h1>{gated ? <>Sign up to<br /><span>keep moving.</span></> : <>Keep your<br /><span>drive close.</span></>}</h1><p>{gated ? 'The homepage is open to everyone. Create a demo account to browse charging, rentals, maintenance, trip planning, and My Garage.' : 'Use your email or Indian phone number to unlock the full VOLTERRA experience.'}</p>{verified ? <div className="inline-confirmation"><div className="confirmation-mark"><Check size={24} /></div><h2>Access<br /><span>verified.</span></h2><p>Your demo account is unlocked. You can now browse every VOLTERRA feature.</p><button className="button button-primary" onClick={() => onAuthenticated(contact.trim())}>Browse the platform <ArrowUpRight size={15} /></button></div> : stage === 'contact' ? <form className="modal-form" onSubmit={requestCode}><Field label="Email or Indian phone number"><input value={contact} onChange={e => { setContact(e.target.value); setError('') }} placeholder="name@example.com or +91 98765 43210" autoComplete="email tel" /></Field>{error && <div className="form-error">{error}</div>}<button className="button button-primary form-submit" type="submit">Send verification code <ArrowUpRight size={15} /></button></form> : <form className="modal-form" onSubmit={verifyCode}><div className="verification-code"><span>DEMO CODE FOR THIS PREVIEW</span><strong>{code}</strong><small>No real SMS or email is sent in this prototype.</small></div><Field label="Verification code"><input inputMode="numeric" maxLength={6} value={enteredCode} onChange={e => { setEnteredCode(e.target.value.replace(/\D/g, '')); setError('') }} placeholder="Enter 6-digit code" autoComplete="one-time-code" /></Field>{error && <div className="form-error">{error}</div>}<button className="button button-primary form-submit" type="submit">Verify and browse <Check size={16} /></button><button type="button" className="text-button auth-back" onClick={() => { setStage('contact'); setError('') }}>Use a different email or phone</button></form>}<div className="notice-box">Prototype boundary: the code is shown in this preview instead of being delivered by a real SMS/email provider. Session access is stored locally in this browser.</div></div></section>
}

function NotFoundPage({ go }: { go: (path: string) => void }) {
  return <section className="not-found section-pad"><div className="eyebrow">404 / ROAD NOT FOUND</div><h1>That route<br /><span>isn't mapped.</span></h1><p>Return to the VOLTERRA platform and choose a service.</p><button className="button button-primary" onClick={() => go('/')}>Back to home <ArrowUpRight size={15} /></button></section>
}


function navigateDemo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function JourneyCube() {
  const faces = [
    { className: 'cube-face front', image: CHARGE_IMAGE, label: 'CHARGE' },
    { className: 'cube-face bottom', image: HERO_IMAGE, label: 'ROAD' },
    { className: 'cube-face back', image: RENTAL_IMAGE, label: 'RENT' },
    { className: 'cube-face top', image: HERO_IMAGE, label: 'CARE' },
  ]
  return <div className="cube-stage" aria-label="Rotating EV journey showcase"> <div className="cube-wrapper">{faces.map(face => <div className={face.className} key={face.label} style={{ backgroundImage: `linear-gradient(180deg, rgba(5,5,5,.1), rgba(5,5,5,.68)), url(${face.image})` }}><span>{face.label}</span></div>)}</div></div>
}

function JourneyStories() {
  return <section className="cinematic-section journey-stories section-pad" aria-labelledby="journey-stories-title"><div className="cinematic-section-kicker"><span>THE EV JOURNEY INDEX</span><span className="cinematic-line" /><span>03 CASE FILES</span></div><div className="cinematic-heading-row"><h2 id="journey-stories-title">Electric life,<br /><span>in motion.</span></h2><p>Three illustrative moments where VOLTERRA turns the friction around driving electric into a clearer next move.</p></div><div className="journey-grid"><article className="journey-feature"><div className="window-controls"><i /><i /><i /></div><div className="journey-image" style={{ backgroundImage: `url(${HERO_IMAGE})` }} /><div className="journey-copy"><span>CASE 001 / THE UNEXPECTED</span><h3>When the road asks<br />for a little more.</h3><p>Roadside help, clear context, and a local reference when your EV needs support now.</p><button className="cinematic-link" onClick={() => navigateDemo('/roadside-assistance')}>Open roadside flow <ArrowUpRight size={15} /></button></div></article><article className="journey-card"><div className="window-controls"><i /><i /><i /></div><div className="journey-image" style={{ backgroundImage: `url(${CHARGE_IMAGE})` }} /><div className="journey-copy"><span>CASE 002 / THE NEXT STOP</span><h3>Charge with<br />more signal.</h3><p>Illustrative providers, connector context, and a route that leaves room for confidence.</p><button className="cinematic-link" onClick={() => navigateDemo('/charging')}>Find a charge <ArrowUpRight size={15} /></button></div></article><article className="journey-card"><div className="window-controls"><i /><i /><i /></div><div className="journey-image" style={{ backgroundImage: `url(${RENTAL_IMAGE})` }} /><div className="journey-copy"><span>CASE 003 / THE OPEN ROAD</span><h3>Choose the<br />right electric shape.</h3><p>Sample vehicles, clear essentials, and a request flow without payment theatre.</p><button className="cinematic-link" onClick={() => navigateDemo('/rentals')}>Explore the fleet <ArrowUpRight size={15} /></button></div></article></div></section>
}

function OwnershipPlans() {
  const [activeServices, setActiveServices] = useState(4)
  const estimate = activeServices * 1250
  return <section className="pricing-section cinematic-section section-pad" aria-labelledby="ownership-plans-title"><div className="pricing-glow" /><div className="cinematic-section-kicker"><span>OWNERSHIP PLANS / DEMO PRICING</span><span className="cinematic-line" /><span>03 TIERS</span></div><div className="cinematic-heading-row pricing-heading"><h2 id="ownership-plans-title">Support that<br /><span>scales with you.</span></h2><p>Illustrative plan architecture for the moments around an electric drive. No payment is taken and no provider availability is guaranteed.</p></div><div className="plan-grid"><PlanCard name="Essential" price="₹0" detail="For exploring the platform" features={['Charging discovery', 'Trip estimates', 'Local Garage records']} /><PlanCard name="Growth" price="₹2,499" detail="For active EV ownership" features={['Everything in Essential', 'Priority demo requests', 'Maintenance reminders']} featured /><PlanCard name="Command" price="₹6,999" detail="For every moving part" features={['Everything in Growth', 'Expanded care history', 'Multi-vehicle planning']} /></div><div className="price-calculator"><div><span className="calculator-label">GLASSMORPHIC ESTIMATOR / DEMO ONLY</span><h3>How much of the journey<br /><span>do you want in one place?</span></h3><p>Move the slider to model active monthly EV services. This is a visual estimate only.</p></div><div className="calculator-control"><div className="calculator-total"><small>ILLUSTRATIVE MONTHLY ESTIMATE</small><strong>₹{estimate.toLocaleString('en-IN')}</strong></div><label htmlFor="service-count">{activeServices} active services <span>₹1,250 × {activeServices}</span></label><input id="service-count" type="range" min="1" max="12" value={activeServices} onChange={event => setActiveServices(Number(event.target.value))} aria-label="Number of active EV services" /><div className="range-meta"><span>1 service</span><span>12 services</span></div></div></div></section>
}

function PlanCard({ name, price, detail, features, featured }: { name: string; price: string; detail: string; features: string[]; featured?: boolean }) {
  return <article className={`plan-card ${featured ? 'featured' : ''}`}><div className="plan-card-top"><span>{featured ? 'RECOMMENDED' : 'DEMO TIER'}</span><span className="plan-orbit" /></div><h3>{name}</h3><p>{detail}</p><strong>{price}<small>{price === '₹0' ? ' / forever' : ' / month'}</small></strong><ul>{features.map(feature => <li key={feature}><Check size={14} /> {feature}</li>)}</ul><button className="plan-button" onClick={() => navigateDemo('/services')}>Explore tier <ArrowUpRight size={15} /></button></article>
}
