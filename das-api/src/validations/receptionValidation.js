import { z } from "zod";
import {
  nameSchema,
  optionalEmailSchema,
  passwordSchema,
  phoneSchema
} from "../utils/validation.js";

export const createReceptionPatientSchema = z.object({
  fullName: nameSchema,
  email: optionalEmailSchema,
  phone: phoneSchema,
  gender: z.enum(["male", "female", "other", "unknown"]).default("unknown"),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  password: passwordSchema.default("nhakhoa2026")
});
