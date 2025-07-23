import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { setupStaticServing } from './static-serve.js';
import { db } from './database.js';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthRequest } from './auth.js';
import { 
  generatePasswordResetToken, 
  sendPasswordResetEmail, 
  validatePasswordResetToken, 
  markTokenAsUsed,
  generateEmailVerificationToken,
  sendEmailVerification,
  validateEmailVerificationToken,
  markEmailVerificationTokenAsUsed,
  markEmailAsVerified,
  resendEmailVerification
} from './email.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import { 
  apiLimiter, 
  authLimiter, 
  emailLimiter, 
  passwordResetLimiter,
  uploadLimiter,
  crisisLimiter 
} from './middleware/rateLimiter.js';
import { 
  securityHeaders, 
  sanitizeInput, 
  validateIP, 
  corsConfig, 
  requestLogger,
  fileUploadSecurity 
} from './middleware/security.js';
import {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateHelpRequest,
  validateCrisisAlert,
  validateProposal,
  validateVote,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateEmailVerification,
  validateFileUpload
} from './middleware/validation.js';

// Import socket manager
import SocketManager from './socketManager.js';

dotenv.config();

console.log('🚀 Starting server initialization...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Data directory:', process.env.DATA_DIRECTORY || './data');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true
});

// Initialize socket manager
const socketManager = new SocketManager(io);

// Configure multer for file uploads with enhanced security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.DATA_DIRECTORY || './data', 'uploads');
    console.log('📁 Upload directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    console.log('📄 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, videos, and audio files are allowed'));
    }
  }
});

// Security middleware
app.use(securityHeaders);
app.use(cors(corsConfig));
app.use(validateIP);
app.use(requestLogger);

// Body parsing middleware with security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check endpoint (no rate limiting)
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  const socketHealth = socketManager.getHealthStatus();
  
  res.json({ 
    success: true,
    data: {
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      dataDirectory: process.env.DATA_DIRECTORY || './data',
      sockets: socketHealth
    }
  });
});

// Socket health endpoint
app.get('/api/socket/health', (req, res) => {
  const health = socketManager.getHealthStatus();
  console.log('🔌 Socket health check:', health);
  
  res.json({
    success: true,
    data: health
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('🗄️ Testing database connection...');
    const result = await db.selectFrom('users').selectAll().limit(1).execute();
    console.log('✅ Database test successful, found', result.length, 'users');
    res.json({ 
      success: true,
      data: {
        status: 'ok', 
        userCount: result.length
      }
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Database connection failed',
        statusCode: 500
      }
    });
  }
});

