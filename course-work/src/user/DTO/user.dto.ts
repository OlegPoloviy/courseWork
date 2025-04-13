import { IsBoolean, IsEmail, IsString, Max, Min } from 'class-validator';

export class UserDTO {
  id: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @Max(24)
  name: string | null;
  avatar?: string | null;

  @IsBoolean()
  isAdmin?: boolean | null;

  @Min(6)
  @Max(36)
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
