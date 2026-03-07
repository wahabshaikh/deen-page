import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      xHandle: {
        type: "string",
        required: false,
      },
    },
  },
  account: {
    // Avoid storing OAuth tokens in cookies (prevents 431 after login)
    storeAccountCookie: false,
  },
  socialProviders: {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      mapProfileToUser: (profile) => ({
        xHandle: profile.data.username ?? null,
      }),
    },
  },
  session: {
    // Disable cookie cache so only the small session token is sent.
    // session_data cookie (session + user) can exceed ~8KB and cause HTTP 431 with plain `next dev`.
    cookieCache: {
      enabled: false,
    },
  },
});
