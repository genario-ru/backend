import * as z from "zod";

export const createOpenAPISchemasRegistry = () => {
  return z.registry<{
    title: string;
    description: string;
    ref: string;
  }>();
};
