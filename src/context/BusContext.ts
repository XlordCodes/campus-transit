import { createContext, useContext } from 'react';
import type { Bus, UserRole, Alert, BusRoute } from '../types';
import type { User } from 'firebase/auth';

interface BusContextType {
  buses: Bus[];
  routes: BusRoute[];
  userRole: UserRole;
  user: User | null;
  authReady: boolean;
  firebaseEnabled: boolean;
  alerts: Alert[];
  startTrip: (busId: string) => void;
  updateSeats: (busId: string, count: number) => void;
  reportEmergency: (busId: string, type: 'breakdown' | 'weather') => void;
  resumeTrip: (busId: string) => void;
  stopTrip: (busId: string) => void;
  addRoute: (route: BusRoute) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  userBusId: string; // The bus assigned to the driver role
}

export const BusContext = createContext<BusContextType | undefined>(undefined);

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) throw new Error('useBus must be used within a BusProvider');
  return context;
};
