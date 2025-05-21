export interface IParking {
  id: number;
  parkingCode: string;
  name: string;
  totalSpaces: number;
  availableSpaces: number;
  location: string;
  feePerHour: number;
  status: "available" | "maintenance" | "full";
  createdAt: string;
  updatedAt: string;
}

export interface IParkingLot {
  id: number;
  parkingId: number;
  lotNumber: string;
  status: "available" | "occupied" | "reserved";
  vehicleType: "car" | "motorcycle" | "truck";
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface CreateParkingInput {
  parkingCode: string;
  name: string;
  totalSpaces: number;
  location: string;
  feePerHour: number;
  status?: "available" | "maintenance" | "full";
}

export interface UpdateParkingInput {
  parkingCode?: string;
  name?: string;
  location?: string;
  feePerHour?: number;
  status?: "available" | "maintenance" | "full";
}
