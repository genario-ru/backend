export function parseFixedSignInOtps(rawValue: string | undefined) {
  if (!rawValue) {
    return new Map<string, string>();
  }

  const entries = rawValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  const parsedEntries = entries.map((entry) => {
    const [rawEmail, rawOtp, ...rest] = entry.split(":");
    const email = rawEmail?.trim().toLowerCase();
    const otp = rawOtp?.trim();

    if (!email || !otp || rest.length > 0) {
      throw new Error(
        `BETTER_AUTH_FIXED_SIGN_IN_OTPS entry "${entry}" must match email:otp`,
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      throw new Error(
        `BETTER_AUTH_FIXED_SIGN_IN_OTPS entry "${entry}" must use a 6-digit OTP`,
      );
    }

    return [email, otp] as const;
  });

  return new Map<string, string>(parsedEntries);
}

export function getFixedSignInOtp(
  fixedSignInOtps: Map<string, string>,
  email: string,
) {
  return fixedSignInOtps.get(email.trim().toLowerCase());
}