// Auth endpoints with enhanced security
app.post('/api/auth/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { email, password, username, walletAddress } = req.body;
    
    console.log('📝 Registration attempt:', { email, username, walletAddress });

    // Check if user already exists
    const existingUser = await db
      .selectFrom('users')
      .selectAll()
      .where((eb) => eb.or([
        email ? eb('email', '=', email) : undefined,
        eb('username', '=', username),
        walletAddress ? eb('wallet_address', '=', walletAddress) : undefined
      ].filter(Boolean)))
      .executeTakeFirst();

    if (existingUser) {
      console.log('❌ Registration failed: User already exists');
      sendResponse(res, 400, { 
        success: false,
        error: {
          message: 'User already exists with this email, username, or wallet address',
          statusCode: 400
        }
      });
    }

    const passwordHash = password ? await hashPassword(password) : null;

    const user = await db
      .insertInto('users')
      .values({
        email: email || null,
        password_hash: passwordHash,
        wallet_address: walletAddress || null,
        username,
        reputation_score: 0,
        ap_balance: 1000,
        crowds_balance: 0,
        gov_balance: 0,
        roles: 'helper,requester,voter',
        skills: '[]',
        badges: '[]',
        email_verified: 0
      })
      .returning('id')
      .executeTakeFirst();

    if (!user) {
      console.log('❌ Registration failed: Failed to create user');
      res.status(500).json({ 
        success: false,
        error: {
          message: 'Failed to create user account',
          statusCode: 500
        }
      });
      return;
    }

    // Send email verification if email provided
    if (email) {
      console.log('📧 Sending email verification for new user');
      const verificationToken = await generateEmailVerificationToken(user.id);
      if (verificationToken) {
        await sendEmailVerification(email, verificationToken, username);
      }
    }

    const token = generateToken(user.id);
    
    console.log('✅ User registered successfully:', user.id);
    res.json({ 
      success: true,
      data: {
        token, 
        userId: user.id,
        emailVerificationRequired: !!email
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error; // Let error handler middleware handle it
  }
});

app.post('/api/auth/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;
    
    console.log('🔐 Login attempt:', { email, walletAddress });

    let user;
    if (email) {
      // Try to find user by email first
      user = await db
        .selectFrom('users')
        .selectAll()
        .where('email', '=', email)
        .executeTakeFirst();
      
      // If not found by email, try by username (for backward compatibility)
      if (!user) {
        user = await db
          .selectFrom('users')
          .selectAll()
          .where('username', '=', email)
          .executeTakeFirst();
      }
    } else {
      // Login with wallet address
      user = await db
        .selectFrom('users')
        .selectAll()
        .where('wallet_address', '=', walletAddress)
        .executeTakeFirst();
    }

    if (!user) {
      console.log('❌ Login failed: User not found');
      res.status(401).json({ 
        success: false,
        error: {
          message: 'Invalid credentials',
          statusCode: 401
        }
      });
      return;
    }

    // If email login, verify password
    if (email && password) {
      if (!user.password_hash) {
        console.log('❌ Login failed: No password hash for email user');
        res.status(401).json({ 
          success: false,
          error: {
            message: 'Invalid credentials',
            statusCode: 401
          }
        });
      return;
      }
      
      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        console.log('❌ Login failed: Invalid password');
        res.status(401).json({ 
          success: false,
          error: {
            message: 'Invalid credentials',
            statusCode: 401
          }
        });
      return;
      }
    }

    const token = generateToken(user.id);
    
    console.log('✅ Login successful:', user.id);
    res.json({ 
      success: true,
      data: {
        token, 
        userId: user.id,
        emailVerified: user.email_verified === 1
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
});

// Password reset endpoints with enhanced security
app.post('/api/auth/forgot-password', passwordResetLimiter, validatePasswordReset, async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🔐 Password reset request for:', email);

    const token = await generatePasswordResetToken(email);
    
    if (!token) {
      // Don't reveal whether user exists or not
      console.log('⚠️ Password reset requested for non-existent user');
    } else {
      const emailSent = await sendPasswordResetEmail(email, token);
      if (!emailSent) {
        console.log('❌ Failed to send password reset email');
      }
    }

    // Always return success to prevent user enumeration
    console.log('✅ Password reset email sent successfully');
    res.json({ 
      success: true,
      data: {
        message: 'If an account with that email exists, a password reset link has been sent.'
      }
    });
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    throw error;
  }
});

app.post('/api/auth/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log('🔍 Validating reset token');
    
    if (!token) {
      res.status(400).json({ 
        success: false,
        error: {
          message: 'Token is required',
          statusCode: 400
        }
      });
      return;
    }

    const userId = await validatePasswordResetToken(token);
    
    if (!userId) {
      res.status(400).json({ 
        success: false,
        error: {
          message: 'Invalid or expired token',
          statusCode: 400
        }
      });
      return;
    }

    console.log('✅ Reset token is valid');
    res.json({ 
      success: true,
      data: { valid: true }
    });
  } catch (error) {
    console.error('❌ Token validation error:', error);
    throw error;
  }
});

