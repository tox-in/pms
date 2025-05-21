import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsPositive,
} from "class-validator";
import { ParkingStatus } from "@prisma/client";

export class CreateParkingDTO {
  @IsString()
  @IsNotEmpty()
  parkingCode: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  totalSpaces: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  feePerHour?: number;

  @IsOptional()
  @IsString()
  @IsIn(["AVAILABLE", "MAINTAINANCE", "FULL"])
  status?: ParkingStatus;
}
