import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/apiResponse.js';

const standardKeyGenerator = (req) => {
  return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
};

const rateLimitHandler = (message = 'Too many requests, please try again later.') => {
  return (req, res) => {
    return errorResponse(res, message, 429, 'RATE_LIMIT_EXCEEDED');
  };
};

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many API requests from this IP, please retry after 15 minutes.'),
  keyGenerator: standardKeyGenerator,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many login attempts. Please wait 15 minutes before trying again.'),
  keyGenerator: standardKeyGenerator,
});

export const grievanceRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Grievance submission rate limit exceeded. Please wait before submitting another grievance.'),
  keyGenerator: standardKeyGenerator,
});

export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // 50 uploads per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Upload rate limit reached. Please wait before uploading more evidence files.'),
  keyGenerator: standardKeyGenerator,
});

export const assistantRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60, // 60 messages per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Assistant query rate limit exceeded. Please wait a moment.'),
  keyGenerator: standardKeyGenerator,
});