app.post('/api/auth/reset-password', passwordResetLimiter, validatePasswordResetConfirm, async (req, res) => {
  try {
    const { token, password } = req.body;
    
    console.log('🔐 Password reset attempt');

    const userId = await validatePasswordResetToken(token);
    
    if (!userId) {
      res.status(400).json({ 
        success: false,
        error: {
          message: 'Invalid or expired token',
          statusCode: 400
        }
      });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(password);
    
    // Update user password
    await db
      .updateTable('users')
      .set({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', userId)
      .execute();

    // Mark token as used
    await markTokenAsUsed(token);

    console.log('✅ Password reset successful for user:', userId);
    res.json({ 
      success: true,
      data: { message: 'Password reset successfully' }
    });
  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw error;
  }
});

// Email verification endpoints
app.post('/api/auth/send-email-verification', emailLimiter, authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    console.log('📧 Email verification request from user:', userId);
    
    const success = await resendEmailVerification(userId);
    
    if (!success) {
      res.status(400).json({ 
        success: false,
        error: {
          message: 'Failed to send verification email',
          statusCode: 400
        }
      });
      return;
    }

    console.log('✅ Email verification sent successfully');
    res.json({ 
      success: true,
      data: { message: 'Verification email sent successfully' }
    });
  } catch (error) {
    console.error('❌ Email verification send error:', error);
    throw error;
  }
});

app.post('/api/auth/verify-email', validateEmailVerification, async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log('🔍 Email verification attempt');

    const userId = await validateEmailVerificationToken(token);
    
    if (!userId) {
      res.status(400).json({ 
        success: false,
        error: {
          message: 'Invalid or expired verification token',
          statusCode: 400
        }
      });
      return;
    }

    // Mark email as verified
    await markEmailAsVerified(userId);
    
    // Mark token as used
    await markEmailVerificationTokenAsUsed(token);

    console.log('✅ Email verified successfully for user:', userId);
    res.json({ 
      success: true,
      data: { message: 'Email verified successfully' }
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    throw error;
  }
});

// User profile endpoints
app.get('/api/user/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('👤 Profile request for user:', req.userId);
    
    const user = await db
      .selectFrom('users')
      .select([
        'id', 'email', 'username', 'avatar_url', 'reputation_score',
        'ap_balance', 'crowds_balance', 'gov_balance', 'roles', 'skills', 'badges',
        'email_verified', 'phone', 'phone_verified', 'two_factor_enabled', 'created_at'
      ])
      .where('id', '=', req.userId!)
      .executeTakeFirst();

    if (!user) {
      console.log('❌ Profile fetch failed: User not found');
      res.status(404).json({ 
        success: false,
        error: {
          message: 'User not found',
          statusCode: 404
        }
      });
      return;
    }

    console.log('✅ Profile fetched successfully for:', user.username);
    res.json({ 
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    throw error;
  }
});

app.put('/api/user/profile', authenticateToken, validateProfileUpdate, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { username, email, phone, skills, bio } = req.body;
    
    console.log('📝 Profile update for user:', userId);

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await db
        .selectFrom('users')
        .select('id')
        .where('username', '=', username)
        .where('id', '!=', userId)
        .executeTakeFirst();
        
      if (existingUser) {
        res.status(400).json({ 
          success: false,
          error: {
            message: 'Username is already taken',
            statusCode: 400
          }
        });
      return;
      }
    }

    // Update user profile
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (username) updateData.username = username;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (skills !== undefined) updateData.skills = skills || '[]';

    await db
      .updateTable('users')
      .set(updateData)
      .where('id', '=', userId)
      .execute();

    console.log('✅ Profile updated successfully for user:', userId);
    res.json({ 
      success: true,
      data: { message: 'Profile updated successfully' }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    throw error;
  }
});

