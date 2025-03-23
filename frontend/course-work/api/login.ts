import {NextApiRequest,NextApiResponse} from "next";
import axios from 'axios';
import { setCookie } from 'nookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        const response = await axios.post('http://localhost:3001/auth/login', {
            email,
            password,
        });

        const { access_token, refresh_token } = response.data;

        setCookie({ res }, 'access_token', access_token, {
            maxAge: 60 * 60,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        setCookie({ res }, 'refresh_token', refresh_token, {
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            httpOnly: true,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Login failed:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
}