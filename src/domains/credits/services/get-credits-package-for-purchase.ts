import { db } from "@/db";

type GetCreditsPackageForPurchaseParams = {
  creditsPackageSlug: string;
};

export async function getCreditsPackageForPurchase({
  creditsPackageSlug,
}: GetCreditsPackageForPurchaseParams) {
  const foundCreditsPackage = await db.query.creditsPackage.findFirst({
    where: (creditsPackage, { eq, and }) =>
      and(
        eq(creditsPackage.slug, creditsPackageSlug),
        eq(creditsPackage.forPurchase, true),
      ),
  });

  return foundCreditsPackage;
}