// User statistics endpoint - FIXED
app.get('/api/user/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('📊 Stats request for user:', req.userId);
    const userId = req.userId!;
    
    // Get user statistics
    const helpRequestsCreated = await db
      .selectFrom('help_requests')
      .select(db.fn.count('id').as('count'))
      .where('requester_id', '=', userId)
      .executeTakeFirst();
      
    const helpOffered = await db
      .selectFrom('help_requests')
      .select(db.fn.count('id').as('count'))
      .where('helper_id', '=', userId)
      .executeTakeFirst();
      
    const crisisReported = await db
      .selectFrom('crisis_alerts')
      .select(db.fn.count('id').as('count'))
      .where('created_by', '=', userId)
      .executeTakeFirst();
      
    const proposalsCreated = await db
      .selectFrom('proposals')
      .select(db.fn.count('id').as('count'))
      .where('created_by', '=', userId)
      .executeTakeFirst();
      
    const votescast = await db
      .selectFrom('votes')
      .select(db.fn.count('id').as('count'))
      .where('user_id', '=', userId)
      .executeTakeFirst();

    // Get recent activity (last 5 help requests)
    const recentActivity = await db
      .selectFrom('help_requests')
      .select(['id', 'title', 'category', 'urgency', 'created_at'])
      .where('requester_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(5)
      .execute();
    
    const stats = {
      helpRequestsCreated: Number(helpRequestsCreated?.count || 0),
      helpOffered: Number(helpOffered?.count || 0),
      crisisReported: Number(crisisReported?.count || 0),
      proposalsCreated: Number(proposalsCreated?.count || 0),
      votescast: Number(votescast?.count || 0),
      recentActivity: recentActivity
    };

    console.log('✅ Stats fetched successfully:', stats);
    res.json({ 
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Stats fetch error:', error);
    throw error;
  }
});

// Enhanced help request endpoints
app.post('/api/help-requests', authenticateToken, uploadLimiter, upload.single('media'), validateFileUpload, fileUploadSecurity, validateHelpRequest, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, urgency, latitude, longitude, skillsNeeded, isOfflineCreated } = req.body;
    
    console.log('📝 Creating help request:', { title, category, urgency, hasMedia: !!req.file, userId: req.userId });

    let mediaUrl = null;
    let mediaType = 'none';
    
    if (req.file) {
      mediaUrl = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 
                 req.file.mimetype.startsWith('video/') ? 'video' : 'audio';
      console.log('📎 Media uploaded:', { mediaUrl, mediaType });
    }

    const helpRequest = await db
      .insertInto('help_requests')
      .values({
        requester_id: req.userId!,
        title,
        description,
        category,
        urgency,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        skills_needed: JSON.stringify(skillsNeeded || []),
        media_url: mediaUrl,
        media_type: mediaType,
        is_offline_created: isOfflineCreated ? 1 : 0,
        status: 'posted'
      })
      .returning(['id', 'created_at'])
      .executeTakeFirst();

    if (!helpRequest) {
      console.log('❌ Help request creation failed');
      res.status(500).json({ 
        success: false,
        error: {
          message: 'Failed to create help request',
          statusCode: 500
        }
      });
      return;
    }

    // Broadcast new help request to all connected users via socket manager
    io.emit('new_help_request', {
      id: helpRequest.id,
      title,
      category,
      urgency,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      created_at: helpRequest.created_at
    });

    console.log('✅ Help request created:', helpRequest.id);
    res.json({ 
      success: true,
      data: { id: helpRequest.id }
    });
  } catch (error) {
    console.error('❌ Help request creation error:', error);
    throw error;
  }
});

app.get('/api/help-requests', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, category, urgency, limit = 50 } = req.query;
    
    console.log('📋 Fetching help requests:', { status, category, urgency, limit });
    
    let query = db
      .selectFrom('help_requests')
      .innerJoin('users', 'users.id', 'help_requests.requester_id')
      .leftJoin('users as helper', 'helper.id', 'help_requests.helper_id')
      .select([
        'help_requests.id',
        'help_requests.title',
        'help_requests.description',
        'help_requests.category',
        'help_requests.urgency',
        'help_requests.latitude',
        'help_requests.longitude',
        'help_requests.skills_needed',
        'help_requests.media_url',
        'help_requests.media_type',
        'help_requests.status',
        'help_requests.created_at',
        'help_requests.rating',
        'users.username as requester_username',
        'users.avatar_url as requester_avatar',
        'helper.username as helper_username'
      ])
      .orderBy('help_requests.created_at', 'desc')
      .limit(Math.min(parseInt(limit as string), 100)); // Max 100 items

    if (status) {
      query = query.where('help_requests.status', '=', status as string);
    }
    if (category) {
      query = query.where('help_requests.category', '=', category as string);
    }
    if (urgency) {
      query = query.where('help_requests.urgency', '=', urgency as string);
    }

    const helpRequests = await query.execute();
    
    console.log('✅ Fetched help requests:', helpRequests.length);
    res.json({ 
      success: true,
      data: helpRequests
    });
  } catch (error) {
    console.error('❌ Help requests fetch error:', error);
    throw error;
  }
});

