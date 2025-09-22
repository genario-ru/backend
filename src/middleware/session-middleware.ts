import { createMiddleware } from 'hono/factory';
import { auth, type AuthType } from '@/auth';
import { HTTPException } from 'hono/http-exception';

export const sessionMiddleware = createMiddleware<{ Variables: AuthType }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    throw new HTTPException(401, {
      message: "You have to authenticate to access this resource",
      cause: "Unauthorized"
    })
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
})
