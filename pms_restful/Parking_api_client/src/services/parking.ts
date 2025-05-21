import api from "../api";
import { toast } from "react-hot-toast";
import { IParking, Meta } from "../types/index";
import { IParkingLot } from "../types/index";
import { Dispatch, SetStateAction } from "react";

class APIError extends Error {
  constructor(message: string, public response?: ApiResponse<unknown>) {
    super(message);
    this.name = "APIError";
  }
}

// Generic backend response interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Input DTOs
interface CreateParkingInput {
  parkingCode: string;
  name?: string;
  totalSpaces: number;
  location?: string;
  feePerHour?: number;
  status?: "available" | "maintainance" | "full";
}

interface UpdateParkingInput {
  parkingCode?: string;
  name?: string;
  location?: string;
  feePerHour?: number;
  status?: "available" | "maintainance" | "full";
}

// CREATE PARKING
export const createParking = async ({
  parkingData,
  setLoading,
  setShowCreateParking,
}: {
  parkingData: CreateParkingInput;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateParking?: React.Dispatch<React.SetStateAction<boolean>>;
}): Promise<IParking | null> => {
  try {
    setLoading(true);

    // Validate required fields
    if (!parkingData.parkingCode || !parkingData.name || !parkingData.totalSpaces || !parkingData.location || !parkingData.feePerHour) {
      throw new Error("All required fields must be provided");
    }

    const response = await api.post<ApiResponse<IParking>>(
      "/parking/create",
      parkingData
    );

    if (response.data.success) {
      toast.success(response.data.message);
      setShowCreateParking?.(false);
      return response.data.data;
    }

    throw new Error(response.data.message);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMessage = error.message || "Error creating parking facility";
      toast.error(errorMessage);
      return null;
    }
    throw new Error("Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

// Get all parking facilities
export const getMyParkings = async ({
  page = 1,
  limit = 10,
  searchKey,
  setLoading,
  setMeta,
  setParkings,
}: {
  page?: number;
  limit?: number;
  searchKey?: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMeta?: React.Dispatch<React.SetStateAction<Meta | null>>;
  setParkings: React.Dispatch<React.SetStateAction<IParking[]>>;
}): Promise<void> => {
  try {
    setLoading(true);

    const response = await api.get<ApiResponse<{
      parkings: IParking[];
      meta: Meta;
    }>>(
      `/parking/all?page=${page}&limit=${limit}${searchKey ? `&searchKey=${encodeURIComponent(searchKey)}` : ''}`
    );

    if (response.data.success) {
      setParkings(response.data.data.parkings);
      if (setMeta) setMeta(response.data.data.meta);
    } else {
      throw new Error(response.data.message);
    }
    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Check if error has response property
      const hasResponse = 'response' in error;
      
      if (hasResponse && ((error as { response: { status: number } }).response?.status === 401)) {
        window.location.replace("/auth/login");
        return;
      }
      
      // Type assertion for error with response data
      const errorWithResponse = error as { 
        response?: { 
          data?: { 
            message: string 
          } 
        }, 
        message: string 
      };
      
      const errorMessage =
        hasResponse && errorWithResponse.response?.data?.message 
          ? errorWithResponse.response.data.message 
          : errorWithResponse.message || "Failed to fetch parking facilities";
      
      toast.error(errorMessage);
      throw error;
    }
    throw new Error("Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

// Update parking facility
export const updateParking = async ({
  parkingId,
  data,
  setLoading,
}: {
  parkingId: number;
  data: UpdateParkingInput;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}): Promise<IParking | null> => {
  try {
    setLoading(true);

    // Validate parking ID
    if (!parkingId) {
      throw new Error("Parking ID is required");
    }

    const response = await api.put<ApiResponse<IParking>>(
      `/parking/${parkingId}`,
      data
    );

    if (response.data.success) {
      toast.success("Parking updated successfully");
      return response.data.data;
    }

    throw new Error(response.data.message);
  } catch (error: unknown) {
    if (error instanceof APIError) {
      const errorMessage =
        error.response?.data?.message || "Error updating parking facility";
      toast.error(errorMessage);
      return null;
    } else if (error instanceof Error) {
      toast.error(error.message);
      return null;
    }
    throw new Error("Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

// Delete parking facility
export const deleteParking = async ({
  parkingId,
  setLoading,
}: {
  parkingId: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}): Promise<boolean> => {
  try {
    setLoading(true);

    // Validate parking ID
    if (!parkingId) {
      throw new Error("Parking ID is required");
    }

    const response = await api.delete<ApiResponse<null>>(
      `/parking/${parkingId}`
    );

    if (response.data.success) {
      toast.success(response.data.message);
      return true;
    }

    throw new Error(response.data.message);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMessage = error.message || "Error deleting parking facility";
      toast.error(errorMessage);
      return false;
    }
    throw new Error("Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

// Get parking facilities with all lots
export const getParkingWithLots = async ({
  parkingId,
  setLoading,
  setParking,
}: {
  parkingId: number;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setParking: Dispatch<SetStateAction<IParking[]>>;
}): Promise<void> => {
  try {
    setLoading(true);

    // Validate parking ID
    if (!parkingId) {
      throw new Error("Parking ID is required");
    }

    const response = await api.get<ApiResponse<IParking>>(
      `/parking/${parkingId}/lots`
    );

    if (response.data.success) {
      setParking([response.data.data]);
    } else {
      throw new APIError(response.data.message, {
        success: false,
        message: response.data.message,
        data: null
      });
    }
    return;
  } catch (error: unknown) {
    if (error instanceof APIError) {
      const errorMessage = error.message || "Error fetching parking lots";
      toast.error(errorMessage);
      throw error;
    }
    if (error instanceof Error) {
      toast.error(error.message || "Error fetching parking lots");
      throw error;
    }
    throw new Error("Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};

// Get available parking lots
export const getAvailableParkingLots = async (parkingId?: number): Promise<IParkingLot[]> => {
  try {
    const response = await api.get<ApiResponse<IParkingLot[]>>(
      "/parking/available-lots",
      {
        params: parkingId ? { parkingId } : {},
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof APIError) {
      const errorMessage =
        error.response?.message || "Error fetching available parking lots";
      toast.error(errorMessage);
      throw error;
    }
    throw new Error("Unexpected error occurred");
  }
};
