import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Configure Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for Tailwind CSS and inline styles
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'",
        // Add trusted script sources if needed
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", // Allow images from HTTPS sources
        "blob:" // Allow blob URLs for uploaded images
      ],
      mediaSrc: [
        "'self'",
        "blob:", // Allow blob URLs for uploaded media
        "data:"
      ],
      connectSrc: [
        "'self'", 
        "ws:", // WebSocket connections
        "wss:", // Secure WebSocket connections
        "https://api.openstreetmap.org", // OpenStreetMap API
        "https://tile.openstreetmap.org" // OpenStreetMap tiles
      ],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
    reportOnly: process.env.NODE_ENV === 'development' // Only report in development
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Enable XSS protection
  xssFilter: true,
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Prevent DNS prefetching
  dnsPrefetchControl: { allow: false },
  
  // Disable download options for IE
  ieNoOpen: true,
  
  // Cross-origin policies  
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
});

// Request sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Recursively sanitize object properties
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize route parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// IP validation middleware
export const validateIP = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Log suspicious activity
  if (clientIP === 'unknown') {
    console.warn('⚠️ Request from unknown IP address');
  }
  
  // Block known malicious IP patterns (implement as needed)
  const blockedIPPatterns = [
    // Add patterns for known malicious IPs if needed
  ];
  
  for (const pattern of blockedIPPatterns) {
    if (clientIP.includes(pattern)) {
      console.warn(`🚨 Blocked request from suspicious IP: ${clientIP}`);
      res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          statusCode: 403
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
  }
  
  next();
};

// Advanced CORS security configuration for production
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    
    const allowedOrigins = [
      // Development origins
      ...(isDevelopment ? [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ] : []),
      
      // Production origins
      ...(isProduction ? [
        'https://galax-app.com',
        'https://www.galax-app.com',
        'https://app.galax-network.org'
      ] : []),
      
      // Environment-specific origins
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_FRONTEND_URL,
      process.env.STAGING_FRONTEND_URL,
      
      // Additional trusted origins from environment
      ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : [])
    ].filter(Boolean);

    // Security: In production, be more strict about origins
    if (isProduction && !origin) {
      console.warn('🚨 CORS: Blocked request with no origin in production');
      return callback(new Error('Origin required in production'));
    }
    
    // Allow requests with no origin in development (mobile apps, curl, etc.)
    if (!origin && isDevelopment) {
      return callback(null, true);
    }

    // Check against allowed origins
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS blocked origin: ${origin}`, {
        allowedOrigins: allowedOrigins.length,
        isProduction,
        timestamp: new Date().toISOString()
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  credentials: true,
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  
  // Allowed request headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token',
    'X-Request-ID',
    'X-API-Version',
    'X-Client-Version',
    'X-Platform',
    'X-Device-ID',
    'If-None-Match',
    'If-Modified-Since'
  ],
  
  // Headers exposed to the client
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Has-Next-Page',
    'X-Has-Previous-Page',
    'X-Current-Page',
    'X-Per-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Request-ID',
    'X-Response-Time',
    'X-API-Version',
    'Link',
    'ETag',
    'Last-Modified'
  ],
  
  // Preflight cache duration (24 hours)
  maxAge: 86400,
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request details
  console.log(`📝 ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    contentLength: req.get('Content-Length') || '0',
    origin: req.get('Origin') || 'no-origin'
  });
  
  // Log response when request finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? '❌' : '✅';
    
    console.log(`${logLevel} ${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || '0'
    });
  });
  
  next();
};

// File upload security middleware
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }
  
  // Additional file security checks
  const file = req.file;
  
  // Check file extension matches MIME type
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  const mimeTypeMap: { [key: string]: string[] } = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'video/mp4': ['mp4'],
    'video/quicktime': ['mov'],
    'audio/mpeg': ['mp3'],
    'audio/wav': ['wav']
  };
  
  const allowedExtensions = mimeTypeMap[file.mimetype];
  if (!allowedExtensions || !ext || !allowedExtensions.includes(ext)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'File extension does not match MIME type',
        statusCode: 400
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Log file upload for monitoring
  console.log('📎 File uploaded:', {
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  next();
};
