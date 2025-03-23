'use client'
import React, { createContext, useContext, useEffect, useState } from "react";
import {useRouter} from "next/navigation";
import axios from "axios";
import { setCookie, parseCookies, destroyCookie } from 'nookies';

interface IAuthContextType {
    isAuthenticated: boolean;
    user: any;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextType>({} as IAuthContextType);

export const AuthProvider : React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user,setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    const api = axios.create({
        baseURL: 'http://localhost:3001',
        withCredentials: true
    })

    api.interceptors.response.use(
        (response) => response,
        async(error) => {
            const originalRequest = error.config;


            if(error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {

                    const response = await axios.post('http://localhost:3001/auth/refresh', {}, {
                        withCredentials: true
                    });

                    const {access_token} = response.data; // Only get the access token

                    setCookie(null,'access_token', access_token, {
                        maxAge: 60 * 60,
                        path: '/',
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict'
                    });



                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                } catch(err) {
                    await logout();
                    return Promise.reject(err);
                }
            }
            return Promise.reject(error);

        }

    )

    useEffect(() => {
        const loadUserFromCookies = async () => {
            const cookies  = parseCookies();
            const token = cookies.access_token;

            if(token){
                try{
                    api.defaults.headers.Authorization = `Bearer ${token}`;
                    const { data } = await api.get('/user/profile');

                    setUser(data);
                    setIsAuthenticated(true);
                }catch(err){
                    destroyCookie(null, 'access_token', { path: '/' });
                }
            }
        }
        loadUserFromCookies();
    }, []);

    // On the client side, you would only handle the access token
    const login = async (email: string, password: string) => {
        try {
            const {data} = await axios.post('http://localhost:3001/auth/login', {
                email,
                password,
            }, {
                withCredentials: true
            });

            const {access_token} = data;

            setCookie(null, 'access_token', access_token, {
                maxAge: 15 * 60,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });


            api.defaults.headers.Authorization = `Bearer ${access_token}`;
            const userResponse = await api.get('/user/profile');

            setUser(userResponse.data);
            setIsAuthenticated(true);

            router.push('/home');
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout API call failed', error);
        } finally {
            destroyCookie(null, 'access_token', { path: '/' });

            setUser(null);
            setIsAuthenticated(false);

            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

 }

export const useAuth = () => useContext(AuthContext);