import cors from "cors";
import { env } from "./environment.js";

const allowedOrigins = [
  env.CLIENT_ORIGIN,
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in local dev environment
  },
  credentials: true
};

export const corsMiddleware = cors(corsOptions);
