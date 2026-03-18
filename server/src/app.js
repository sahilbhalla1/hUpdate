const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path')
const env = require('./config/env');

const app = express();
const apiRoutes = require('./routes');

//To run cron for order sync
require('./jobs/sapSync.cron');

/**
 * Security & core middlewares
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", env.frontendUrl],
        mediaSrc: ["'self'", "data:", "blob:", env.frontendUrl],
        frameSrc: ["'self'", env.frontendUrl],
        frameAncestors: ["'self'", env.frontendUrl],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

/**
 * Rate limiting
 */
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Routes 
 */
app.use(
  "/hisense-ts-api/uploads",
  express.static(path.resolve(__dirname, "../uploads"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
    }
  })
);

app.use('/hisense-ts-api', apiRoutes);

/**
 * Global error handler (must be last)
 */
// app.use(errorMiddleware);

module.exports = app;