// Help request matching and assignment
app.post('/api/help-requests/:id/offer-help', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const helpRequestId = parseInt(req.params.id);
    
    if (isNaN(helpRequestId) || helpRequestId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid help request ID',
          statusCode: 400
        }
      });
      return;
    }
    
    console.log('🤝 Offering help:', { helpRequestId, helperId: req.userId });
    
    // Check if request exists and is available
    const helpRequest = await db
      .selectFrom('help_requests')
      .selectAll()
      .where('id', '=', helpRequestId)
      .where('status', '=', 'posted')
      .executeTakeFirst();

    if (!helpRequest) {
      console.log('❌ Help request not found or already assigned');
      res.status(404).json({ 
        success: false,
        error: {
          message: 'Help request not found or already assigned',
          statusCode: 404
        }
      });
      return;
    }

    // Prevent users from helping their own requests
    if (helpRequest.requester_id === req.userId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'You cannot offer help on your own request',
          statusCode: 400
        }
      });
      return;
    }

    // Update help request with helper
    await db
      .updateTable('help_requests')
      .set({
        helper_id: req.userId!,
        status: 'matched',
        updated_at: new Date().toISOString()
      })
      .where('id', '=', helpRequestId)
      .execute();

    // Create chat room
    const chatRoom = await db
      .insertInto('chat_rooms')
      .values({
        help_request_id: helpRequestId,
        requester_id: helpRequest.requester_id,
        helper_id: req.userId!
      })
      .returning('id')
      .executeTakeFirst();

    // Notify requester
    await db
      .insertInto('notifications')
      .values({
        user_id: helpRequest.requester_id,
        type: 'help_matched',
        title: 'Helper Found!',
        message: `Someone offered to help with "${helpRequest.title}"`,
        data: JSON.stringify({ helpRequestId, chatRoomId: chatRoom?.id })
      })
      .execute();

    // Broadcast status update via socket manager
    io.to(`help_request_${helpRequestId}`).emit('status_update', {
      id: helpRequestId,
      status: 'matched',
      helper_id: req.userId
    });

    console.log('✅ Help offered successfully:', { helpRequestId, helperId: req.userId });
    res.json({ 
      success: true,
      data: { chatRoomId: chatRoom?.id }
    });
  } catch (error) {
    console.error('❌ Offer help error:', error);
    throw error;
  }
});

// Chat messages endpoint
app.get('/api/chat/:helpRequestId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const helpRequestId = parseInt(req.params.helpRequestId);
    
    if (isNaN(helpRequestId) || helpRequestId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid help request ID',
          statusCode: 400
        }
      });
      return;
    }
    
    console.log('💬 Fetching chat messages:', { helpRequestId, userId: req.userId });
    
    const messages = await db
      .selectFrom('messages')
      .innerJoin('users', 'users.id', 'messages.sender_id')
      .select([
        'messages.id',
        'messages.message',
        'messages.created_at',
        'users.username as sender_username',
        'users.avatar_url as sender_avatar'
      ])
      .where('messages.help_request_id', '=', helpRequestId)
      .orderBy('messages.created_at', 'asc')
      .execute();

    console.log('✅ Fetched messages:', messages.length);
    res.json({ 
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('❌ Chat messages fetch error:', error);
    throw error;
  }
});

// Crisis alert endpoints
app.post('/api/crisis-alerts', authenticateToken, crisisLimiter, validateCrisisAlert, async (req: AuthRequest, res) => {
  try {
    const { title, description, severity, latitude, longitude, radius } = req.body;
    
    console.log('🚨 Creating crisis alert:', { title, severity, userId: req.userId });

    const alert = await db
      .insertInto('crisis_alerts')
      .values({
        title,
        description,
        severity,
        latitude,
        longitude,
        radius: radius || 1000,
        created_by: req.userId!,
        status: 'active'
      })
      .returning('id')
      .executeTakeFirst();

    if (!alert) {
      console.log('❌ Crisis alert creation failed');
      res.status(500).json({ 
        success: false,
        error: {
          message: 'Failed to create crisis alert',
          statusCode: 500
        }
      });
      return;
    }

    console.log('✅ Crisis alert created:', alert.id);
    res.json({ 
      success: true,
      data: { id: alert.id }
    });
  } catch (error) {
    console.error('❌ Crisis alert creation error:', error);
    throw error;
  }
});

