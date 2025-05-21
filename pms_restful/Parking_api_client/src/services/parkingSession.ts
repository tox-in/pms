import api from "../api";
import toast from "react-hot-toast";
import React from "react";
import {
  IParkingSession,
  IMeta,
  IVehicle,
  IParking,
  ITicket,
  IBill,
} from "../types";
import { IParkingLot } from "../types/index";
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Input interface for starting a parking session
interface StartSessionInput {
  vehicleId: number;
  parkingId: number;
  userId?: number;
}

// Response interfaces
interface StartSessionResponse {
  session: IParkingSession;
  ticket: ITicket;
}

interface EndSessionResponse {
  session: IParkingSession;
  bill: IBill;
}

interface SessionDetailsResponse extends IParkingSession {
  vehicle: IVehicle;
  parking: IParking;
  parkingLot: IParkingLot;
  user?: any;
  ticket?: ITicket;
  bill?: IBill;
}

interface SessionsResponse {
  sessions: IParkingSession[];
  meta?: IMeta;
}

// Start a new parking session (vehicle entry)
export const startParkingSession = async ({
  vehicleId,
  parkingId,
  parkingLotId,
  setLoading,
  onSuccess,
}: {
  vehicleId: number;
  parkingId: number;
  parkingLotId: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (data: StartSessionResponse) => void;
}): Promise<StartSessionResponse | null> => {
  try {
    setLoading(true);

    // Validate required fields
    if (!vehicleId || !parkingId || !parkingLotId) {
      throw new Error("Vehicle ID, Parking ID, and Parking Lot ID are required");
    }

    const response = await api.post<ApiResponse<StartSessionResponse>>(
      '/parking-session/create',
      {
        vehicleId,
        parkingId,
        parkingLotId,
      }
    );

    if (response.data.success) {
      toast.success(
        response.data.message || "Vehicle entered parking successfully"
      );
      if (onSuccess) onSuccess(response.data.data);
      return response.data.data;
    }

    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Error entering vehicle into parking";
    toast.error(errorMessage);
    return null;
  } finally {
    setLoading(false);
  }
};

// End a parking session (vehicle exit)
// End a parking session
export const endParkingSession = async ({
  sessionId,
  setLoading,
  onSuccess,
}: {
  sessionId: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (data: EndSessionResponse) => void;
}): Promise<EndSessionResponse | null> => {
  try {
    setLoading(true);
    const response = await api.put<ApiResponse<EndSessionResponse>>(
      `/parking-session/${sessionId}/end`
    );

    if (response.data.success) {
      toast.success(
        response.data.message || "Parking session completed successfully"
      );
      if (onSuccess) onSuccess(response.data.data);
      return response.data.data;
    }

    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Error ending parking session";
    toast.error(errorMessage);
    return null; // Return null on error
  } finally {
    setLoading(false);
  }
};

// Get all parking sessions for the authenticated user (new function)
export const getMySessions = async ({
  page = 1,
  limit = 10,
  setLoading,
  setSessions,
  setMeta,
  searchKey,
}: {
  page?: number;
  limit?: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSessions: React.Dispatch<React.SetStateAction<IParkingSession[]>>;
  setMeta?: React.Dispatch<React.SetStateAction<IMeta>>;
  searchKey?: string;
}): Promise<void> => {
  try {
    setLoading(true);
    let url = `/parking-session/my-sessions?page=${page}&limit=${limit}`; // Assuming an endpoint for user-specific sessions
    if (searchKey) url += `&searchKey=${encodeURIComponent(searchKey)}`;

    const response = await api.get<ApiResponse<SessionsResponse>>(url);

    if (response.data.success) {
      setSessions(response.data.data.sessions);
      if (setMeta && response.data.data.meta) {
        setMeta(response.data.data.meta);
      }
    } else {
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.replace("/auth/login");
      return;
    }
    const errorMessage =
      error?.response?.data?.message || "Error fetching your sessions";
    toast.error(errorMessage);
    throw new Error(errorMessage); // Propagate error for `Promise.all` in context
  } finally {
    setLoading(false);
  }
};

// Get all active parking sessions
export const getActiveParkingSessions = async ({
  page = 1,
  limit = 10,
  setLoading,
  setSessions,
  setMeta,
  searchKey,
}: {
  page?: number;
  limit?: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSessions: React.Dispatch<React.SetStateAction<IParkingSession[]>>;
  setMeta?: React.Dispatch<React.SetStateAction<IMeta>>;
  searchKey?: string;
}): Promise<void> => {
  try {
    setLoading(true);
    let url = `/parking-session/active?page=${page}&limit=${limit}`;
    if (searchKey) url += `&searchKey=${encodeURIComponent(searchKey)}`;

    const response = await api.get<ApiResponse<SessionsResponse>>(url);

    if (response.data.success) {
      setSessions(response.data.data.sessions);
      if (setMeta && response.data.data.meta) {
        setMeta(response.data.data.meta);
      }
    } else {
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.replace("/auth/login");
      return;
    }
    const errorMessage =
      error?.response?.data?.message || "Error fetching active sessions";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

// Get parking session details
export const getParkingSessionDetails = async ({
  sessionId,
  setLoading,
  onSuccess,
}: {
  sessionId: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (data: SessionDetailsResponse) => void;
}): Promise<SessionDetailsResponse | null> => {
  try {
    setLoading(true);
    const response = await api.get<ApiResponse<SessionDetailsResponse>>(
      `/parking-session/${sessionId}`
    );

    if (response.data.success) {
      if (onSuccess) onSuccess(response.data.data);
      return response.data.data;
    }

    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Error fetching session details";
    toast.error(errorMessage);
    return null; // Return null on error
  } finally {
    setLoading(false);
  }
};

// Get sessions by parking ID with optional filters
export const getSessionsByParking = async ({
  parkingId,
  status,
  date,
  setLoading,
  setSessions,
  onSuccess,
}: {
  parkingId: number;
  status?: string;
  date?: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setSessions: React.Dispatch<React.SetStateAction<IParkingSession[]>>;
  onSuccess?: (data: IParkingSession[]) => void;
}): Promise<void> => {
  try {
    setLoading(true);
    let url = `/parking-session/parking/${parkingId}`;
    const params = new URLSearchParams();

    if (status) params.append("status", status);
    if (date) params.append("date", date);

    if (params.toString()) url += `?${params.toString()}`;

    const response = await api.get<
      ApiResponse<{ sessions: IParkingSession[] }>
    >(url);

    if (response.data.success) {
      const sessions = response.data.data.sessions;
      setSessions(sessions);
      if (onSuccess) onSuccess(sessions);
    } else {
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Error fetching parking sessions";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};
