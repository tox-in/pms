import { createContext, useState, useEffect } from "react";
import { useDispatch } from "react-redux"; // Corrected import for useDispatch
import { Dispatch } from "@reduxjs/toolkit";
// Assuming you have these types defined in your types.ts
import { IVehicle, IParking, IParkingSession, IMeta, IUser } from "./types";

// Import from the newly structured service files
import { logout } from "../services/auth";
import { fetchUserProfile } from "../services/user";
import { getMyVehicles } from "../services/vehicle";
import { getMyParkings } from "../services/parking";
import { getMySessions } from "../services/parkingSession";

interface CommonContextProps {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateVehicle: boolean;
  setShowCreateVehicle: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateParkingSlot: boolean;
  setShowCreateParkingSlot: React.Dispatch<React.SetStateAction<boolean>>;
  showRequestParkingSlot: boolean;
  setShowRequestParkingSlot: React.Dispatch<React.SetStateAction<boolean>>;
  user: IUser | null;
  vehicles: IVehicle[];
  parkings: IParking[];
  sessions: IParkingSession[];
  loading: boolean;
  refreshData: () => void;
  logoutUser: () => void;
}

export const CommonContext = createContext<CommonContextProps>(
  {} as CommonContextProps
);

export const CommonProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch: Dispatch = useDispatch();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [showCreateParkingSlot, setShowCreateParkingSlot] = useState(false);
  const [showRequestParkingSlot, setShowRequestDetection] = useState(false); // Corrected variable name
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [parkings, setParkings] = useState<IParking[]>([]);
  const [sessions, setSessions] = useState<IParkingSession[]>([]);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Consolidated loading state for data fetching
  const refreshData = async () => {
    setLoading(true);
    try {
      // Pass the local setLoading and set functions for data updates
      await Promise.all([
        getMyVehicles({ setLoading: () => {}, setVehicles }), // Each function manages its own loading internally now
        getMyParkings({ setLoading: () => {}, setParkings }),
        getMySessions({ setLoading: () => {}, setSessions }),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Specific error handling for the context if needed
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const userData = await fetchUserProfile();
      if (userData) {
        setUser(userData);
      } else {
        // If fetchUserProfile returns null, user profile failed to load, log out
        logoutUser();
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      logoutUser(); // Log out on any error during profile fetch
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    logout(); // Calls the centralized logout function
    setUser(null); // Clear user state in context
    // The logout function already handles redirection
  };

  useEffect(() => {
    loadUserProfile();
    refreshData();
  }, []); // Empty dependency array to run once on component mount

  return (
    <CommonContext.Provider
      value={{
        showSidebar,
        setShowSidebar,
        showCreateVehicle,
        setShowCreateVehicle,
        showCreateParkingSlot,
        setShowCreateParkingSlot,
        showRequestParkingSlot,
        setShowRequestDetection,
        user,
        vehicles,
        parkings,
        sessions,
        loading,
        refreshData,
        logoutUser,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};
