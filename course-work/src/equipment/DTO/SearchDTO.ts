import { IsString, IsBoolean } from 'class-validator';

export class SearchDTO {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  country: string;

  @IsBoolean()
  inService: boolean;

  @IsString()
  description: string;

  @IsString()
  techSpecs: string;
}