app.get('/api/crisis-alerts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('🚨 Fetching crisis alerts for user:', req.userId);
    
    const alerts = await db
      .selectFrom('crisis_alerts')
      .innerJoin('users', 'users.id', 'crisis_alerts.created_by')
      .select([
        'crisis_alerts.id',
        'crisis_alerts.title',
        'crisis_alerts.description',
        'crisis_alerts.severity',
        'crisis_alerts.latitude',
        'crisis_alerts.longitude',
        'crisis_alerts.radius',
        'crisis_alerts.status',
        'crisis_alerts.created_at',
        'crisis_alerts.created_by',
        'users.username as creator_username'
      ])
      .where('crisis_alerts.status', '=', 'active')
      .execute();

    console.log('✅ Fetched crisis alerts:', alerts.length);
    res.json({ 
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('❌ Crisis alerts fetch error:', error);
    throw error;
  }
});

// Governance endpoints
app.post('/api/proposals', authenticateToken, validateProposal, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, deadline } = req.body;
    
    console.log('🗳️ Creating proposal:', { title, category, userId: req.userId });

    const proposal = await db
      .insertInto('proposals')
      .values({
        title,
        description,
        category,
        created_by: req.userId!,
        deadline,
        status: 'active',
        votes_for: 0,
        votes_against: 0
      })
      .returning('id')
      .executeTakeFirst();

    if (!proposal) {
      console.log('❌ Proposal creation failed');
      res.status(500).json({ 
        success: false,
        error: {
          message: 'Failed to create proposal',
          statusCode: 500
        }
      });
      return;
    }

    console.log('✅ Proposal created:', proposal.id);
    res.json({ 
      success: true,
      data: { id: proposal.id }
    });
  } catch (error) {
    console.error('❌ Proposal creation error:', error);
    throw error;
  }
});

app.get('/api/proposals', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { category, status } = req.query;
    console.log('🗳️ Fetching proposals for user:', req.userId);
    
    let query = db
      .selectFrom('proposals')
      .innerJoin('users', 'users.id', 'proposals.created_by')
      .leftJoin('votes', (join) => 
        join.onRef('votes.proposal_id', '=', 'proposals.id')
            .on('votes.user_id', '=', req.userId!)
      )
      .select([
        'proposals.id',
        'proposals.title',
        'proposals.description',
        'proposals.category',
        'proposals.deadline',
        'proposals.status',
        'proposals.votes_for',
        'proposals.votes_against',
        'proposals.created_at',
        'proposals.created_by',
        'users.username as creator_username',
        'votes.vote_type as user_vote'
      ]);

    if (category && category !== 'all') {
      query = query.where('proposals.category', '=', category as string);
    }
    if (status && status !== 'all') {
      query = query.where('proposals.status', '=', status as string);
    }

    const proposals = await query.execute();

    console.log('✅ Fetched proposals:', proposals.length);
    res.json({ 
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error('❌ Proposals fetch error:', error);
    throw error;
  }
});

// Proposal voting endpoint with enhanced validation - FIXED
app.post('/api/proposals/:id/vote', authenticateToken, validateVote, async (req: AuthRequest, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const { vote_type } = req.body;
    const userId = req.userId!;
    
    console.log('🗳️ Voting on proposal:', { proposalId, voteType: vote_type, userId });
    
    // Check if proposal exists and is active
    const proposal = await db
      .selectFrom('proposals')
      .selectAll()
      .where('id', '=', proposalId)
      .executeTakeFirst();
      
    if (!proposal) {
      res.status(404).json({ 
        success: false,
        error: {
          message: 'Proposal not found',
          statusCode: 404
        }
      });
      return;
    }
    
    if (proposal.status !== 'active' || new Date(proposal.deadline) < new Date()) {
      res.status(400).json({ 
        success: false,
        error: {
          message: 'Voting period has ended',
          statusCode: 400
        }
      });
      return;
    }
    
    // Prevent users from voting on their own proposals
    if (proposal.created_by === userId) {
      res.status(400).json({
        success: false,
        error: {
          message: 'You cannot vote on your own proposal',
          statusCode: 400
        }
      });
      return;
    }
    
    // Check if user already voted
    const existingVote = await db
      .selectFrom('votes')
      .selectAll()
      .where('proposal_id', '=', proposalId)
      .where('user_id', '=', userId)
      .executeTakeFirst();
      
    if (existingVote) {
      res.status(400).json({ 
        success: false,
        error: {
          message: 'You have already voted on this proposal',
          statusCode: 400
        }
      });
      return;
    }
    
    // Insert vote
    await db
      .insertInto('votes')
      .values({
        proposal_id: proposalId,
        user_id: userId,
        vote_type
      })
      .execute();
    
    // Update proposal vote counts
    if (vote_type === 'for') {
      await db
        .updateTable('proposals')
        .set({ votes_for: proposal.votes_for + 1 })
        .where('id', '=', proposalId)
        .execute();
    } else {
      await db
        .updateTable('proposals')
        .set({ votes_against: proposal.votes_against + 1 })
        .where('id', '=', proposalId)
        .execute();
    }
    
    console.log('✅ Vote recorded successfully');
    res.json({ 
      success: true,
      data: { message: 'Vote recorded successfully' }
    });
  } catch (error) {
    console.error('❌ Voting error:', error);
    throw error;
  }
});

