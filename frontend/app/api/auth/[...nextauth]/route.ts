import NextAuth, {
  AuthOptions,
  Session,
  TokenSet,
  User,
  DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    isAdmin: boolean;
    accessToken?: string;
  }
}

interface CustomToken extends TokenSet {
  id?: string;
  isAdmin?: boolean;
  accessToken?: string;
}

const authOptions: AuthOptions = {
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
            isAdmin: user.isAdmin,
            image: user.avatar,
            accessToken: data.tokens.accessToken,
          };
        } catch (error) {
          console.error("Login error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: CustomToken; user: User | null }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: CustomToken;
    }) {
      if (session.user) {
        session.user.id = token.id || "";
        session.accessToken = token.accessToken;
        session.user.isAdmin = token.isAdmin || false;
      }
      return session;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If no callbackUrl is provided, redirect to dashboard
      if (url === baseUrl) {
        return `/home`;
      }
      // Allows relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
