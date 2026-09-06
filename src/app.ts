import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { requestId } from "./middleware/request-id.js";
import { portfolioRouter } from "./routes/portfolio-routes.js";

export const app = express();
app.disable("x-powered-by");

app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.frontendUrls.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "32kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({ success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." } });
  },
});

const contactLimiter = rateLimit({
  windowMs: 30 * 1000,
  limit: 1,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({ success: false, error: { code: "CONTACT_RATE_LIMITED", message: "Please wait before sending another message." } });
  },
});

const newsletterLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({ success: false, error: { code: "NEWSLETTER_RATE_LIMITED", message: "Please wait before trying again." } });
  },
});

app.use("/api", apiLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api/newsletter/subscribe", newsletterLimiter);

app.get("/api/health", (_request, response) => {
  response.json({ success: true, status: "ok", service: "portfolio-api", environment: config.nodeEnv, uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});

app.use("/api", portfolioRouter);
app.use(notFound);
app.use(errorHandler);