// Transactions endpoint
app.get('/api/transactions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log('💰 Fetching transactions for user:', req.userId);
    
    const transactions = await db
      .selectFrom('transactions')
      .selectAll()
      .where('user_id', '=', req.userId!)
      .orderBy('created_at', 'desc')
      .limit(20)
      .execute();

    console.log('✅ Fetched transactions:', transactions.length);
    res.json({ 
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('❌ Transactions fetch error:', error);
    throw error;
  }
});

// Action Points claim endpoint
app.post('/api/claim', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { amount = 100 } = req.body;
    
    if (typeof amount !== 'number' || amount <= 0 || amount > 1000) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid claim amount. Must be between 1 and 1000',
          statusCode: 400
        }
      });
      return;
    }
    
    console.log('💎 AP claim request:', { userId: req.userId, amount });

    // Check current balance
    const user = await db
      .selectFrom('users')
      .select(['ap_balance'])
      .where('id', '=', req.userId!)
      .executeTakeFirst();

    if (!user || user.ap_balance < amount) {
      console.log('❌ AP claim failed: Insufficient balance');
      res.status(400).json({ 
        success: false,
        error: {
          message: 'Insufficient AP balance',
          statusCode: 400
        }
      });
      return;
    }

    // Deduct AP
    await db
      .updateTable('users')
      .set({ ap_balance: user.ap_balance - amount })
      .where('id', '=', req.userId!)
      .execute();

    // Record transaction
    await db
      .insertInto('transactions')
      .values({
        user_id: req.userId!,
        type: 'claim',
        amount: -amount,
        token_type: 'AP',
        description: 'Help Now action claim'
      })
      .execute();

    console.log('✅ AP claimed successfully');
    res.json({ 
      success: true,
      data: { 
        newBalance: user.ap_balance - amount,
        message: 'AP claimed successfully'
      }
    });
  } catch (error) {
    console.error('❌ AP claim error:', error);
    throw error;
  }
});

// Serve uploaded files with security headers
app.use('/uploads', express.static(path.join(process.env.DATA_DIRECTORY || './data', 'uploads'), {
  setHeaders: (res, filePath) => {
    // Prevent execution of uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    
    // Set appropriate cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
}));

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🔌 SIGTERM received, shutting down gracefully...');
  await socketManager.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔌 SIGINT received, shutting down gracefully...');
  await socketManager.shutdown();
  process.exit(0);
});

// Export a function to start the server
export async function startServer(port: number) {
  try {
    console.log('🚀 Starting server on port:', port);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🌐 Setting up static file serving...');
      setupStaticServing(app);
    }
    
    server.listen(port, () => {
      console.log(`✅ API Server with Socket.IO running on port ${port}`);
      console.log(`🌍 Health check: http://localhost:${port}/api/health`);
      console.log(`🗄️ Database test: http://localhost:${port}/api/test-db`);
      console.log(`🔌 Socket health: http://localhost:${port}/api/socket/health`);
      console.log(`🔒 Security: Rate limiting, input validation, and security headers enabled`);
      console.log(`🧹 Socket management: Enhanced with connection cleanup and memory management`);
    });
  } catch (err) {
    console.error('💥 Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting server directly...');
  startServer(Number(process.env.PORT) || 3001);
}
