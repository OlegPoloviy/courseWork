import { IUser } from "@/types/user.interface";
import axios from "axios";

export const registerUser = async (email: string, name: string, password: string): Promise<IUser> => {
    try {
        const response = await axios.post<IUser>('/api/user', { email, name, password });
        return response.data;
    } catch (err) {
        console.error(err);
        throw new Error("Failed to register user");
    }
};

export const loginUser = async (email: string, password: string): Promise<IUser> => {
    try {
        const response = await axios.post<IUser>('/api/user/login', { email, password });
        return response.data;
    }catch(err) {
        console.error(err);
        throw new Error("Failed to login user");
    }
}