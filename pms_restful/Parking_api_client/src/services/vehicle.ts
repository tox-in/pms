import api from "../api";
import toast from "react-hot-toast";
import React from "react";
import { IVehicle, IMeta } from "../types";

// Interface for backend response structure
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Input interface for creating a vehicle (aligned with CreateVehicleDTO)
interface CreateVehicleInput {
  plate: string;
  model?: string;
  type?: "car" | "motorcycle" | "truck" | "van" | "suv";
  size?: "small" | "medium" | "large";
  color?: string;
}

// Input interface for updating a vehicle
interface UpdateVehicleInput {
  plate: string;
  model?: string | null;
  type?: "car" | "motorcycle" | "truck" | "van" | "suv" | null;
  size?: "small" | "medium" | "large" | null;
  color?: string | null;
}

/**
 * Create a new vehicle
 */
export const createVehicle = async ({
  vehicleData,
  setLoading,
  onSuccess,
}: {
  vehicleData: CreateVehicleInput;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (vehicle: IVehicle) => void;
}): Promise<IVehicle | null> => {
  try {
    setLoading(true);
    // Validate input to match CreateVehicleDTO
    if (!vehicleData.plate || typeof vehicleData.plate !== "string") {
      throw new Error("Plate is required and must be a string");
    }
    if (
      vehicleData.type &&
      !["car", "motorcycle", "truck", "van", "suv"].includes(vehicleData.type)
    ) {
      throw new Error("Type must be one of: car, motorcycle, truck, van, suv");
    }
    if (
      vehicleData.size &&
      !["small", "medium", "large"].includes(vehicleData.size)
    ) {
      throw new Error("Size must be one of: small, medium, large");
    }

    const response = await api.post<ApiResponse<IVehicle>>(
      "/vehicle/create",
      vehicleData
    );

    if (response.data.success) {
      toast.success(response.data.message || "Vehicle registered successfully");
      if (onSuccess) onSuccess(response.data.data);
      return response.data.data;
    }

    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Error registering vehicle";
    toast.error(errorMessage);
    return null;
  } finally {
    setLoading(false);
  }
};

/**
 * Get all vehicles for the authenticated user
 */
export const getMyVehicles = async ({
  page = 1,
  limit = 10,
  setLoading,
  setVehicles,
  setMeta,
  searchKey,
}: {
  page?: number;
  limit?: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setVehicles: React.Dispatch<React.SetStateAction<IVehicle[]>>;
  setMeta?: React.Dispatch<React.SetStateAction<IMeta>>;
  searchKey?: string;
}): Promise<void> => {
  try {
    setLoading(true);
    let url = `/vehicle/all?page=${page}&limit=${limit}`;
    if (searchKey) url += `&searchKey=${encodeURIComponent(searchKey)}`;

    const response = await api.get<
      ApiResponse<{ vehicles: IVehicle[]; meta: IMeta }>
    >(url);

    if (response.data.success) {
      setVehicles(response.data.data.vehicles);
      if (setMeta) setMeta(response.data.data.meta);
    } else {
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      window.location.replace("/auth/login");
      return;
    }
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Error fetching vehicles";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

/**
 * Update a vehicle
 */
export const updateVehicle = async ({
  vehicleId,
  vehicleData,
  setLoading,
  onSuccess,
}: {
  vehicleId: number;
  vehicleData: UpdateVehicleInput;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (vehicle: IVehicle) => void;
}): Promise<IVehicle | null> => {
  try {
    setLoading(true);
    // Validations
    if (!Number.isInteger(vehicleId)) {
      throw new Error("Vehicle ID must be an integer");
    }
    if (!vehicleData.plate || typeof vehicleData.plate !== "string") {
      throw new Error("Plate is required and must be a string");
    }
    if (
      vehicleData.type &&
      vehicleData.type !== null &&
      !["car", "motorcycle", "truck", "van", "suv"].includes(vehicleData.type)
    ) {
      throw new Error(
        "Type must be one of: car, motorcycle, truck, van, suv, or null"
      );
    }
    if (
      vehicleData.size &&
      vehicleData.size !== null &&
      !["small", "medium", "large"].includes(vehicleData.size)
    ) {
      throw new Error("Size must be one of: small, medium, large, or null");
    }

    const response = await api.put<ApiResponse<{ vehicle: IVehicle }>>(
      `/vehicle/${vehicleId}`,
      vehicleData
    );

    if (response.data.success) {
      toast.success(response.data.message || "Vehicle updated successfully");
      if (onSuccess) onSuccess(response.data.data.vehicle);
      return response.data.data.vehicle;
    }

    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Error updating vehicle";
    toast.error(errorMessage);
    return null;
  } finally {
    setLoading(false);
  }
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async ({
  vehicleId,
  setLoading,
  onSuccess,
}: {
  vehicleId: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
}): Promise<boolean> => {
  try {
    setLoading(true);
    if (!Number.isInteger(vehicleId)) {
      throw new Error("Vehicle ID must be an integer");
    }

    const response = await api.delete<ApiResponse<null>>(
      `/vehicle/${vehicleId}`
    );

    if (response.data.success) {
      toast.success(response.data.message || "Vehicle deleted successfully");
      if (onSuccess) onSuccess();
      return true;
    }

    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Error deleting vehicle";
    toast.error(errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};

/**
 * Get a single vehicle by ID
 */
export const getVehicleById = async ({
  vehicleId,
  setLoading,
  onSuccess,
}: {
  vehicleId: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: (vehicle: IVehicle) => void;
}): Promise<IVehicle | null> => {
  try {
    setLoading(true);
    if (!Number.isInteger(vehicleId)) {
      throw new Error("Vehicle ID must be an integer");
    }

    const response = await api.get<ApiResponse<IVehicle>>(
      `/vehicle/${vehicleId}`
    );

    if (response.data.success) {
      if (onSuccess) onSuccess(response.data.data);
      return response.data.data;
    }

    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error.message ||
      "Error fetching vehicle details";
    toast.error(errorMessage);
    return null;
  } finally {
    setLoading(false);
  }
};
