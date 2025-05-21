import { IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class CreateParkingSessionDTO {
  @IsInt()
  @IsNotEmpty()
  vehicleId: number;

  @IsInt()
  @IsNotEmpty()
  parkingId: number;

  @IsOptional()
  @IsInt()
  userId?: number;
}
