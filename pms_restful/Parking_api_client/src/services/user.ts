import api from "../api";
import { RegisterInputs, UpdateInputs, IUser } from "../types";
import { toast } from "react-hot-toast";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createUser = async ({
  setLoading,
  data,
}: {
  data: RegisterInputs;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}): Promise<boolean> => {
  try {
    setLoading(true);
    const url = "/user/create";
    const response = await api.post<ApiResponse<IUser>>(url, { ...data });
    if (response.data.success) {
      toast.success(response.data.message || "User created successfully");
      setTimeout(() => {
        window.location.replace("/auth/login");
      }, 1000);
      return true;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Error creating your account";
    toast.error(errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};

export const updateUser = async ({
  setLoading,
  data,
}: {
  data: UpdateInputs;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}): Promise<boolean> => {
  try {
    setLoading(true);
    const url = "/user/update";
    const response = await api.put<ApiResponse<IUser>>(url, { ...data }); // Assuming PUT for updates
    if (response.data.success) {
      toast.success(response.data.message || "User updated successfully");
      return true;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || "Error updating your account";
    toast.error(errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};

export const fetchUserProfile = async (): Promise<IUser | null> => {
  try {
    const response = await api.get<ApiResponse<IUser>>("/user/profile");
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    console.error(
      "Error fetching user profile:",
      error?.response?.data?.message || error.message
    );
    return null;
  }
};
