import { redisStorage } from "@better-auth/redis-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, openAPI } from "better-auth/plugins";

import { TRUSTED_ORIGINS } from "@/constants/shared/api/trusted-origins";
import {
  APP_NAME,
  APP_NAME_CAPITALIZED,
} from "@/constants/shared/common/app-info";
import { db, schema } from "@/db";
import { redis } from "@/lib/redis";

export type AuthType = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

export const auth = betterAuth({
  appName: APP_NAME_CAPITALIZED,
  user: {
    deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  emailVerification: {
    // Required to send the verification email
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("sendVerificationEmail", {
        email: user.email,
        url,
        token,
      });
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secondaryStorage: redisStorage({
    client: redis,
    keyPrefix: "auth-api-rate-limit:", // optional, defaults to "better-auth:"
  }),
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
    customRules: {
      "/change-email": {
        window: 60,
        max: 1,
      },
      "/delete-user": {
        window: 60,
        max: 1,
      },
      "/get-session": {
        window: 60,
        max: 20,
      },
      "/email-otp/send-verification-otp": {
        window: 60,
        max: 1,
      },
      "/sign-in/email-otp": {
        window: 60,
        max: 3,
      },
      "/sign-out": {
        window: 60,
        max: 3,
      },
      "/update-user": {
        window: 60,
        max: 5,
      },
    },
  },
  plugins: [
    openAPI(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // TODO: Implement the sendVerificationOTP method to send the OTP to the user's email address
        console.log("sendVerificationOTP", { email, otp, type });
      },
    }),
    // An admin is any user assigned the admin role or any user whose ID is included in the adminUserIds option
    admin({
      defaultRole: "user", // Default
      adminRoles: ["admin"], // Default
      impersonationSessionDuration: 60 * 60, // 1 hour (Default)
      defaultBanReason: "Без причины", // Not default
      defaultBanExpiresIn: undefined, // Default
      bannedUserMessage: "Ваш аккаунт был заблокирован", // Not default
    }),
  ],
  trustedOrigins: TRUSTED_ORIGINS,
  advanced: {
    database: {
      generateId: false,
    },
    defaultCookieAttributes: {
      sameSite: "none",
    },
    crossSubDomainCookies: {
      enabled: true,
    },
    cookiePrefix: APP_NAME,
  },
});
