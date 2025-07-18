import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler.js';

// Helper to check validation results
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
    
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .optional()
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('walletAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format'),
    
  // Custom validation to ensure either email+password or walletAddress
  body().custom((value, { req }) => {
    const { email, password, walletAddress } = req.body;
    
    if (!email && !walletAddress) {
      throw new Error('Either email or wallet address is required');
    }
    
    if (email && !password) {
      throw new Error('Password is required when registering with email');
    }
    
    return true;
  }),
  
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .optional()
    .notEmpty()
    .withMessage('Email/username is required for email login')
    .trim(),
    
  body('password')
    .optional()
    .notEmpty()
    .withMessage('Password is required for email login'),
    
  body('walletAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid wallet address format'),
    
  // Custom validation to ensure proper login method
  body().custom((value, { req }) => {
    const { email, password, walletAddress } = req.body;
    
    if (!email && !walletAddress) {
      throw new Error('Either email or wallet address is required');
    }
    
    if (email && !password) {
      throw new Error('Password is required for email login');
    }
    
    return true;
  }),
  
  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
    
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('skills')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Skills description cannot exceed 500 characters')
    .trim(),
    
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters')
    .trim(),
    
  handleValidationErrors
];

// Help request validation
export const validateHelpRequest = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .trim(),
    
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
    
  body('category')
    .isIn(['emergency', 'transportation', 'food', 'housing', 'healthcare', 'education', 'technology', 'other'])
    .withMessage('Invalid category'),
    
  body('urgency')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid urgency level'),
    
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
    
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
    
  body('skillsNeeded')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Skills needed cannot exceed 10 items'),
    
  handleValidationErrors
];

// Crisis alert validation
export const validateCrisisAlert = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .trim(),
    
  body('description')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters')
    .trim(),
    
  body('severity')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
    
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
    
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
    
  body('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
    
  handleValidationErrors
];

// Proposal validation
export const validateProposal = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .trim(),
    
  body('description')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .trim(),
    
  body('category')
    .isIn(['infrastructure', 'budget', 'policy', 'community', 'environment', 'other'])
    .withMessage('Invalid category'),
    
  body('deadline')
    .isISO8601()
    .withMessage('Invalid deadline format')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      
      if (deadline <= minDeadline) {
        throw new Error('Deadline must be at least 24 hours in the future');
      }
      
      return true;
    }),
    
  handleValidationErrors
];

// Vote validation
export const validateVote = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid proposal ID'),
    
  body('vote_type')
    .isIn(['for', 'against'])
    .withMessage('Vote type must be either "for" or "against"'),
    
  handleValidationErrors
];

// Password reset validation
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  handleValidationErrors
];

export const validatePasswordResetConfirm = [
  body('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid reset token')
    .trim(),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  handleValidationErrors
];

// Email verification validation
export const validateEmailVerification = [
  body('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid verification token')
    .trim(),
    
  handleValidationErrors
];

// Phone verification validation
export const validatePhoneVerification = [
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  handleValidationErrors
];

export const validatePhoneVerificationConfirm = [
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
    
  body('code')
    .isLength({ min: 4, max: 8 })
    .withMessage('Invalid verification code')
    .isNumeric()
    .withMessage('Verification code must be numeric'),
    
  handleValidationErrors
];

// General pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4'
  ];
  
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw new ValidationError('Invalid file type. Only images, videos, and audio files are allowed.');
  }
  
  // Check file size (already handled by multer, but double-check)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.file.size > maxSize) {
    throw new ValidationError('File size too large. Maximum size is 10MB.');
  }
  
  next();
};
