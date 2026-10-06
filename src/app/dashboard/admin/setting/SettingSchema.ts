import { z } from "zod";

// Define the validation schema for the site settings form
export const SiteSettigSchema = z.object({
  site_title: z.string(),
  event_title: z.string(),
  logo: z.string(),
  banner: z.string(),
  add1: z.string(),
  add2: z.string(),
  add3: z.string(),
});

