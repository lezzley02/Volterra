import type { GarageState } from './types'

const KEY = 'volterra-demo-state-v1'

export const blankState: GarageState = {
  sos: [],
  rentals: [],
  appointments: [],
  savedVehicles: [{ id: 'vehicle-demo-1', vehicleId: 'v1', name: 'My daily EV', range: '502 km', addedAt: '2026-01-01T00:00:00.000Z' }],
  savedStations: [],
  reminders: [{ id: 'reminder-demo-1', title: 'Battery health check', vehicle: 'My daily EV', due: '14d', detail: 'A calm check-in for long-range confidence.' }],
}

export function loadState(): GarageState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...blankState, ...JSON.parse(raw) } : blankState
  } catch {
    return blankState
  }
}

export function saveState(state: GarageState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Local storage is an optional prototype convenience, never a hard dependency.
  }
}

export function makeReference(prefix: string) {
  const time = Date.now().toString(36).toUpperCase().slice(-5)
  const random = Math.random().toString(36).toUpperCase().slice(2, 5)
  return `${prefix}-${time}${random}`
}
