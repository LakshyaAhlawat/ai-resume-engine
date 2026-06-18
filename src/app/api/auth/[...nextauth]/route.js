import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";

const oauthProviders = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  oauthProviders.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || "",
          image: user.avatar_url || "",
          role: user.role || "",
        };
      }
    }),
    ...oauthProviders,
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "github" && account?.provider !== "google") {
        return true;
      }
      if (!user?.email) {
        return false;
      }

      await dbConnect();

      let dbUser = await User.findOne({ email: user.email });
      if (!dbUser) {
        const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
        dbUser = await User.create({
          email: user.email,
          password: randomPassword,
          name: user.name || "",
          avatar_url: user.image || "",
        });
      }

      // Carry the real Mongo _id forward so jwt/session callbacks and
      // Candidate.user_id ownership scoping work identically to credentials login.
      user.id = dbUser._id.toString();
      user.role = dbUser.role || "";
      user.image = dbUser.avatar_url || user.image || "";

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.picture = session.user.image ?? token.picture;
        token.role = session.user.role ?? token.role;
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_please_change_in_production",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
