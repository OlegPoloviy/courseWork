export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}
