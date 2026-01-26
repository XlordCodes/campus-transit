import { createContext, useContext } from 'react';
import type { Bus, UserRole, Alert } from '../types';

interface BusContextType {
  buses: Bus[];
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  alerts: Alert[];
  startTrip: (busId: string) => void;
  updateSeats: (busId: string, count: number) => void;
  reportEmergency: (busId: string, type: 'breakdown' | 'weather') => void;
  resumeTrip: (busId: string) => void;
  stopTrip: (busId: string) => void;
  userBusId: string; // The bus assigned to the driver role
}

export const BusContext = createContext<BusContextType | undefined>(undefined);

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) throw new Error('useBus must be used within a BusProvider');
  return context;
};
