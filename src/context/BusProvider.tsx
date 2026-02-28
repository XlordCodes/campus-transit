import React, { useEffect, useState } from 'react';
import { BUS_ROUTES } from '../data/mockData';
import { getDistance } from '../utils/geo';
import type { Bus, UserRole, Alert, BusRoute } from '../types';
import { BusContext } from './BusContext';

interface User {
  email: string | null;
}

// Initial State Setup
const INITIAL_BUSES: Bus[] = BUS_ROUTES.map((route, index) => ({
  id: `bus-${route.id.split('-')[1]}`, // bus-red, bus-blue...
  routeId: route.id,
  location: route.path[0],
  currentPathIdx: 0,
  segmentProgress: 0,
  nextStopIdx: 0,
  isAtStop: true, // Start at the first stop/point
  status: 'stopped',
  seatsAvailable: 20 + index * 5,
  capacity: 40,
}));

const SPEED_MPS = 20; // Meters per second (simulation speed)

const deriveRoleFromEmail = (email: string | null | undefined): UserRole => {
  if (!email) return null;
  const lower = email.toLowerCase();
  if (lower.includes('admin')) return 'admin';
  if (lower.includes('driver')) return 'driver';
  return 'student';
};

export const BusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [routes, setRoutes] = useState<BusRoute[]>(BUS_ROUTES);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [user, setUser] = useState<User | null>(null);
  const authReady = true;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const userBusId = 'bus-red'; // The user drives the Red bus

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          // 1. Skip if broken down or waiting at stop (unless ghost auto-resume handles it)
          if (bus.status === 'breakdown') return bus;
          
          // Logic for Ghost Buses (not the user's bus, or if user is not a driver)
          const isMyBus = userRole === 'driver' && bus.id === userBusId;

          // If bus is stopped (manual stop or at station)
          if (bus.status === 'stopped') {
             // Ghost bus auto-resume logic
             // Only apply to ghosts that are NOT broken down
             if (!isMyBus) {
               if (Math.random() > 0.95) { // 5% chance per second to resume
                 const route = routes.find((r) => r.id === bus.routeId);
                 // If at stop, advance index
                 const nextStopIdx = bus.isAtStop && route 
                    ? (bus.nextStopIdx + 1) % route.stops.length 
                    : bus.nextStopIdx;
                 return { ...bus, isAtStop: false, status: 'moving', nextStopIdx };
               }
             }
             return bus;
          }

          // If isAtStop is true but status is 'moving' (e.g. just started), let it move.
          // But if it's truly at a stop, it should have been caught above by status='stopped' 
          // UNLESS we want to simulate "dwelling" time while status is moving? 
          // No, usually 'stopped' status implies dwelling.

          // 2. Move Bus
          const route = routes.find((r) => r.id === bus.routeId);
          if (!route) return bus;

          const path = route.path;
          const currentPoint = path[bus.currentPathIdx];
          const nextIdx = (bus.currentPathIdx + 1) % path.length;
          const nextPoint = path[nextIdx];

          const segmentDist = getDistance(
            currentPoint[0],
            currentPoint[1],
            nextPoint[0],
            nextPoint[1]
          );

          // Calculate how much we move in ratio (0-1)
          const delta = segmentDist > 0 ? SPEED_MPS / segmentDist : 1;
          
          let newProgress = bus.segmentProgress + delta;
          let newPathIdx = bus.currentPathIdx;
          let newLocation = bus.location;

          if (newProgress >= 1) {
            // Reached next point
            newPathIdx = nextIdx;
            newProgress = 0;
            newLocation = path[newPathIdx];
          } else {
            // Interpolate
            const lat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * newProgress;
            const lng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * newProgress;
            newLocation = [lat, lng];
          }

          // 3. Check Stops
          let newIsAtStop = false;
          let newStatus: Bus['status'] = bus.status;
          
          const stops = route.stops;
          const targetStop = stops[bus.nextStopIdx];
          
          if (targetStop) {
            const distToStop = getDistance(
              newLocation[0],
              newLocation[1],
              targetStop.location[0],
              targetStop.location[1]
            );

            if (distToStop < 50) { // 50m radius
              newLocation = targetStop.location;
              newIsAtStop = true;
              newStatus = 'stopped';
            }
          }

          return {
            ...bus,
            location: newLocation,
            currentPathIdx: newPathIdx,
            segmentProgress: newProgress,
            isAtStop: newIsAtStop,
            nextStopIdx: bus.nextStopIdx, 
            status: newStatus,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [userRole, userBusId, routes]);

  // Actions
  const startTrip = (busId: string) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id !== busId) return b;
        
        // If at a stop, we need to advance to next stop to avoid getting stuck in radius
        if (b.isAtStop) {
           const route = routes.find((r) => r.id === b.routeId);
           const nextStopIdx = route ? (b.nextStopIdx + 1) % route.stops.length : b.nextStopIdx;
           return { ...b, status: 'moving', isAtStop: false, nextStopIdx };
        }
        
        return { ...b, status: 'moving', isAtStop: false };
      })
    );
  };

  const stopTrip = (busId: string) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'stopped' } : b))
    );
  };

  const resumeTrip = (busId: string) => {
    // Same logic as startTrip for now, but explicitly for leaving a stop
    startTrip(busId);
  };

  const updateSeats = (busId: string, count: number) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, seatsAvailable: Math.max(0, b.capacity - count) } : b))
    );
  };

  const reportEmergency = (busId: string, type: 'breakdown' | 'weather') => {
    setBuses((prev) =>
      prev.map((b) =>
        b.id === busId
          ? { ...b, status: type === 'breakdown' ? 'breakdown' : 'delayed' }
          : b
      )
    );
    const newAlert: Alert = {
      id: Date.now().toString(),
      busId,
      type,
      message: type === 'breakdown' ? 'Bus Breakdown Reported!' : 'Heavy Weather Delay',
      timestamp: Date.now(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const addRoute = (route: BusRoute) => {
    setRoutes((prev) => [...prev, route]);
  };

  const signIn = async (email: string, password: string) => {
    // Simple authentication logic
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if user exists in valid users or derive role from email
    const derivedRole = deriveRoleFromEmail(normalizedEmail);
    
    // For demo purposes, accept any password that matches pattern or is valid
    // In production, you would validate against a backend
    if (password.length < 3) {
      throw new Error('Invalid password. Password must be at least 3 characters.');
    }
    
    // Set the user and role
    setUser({ email: normalizedEmail });
    setUserRole(derivedRole);
  };

  const signOut = async () => {
    setUser(null);
    setUserRole(null);
  };

  return (
    <BusContext.Provider
      value={{
        buses,
        routes,
        userRole,
        user,
        authReady,
        alerts,
        startTrip,
        stopTrip,
        updateSeats,
        reportEmergency,
        resumeTrip,
        addRoute,
        signIn,
        signOut,
        userBusId,
      }}
    >
      {children}
    </BusContext.Provider>
  );
};
