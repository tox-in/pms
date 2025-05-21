import React, { createContext, useContext, useState, useEffect } from 'react';
import { IParking } from './types';
import { IParkingLot } from './types/index';
import { getAvailableParkingLots } from './services/parking';

interface CommonState {
  parkingLots: IParkingLot[];
  selectedParkingLot: IParkingLot | null;
  parkingSessions: IParking[];
  loading: boolean;
  error: string | null;
}

interface CommonActions {
  setSelectedParkingLot: (lot: IParkingLot | null) => void;
  fetchParkingLots: () => Promise<void>;
  login: (token: string) => void;
  logout: () => void;
  setAuthStatus: (status: boolean) => void;
}

const initialState: CommonState = {
  parkingLots: [],
  selectedParkingLot: null,
  parkingSessions: [],
  loading: false,
  error: null,
};

const CommonContext = createContext<CommonState & CommonActions>(
  {} as CommonState & CommonActions
);

export const CommonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CommonState>(initialState);

  const setSelectedParkingLot = (lot: IParkingLot | null) => {
    setState(prev => ({ ...prev, selectedParkingLot: lot }));
  };

  const login = (token: string) => {
    setState(prev => ({ ...prev, isAuthenticated: true, token }));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setState(prev => ({ ...prev, isAuthenticated: false, token: null }));
    localStorage.removeItem('token');
  };

  const setAuthStatus = (status: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: status }));
  };

  const fetchParkingLots = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const lots = await getAvailableParkingLots();
      // Ensure the returned lots match our IParkingLot interface
      const validatedLots = lots.map(lot => ({
        id: lot.id,
        parkingId: lot.parkingId,
        lotNumber: lot.lotNumber || '',
        status: lot.status || 'available',
        vehicleType: lot.vehicleType || 'car',
        createdAt: lot.createdAt || new Date().toISOString(),
        updatedAt: lot.updatedAt || new Date().toISOString()
      }));

      // Type assertion to ensure TypeScript recognizes these as IParkingLot objects
      const typedLots = validatedLots as IParkingLot[];
      setState(prev => ({ ...prev, parkingLots: typedLots, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch parking lots' }));
    }
  };

  useEffect(() => {
    fetchParkingLots();
  }, []);

  return (
    <CommonContext.Provider
      value={{
        ...state,
        setSelectedParkingLot,
        fetchParkingLots,
        login,
        logout,
        setAuthStatus
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a CommonProvider');
  }
  return context;
};

export const useCommon = () => {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error('useCommon must be used within a CommonProvider');
  }
  return context;
};
