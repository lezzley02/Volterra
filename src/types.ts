export type Status = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Request Received' | 'Pending Assignment'

export type ModalType = 'sos' | 'rental' | 'service' | 'trip' | 'vehicle' | 'station' | null

export interface Vehicle {
  id: string
  name: string
  category: string
  seats: number
  range: string
  price: number
  image: string
  description: string
}

export interface Station {
  id: string
  name: string
  category: string
  distance: string
  connector?: string
  availability: string
  note: string
}

export interface SOSRequest {
  id: string
  type: string
  location: string
  vehicle: string
  contact: string
  description: string
  status: Status
  createdAt: string
}

export interface RentalRequest {
  id: string
  vehicle: string
  pickup: string
  pickupDate: string
  returnDate: string
  renter: string
  contact: string
  status: Status
  createdAt: string
}

export interface ServiceAppointment {
  id: string
  vehicle: string
  category: string
  date: string
  time: string
  location: string
  contact: string
  notes: string
  status: Status
  createdAt: string
}

export interface SavedVehicle {
  id: string
  vehicleId: string
  name: string
  range: string
  addedAt: string
}

export interface SavedStation {
  id: string
  name: string
  category: string
  distance: string
  connector?: string
  availability: string
  note: string
  savedAt: string
}

export interface Reminder {
  id: string
  title: string
  vehicle: string
  due: string
  detail: string
}

export interface GarageState {
  sos: SOSRequest[]
  rentals: RentalRequest[]
  appointments: ServiceAppointment[]
  savedVehicles: SavedVehicle[]
  savedStations: SavedStation[]
  reminders: Reminder[]
}
