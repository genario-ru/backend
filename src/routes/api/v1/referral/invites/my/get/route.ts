import { and, asc, desc, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
} from "@/constants/shared/api/defaults";
import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { referralInvite } from "@/db/schema";
import { DEFAULT_REFERRAL_INVITE_SORT } from "@/domains/referral/schemas/entities/referral-invite-sort";
import { getMyReferralInvitesQuerySchema } from "@/domains/referral/schemas/handlers/get-my-referral-invites/query";
import {
  type GetMyReferralInvitesResponse,
  getMyReferralInvitesResponseSchema,
} from "@/domains/referral/schemas/handlers/get-my-referral-invites/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

import {
  DEFAULT_REFERRAL_INVITE_SORT_MAP,
  REFERRAL_INVITE_SORT_MAP,
} from "./constants";

export const getMyReferralInvitesRoute = createHonoApp().basePath(
  "/referral/invites/my",
);

// GET /api/v1/referral/invites/my
getMyReferralInvitesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-referral-invites",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Referral],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My referral invites retrieved successfully",
        schema: getMyReferralInvitesResponseSchema,
      }),
    },
  }),
  validator("query", getMyReferralInvitesQuerySchema),
  async (c) => {
    const user = c.get("user");

    const {
      page = DEFAULT_PAGE,
      perPage = DEFAULT_PER_PAGE,
      sort,
    } = c.req.valid("query");

    const whereConditions = [eq(referralInvite.referralSourceUserId, user.id)];
    const sortValue = sort ?? DEFAULT_REFERRAL_INVITE_SORT;

    const { sortBy, sortOrder } =
      REFERRAL_INVITE_SORT_MAP[sortValue] ?? DEFAULT_REFERRAL_INVITE_SORT_MAP;

    const orderByConditions =
      sortOrder === "asc"
        ? asc(referralInvite[sortBy])
        : desc(referralInvite[sortBy]);

    const [totalInvitesCount, foundInvites] = await Promise.all([
      db.$count(referralInvite, and(...whereConditions)),
      db.query.referralInvite.findMany({
        where: and(...whereConditions),
        orderBy: orderByConditions,
        limit: perPage,
        offset: (page - 1) * perPage,
        with: {
          referralSourceUser: true,
          referralTargetUser: true,
          referralCode: true,
          creditsBatch: true,
          tariffDiscount: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalInvitesCount / perPage);
    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return c.json<GetMyReferralInvitesResponse>(
      getMyReferralInvitesResponseSchema.parse({
        data: foundInvites,
        meta: {
          previousPage,
          currentPage: page,
          nextPage,
          perPage,
          totalItems: totalInvitesCount,
          totalPages,
          sort: sortValue,
        },
      }),
    );
  },
);
