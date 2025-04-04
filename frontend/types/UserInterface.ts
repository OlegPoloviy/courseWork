export interface IUser{
    id: string,
    email: string,
    name?: string,
    avatar?: string,
}

export interface ITokens{
    accessToken: string,
    refreshToken: string
}