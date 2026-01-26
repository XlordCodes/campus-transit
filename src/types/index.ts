export type UserRole = 'student' | 'driver' | 'admin' | null;

export interface Stop {
  id: string;
  name: string;
  location: [number, number]; // [lat, lng]
}

export interface BusRoute {
  id: string;
  name: string;
  color: string;
  path: [number, number][]; // Array of coordinates forming the loop
  stops: Stop[];
}

export interface Bus {
  id: string;
  routeId: string;
  location: [number, number];
  currentPathIdx: number; // Index of the point we just passed
  segmentProgress: number; // 0.0 to 1.0 along the segment
  nextStopIdx: number;
  isAtStop: boolean;
  status: 'moving' | 'stopped' | 'breakdown' | 'delayed';
  seatsAvailable: number;
  capacity: number;
}

export interface Alert {
  id: string;
  busId: string;
  type: 'breakdown' | 'weather' | 'delay';
  message: string;
  timestamp: number;
}
