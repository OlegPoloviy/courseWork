import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing username or password");
                }

                try {
                    const res = await fetch("http://localhost:3001/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.username,
                            password: credentials.password,
                        }),
                    });

                    const data = await res.json();
                    console.log("API Response:", data);

                    // Extract the user object
                    const user = data.user;

                    if (!res.ok || !user || !user.id) {
                        throw new Error(data.message || "Invalid credentials");
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.avatar,
                        accessToken: data.tokens.accessToken,
                    };
                } catch (error) {
                    console.error("Login error:", error);
                    throw new Error("Authentication failed");
                }
            }

        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
