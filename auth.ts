import { redisStorage } from "@better-auth/redis-storage";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";

import { db, schema } from "@/db";
import { sendEmail } from "@/domains/mail/services/send-email";
import { redis } from "@/lib/redis";
import { TRUSTED_ORIGINS } from "@/shared/constants/api/trusted-origins";
import {
  APP_NAME,
  APP_NAME_CAPITALIZED,
} from "@/shared/constants/common/app-info";

export type AuthType = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

export const auth = betterAuth({
  basePath: "/api/v1/auth",
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
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendEmail({
        to: user.email,
        userId: user.id,
        templateKey: "email_verification",
        payload: { url, token },
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
    emailOTP({
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmail({
          to: email,
          templateKey: "otp",
          payload: { otp, type },
        });
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
