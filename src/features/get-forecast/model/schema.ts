import { z } from "zod";

export const forecastSchema = {
  latitude: z.number().min(-90).max(90).describe("Latitude of the location"),
  longitude: z.number().min(-180).max(180).describe("Longitude of the location"),
};