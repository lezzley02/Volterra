import type { Station, Vehicle } from './types'

export const HERO_IMAGE = '/manus-storage/async-images/xtWQi2JmCI7NAm3dNSlqTW/image-1.webp'
export const RENTAL_IMAGE = '/manus-storage/async-images/xtWQi2JmCI7NAm3dNSlqTW/image-2.webp'
export const CHARGE_IMAGE = '/manus-storage/async-images/xtWQi2JmCI7NAm3dNSlqTW/image-3.webp'

export const vehicles: Vehicle[] = [
  { id: 'v1', name: 'Arc One', category: 'Premium crossover', seats: 5, range: '502 km', price: 3499, image: RENTAL_IMAGE, description: 'Quiet, confident and long-legged for weekend escapes or city miles.' },
  { id: 'v2', name: 'Lumen GT', category: 'Performance sedan', seats: 5, range: '462 km', price: 4299, image: HERO_IMAGE, description: 'A low, composed drive with instant response and room for the long way home.' },
  { id: 'v3', name: 'Morrow S', category: 'Urban hatch', seats: 4, range: '367 km', price: 2499, image: CHARGE_IMAGE, description: 'Compact outside, considered inside — made for everyday electric movement.' },
]

export const stations: Station[] = [
  { id: 's1', name: 'Bengaluru Orbital Charge Hub', category: 'Charging station', distance: '3.9 km', connector: 'CCS · 150 kW', availability: 'Demo status · Usually open', note: 'Illustrative network result near your search area.' },
  { id: 's2', name: 'Mumbai Volt & Vine Workshop', category: 'EV workshop', distance: '7.7 km', availability: 'Demo status · Request a slot', note: 'Diagnostics, tyres, battery health checks.' },
  { id: 's5', name: 'Pune Vector Tyre & Repair', category: 'Tyre & repair', distance: '8.8 km', availability: 'Demo status · Provider hours vary', note: 'Tyre fitting, alignment, and general EV repair listing.' },
  { id: 's3', name: 'Delhi NCR Relay Recovery', category: 'Towing', distance: '9.8 km', availability: 'Demo status · Provider hours vary', note: 'EV-compatible towing demonstration listing.' },
  { id: 's4', name: 'Hyderabad Clearcoat EV Detail', category: 'Detailing', distance: '11.7 km', availability: 'Demo status · Open today', note: 'Interior reset and exterior ceramic care.' },
]

export const serviceCategories = ['Routine inspection', 'Diagnostics', 'Battery health check', 'Tyre services', 'Brakes and suspension', 'Detailing', 'Other repairs']

export const benefits = [
  ['01', 'EV-focused', 'Services designed around electric driving needs.'],
  ['02', 'Connected experience', 'Essential ownership services, in one composed place.'],
  ['03', 'Clear status updates', 'Every request resolves into a simple next step.'],
  ['04', 'Built for the road', 'A responsive experience for wherever the drive goes.'],
]
