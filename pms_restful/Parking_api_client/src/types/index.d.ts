export interface TimestampAudit {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends TimestampAudit {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
}

export interface IVehicle extends TimestampAudit {
  id?: number | null;
  userId: number;
  plate: string;
  model: string | null;
  type: "car" | "motorcycle" | "truck" | null;
  size: "small" | "medium" | "large" | null;
  color?: string | null;
}

export interface ILoginData {
  email: string;
  password: string;
}

export interface IMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number;
  next: number;
}

export type RegisterInputs = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
};

export interface UpdateInputs {
  firstName?: string;
  lastName?: string;
  oldPassword?: string;
  newPassword?: string;
}

export interface IParking extends TimestampAudit {
  id: number;
  parkingCode: string;
  name: string;
  size: "small" | "medium" | "large" | null; // Aligned with CreateVehicleDTO size
  vehicleType: "car" | "motorcycle" | "truck" | "van" | "suv" | null; // Aligned with CreateVehicleDTO type
  location: string | null;
  status: "available" | "unavailable";
  feePerHour: number; // Added to match backend controller's fee calculation
  availableSpaces: number; // Added to match backend parking updates
}

export interface ITicket {
  id: number;
  sessionId: number;
  createdAt: Date;
}

export interface IBill {
  id: number;
  sessionId: number;
  userId: number;
  vehicleId: number;
  parkingId: number;
  totalAmount: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  createdAt: Date;
}

export interface IParkingSession extends TimestampAudit {
  id: number;
  userId: number;
  vehicleId: number;
  parkingId: number;
  parkingSlotId: number | null; // Maps to parkingLotId in backend
  status: "ACTIVE" | "COMPLETED"; // Aligned with backend controller
  entryTime: Date;
  exitTime: Date | null;
  durationMinutes: number | null;
  totalAmount: number | null;
  vehicle: {
    plate: string;
    model: string | null;
  };
  parking: {
    parkingCode: string;
  } | null;
}
