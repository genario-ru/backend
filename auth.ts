import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, openAPI } from "better-auth/plugins";

import { TRUSTED_ORIGINS } from "@/constants/api/trusted-origins";
import { APP_NAME, APP_NAME_CAPITALIZED } from "@/constants/common/app-info";
import { envs } from "@/constants/common/envs";
import { db, schema } from "@/db";

export type AuthType = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

const isProduction = envs.NODE_ENV === "production";

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
  rateLimit: {
    customRules: {
      // Restrict the number of requests to send change email confirmation
      "/change-email": {
        window: 60,
        max: 1,
      },
      "/email-otp/send-verification-otp": {
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
      sameSite: isProduction ? "none" : "lax",
    },
    crossSubDomainCookies: {
      enabled: true,
    },
    cookiePrefix: APP_NAME,
  },
});
