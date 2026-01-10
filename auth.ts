import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, openAPI } from "better-auth/plugins";

import { APP_NAME, APP_NAME_CAPITALIZED } from "@/constants/common/app-info";
import { db, schema } from "@/db";

export type AuthType = {
  user: typeof auth.$Infer.Session.user;
  session: typeof auth.$Infer.Session.session;
};

export const auth = betterAuth({
  appName: APP_NAME_CAPITALIZED,
  user: {
    deleteUser: { enabled: true },
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  emailVerification: {
    enabled: true,
    async onEmailVerification(user, _request) {
      console.log("onEmailVerification", { email: user.email });
    },
    async sendVerificationEmail({ user, url }) {
      console.log("sendVerificationEmail", { email: user.email, url });
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  rateLimit: {
    // enabled: true, // Включаем для режима development
    customRules: {
      // Ограничеваем количество запросов на отправку писем
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
        console.log("sendVerificationOTP", { email, otp, type });
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
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
  trustedOrigins: ["http://localhost:5173", "https://app.genario.ru"],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
    },
    crossSubDomainCookies: {
      enabled: true,
    },
    generateId: false,
    cookiePrefix: APP_NAME,
  },
});
