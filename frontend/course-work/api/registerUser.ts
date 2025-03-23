import { IUser } from "@/types/user.interface";
import axios, { AxiosError } from "axios";

export const registerUser = async (email: string, name: string, password: string): Promise<IUser> => {
    try {
        const response = await axios.post<IUser>('/api/user', { email, name, password });
        return response.data;
    } catch (err) {
        const error = err as AxiosError<{message: string}>;
        console.error(error);
        throw new Error(error.response?.data?.message || "Failed to register user");
    }
};

export const loginUser = async (email: string, password: string): Promise<IUser> => {
    try {
        const response = await axios.post<IUser>('/api/auth/login', { email, password });
        return response.data;
    }catch(err) {
        const error = err as AxiosError<{message: string}>;
        console.error(error);
        throw new Error(error.response?.data?.message || "Failed to login");
    }
}