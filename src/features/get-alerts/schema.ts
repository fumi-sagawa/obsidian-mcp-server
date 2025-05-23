import { z } from "zod";

export const alertsSchema = {
  state: z.string().length(2).describe("Two-letter state code (e.g. CA, NY)"),
};