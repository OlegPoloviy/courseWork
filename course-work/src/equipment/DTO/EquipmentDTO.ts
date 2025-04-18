import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsYear', async: false })
class IsYearConstraint implements ValidatorConstraintInterface {
  validate(year: number, args: ValidationArguments) {
    const currentYear = new Date().getFullYear();
    return typeof year === 'number' && year >= 1900 && year <= currentYear;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Year must be a number between 1900 and the current year';
  }
}

// ===== DTO =====
export class EquipmentDTO {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  country: string;

  @IsBoolean()
  inService: boolean;

  @IsOptional()
  @IsString()
  description?: string | null | undefined;

  @IsOptional()
  @IsNumber()
  @Validate(IsYearConstraint)
  year?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
