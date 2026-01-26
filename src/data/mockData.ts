import type { BusRoute } from '../types';

// Helper to generate a loop of coordinates
// Center: 51.505, -0.09 (London area for demo)
// const CENTER = [51.505, -0.09];

export const BUS_ROUTES: BusRoute[] = [
  {
    id: 'route-red',
    name: 'Red Route (Campus Loop)',
    color: '#ef4444', // Red-500
    path: [
      [51.505, -0.09],
      [51.5055, -0.089],
      [51.506, -0.088],
      [51.5065, -0.089],
      [51.507, -0.09],
      [51.5065, -0.091],
      [51.506, -0.092],
      [51.5055, -0.091],
      [51.505, -0.09], // Close loop
    ],
    stops: [
      { id: 'stop-r1', name: 'Main Gate', location: [51.505, -0.09] },
      { id: 'stop-r2', name: 'Science Block', location: [51.506, -0.088] },
      { id: 'stop-r3', name: 'Library', location: [51.507, -0.09] },
      { id: 'stop-r4', name: 'Dorms', location: [51.506, -0.092] },
    ],
  },
  {
    id: 'route-blue',
    name: 'Blue Route (North-South)',
    color: '#3b82f6', // Blue-500
    path: [
      [51.504, -0.09],
      [51.505, -0.09],
      [51.506, -0.09],
      [51.507, -0.09],
      [51.508, -0.09],
      [51.507, -0.09],
      [51.506, -0.09],
      [51.505, -0.09],
      [51.504, -0.09], // Back and forth
    ],
    stops: [
      { id: 'stop-b1', name: 'South Parking', location: [51.504, -0.09] },
      { id: 'stop-b2', name: 'Central Plaza', location: [51.506, -0.09] },
      { id: 'stop-b3', name: 'North Exit', location: [51.508, -0.09] },
    ],
  },
  {
    id: 'route-green',
    name: 'Green Route (East-West)',
    color: '#22c55e', // Green-500
    path: [
      [51.506, -0.092],
      [51.506, -0.091],
      [51.506, -0.09],
      [51.506, -0.089],
      [51.506, -0.088],
      [51.506, -0.089],
      [51.506, -0.09],
      [51.506, -0.091],
      [51.506, -0.092], // Back and forth
    ],
    stops: [
      { id: 'stop-g1', name: 'West Wing', location: [51.506, -0.092] },
      { id: 'stop-g2', name: 'Cafeteria', location: [51.506, -0.09] },
      { id: 'stop-g3', name: 'East Lab', location: [51.506, -0.088] },
    ],
  },
];
