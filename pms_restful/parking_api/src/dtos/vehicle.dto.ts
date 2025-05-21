import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";

export class CreateVehicleDTO {
  @IsString()
  @IsNotEmpty()
  plate: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  @IsIn(["car", "motorcycle", "truck", "van", "suv"], {
    message: "Type must be one of: car, motorcycle, truck, van, suv",
  })
  type?: string;

  @IsOptional()
  @IsString()
  @IsIn(["small", "medium", "large"], {
    message: "Size must be one of: small, medium, large",
  })
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
