export interface UserDTO {
    id: string,
    email: string,
    name: string | null,
    avatar: string | null,
    createdAt: Date,
    updatedAt: Date,
}
