import { IsString, IsBoolean } from 'class-validator';

export class SearchDTO {
  @IsString()
  query?: string;

  @IsString()
  name?: string;

  @IsString()
  type?: string;

  @IsString()
  description?: string;

  @IsBoolean()
  inService?: boolean;

  @IsString()
  country?: string;

  @IsString()
  techSpecs?: string;
}
