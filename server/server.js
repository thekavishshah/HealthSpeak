import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { searchMedicalTerm, getChatResponse } from './services/aiService.js';
import {
  initializeDatabase,
  saveSearchHistory,
  getSearchHistory,
  saveChatMessage,
  getChatHistory,
  cacheMedicalTerm,
  getCachedMedicalTerm,
  createUser,
  findUserByPatientId,
  findUserByEmail
} from './services/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Initialize database on startup (disabled for development - authentication in progress)
// initializeDatabase().catch(console.error);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'HealthSpeak API is running' });
});

// ==================== Authentication Endpoints ====================

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate patient ID (format: HS-XXXXX)
    const patientId = `HS-${Math.floor(10000 + Math.random() * 90000)}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      email,
      passwordHash
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, patientId: user.patient_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        patientId: user.patient_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Error creating user account' });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { patientId, dateOfBirth } = req.body;

    if (!patientId || !dateOfBirth) {
      return res.status(400).json({ error: 'Patient ID and date of birth are required' });
    }

    // Find user by patient ID
    const user = await findUserByPatientId(patientId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify date of birth
    const userDOB = new Date(user.date_of_birth).toISOString().split('T')[0];
    if (userDOB !== dateOfBirth) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, patientId: user.patient_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        patientId: user.patient_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

// ==================== Medical Search Endpoints ====================

/**
 * Search for medical term information
 * POST /api/search
 * Note: Authentication temporarily disabled for development
 */
app.post('/api/search', async (req, res) => {
  try {
    const { term } = req.body;

    if (!term) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    console.log(`Searching for medical term: ${term}`);

    // Fetch from OpenAI
    const result = await searchMedicalTerm(term);

    if (!result.success) {
      return res.status(500).json({
        error: 'Error fetching medical information',
        details: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Error processing search request',
      message: error.message
    });
  }
});

/**
 * Get search history for logged in user
 * GET /api/search/history
 */
app.get('/api/search/history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const history = await getSearchHistory(req.user.userId, limit);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Error retrieving search history' });
  }
});

// ==================== Chat Endpoints ====================

/**
 * Send a chat message and get AI response
 * POST /api/chat
 */
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    await saveChatMessage(req.user.userId, message, 'user');

    // Get recent chat history for context
    const history = await getChatHistory(req.user.userId, 10);
    const chatHistory = history.map(msg => ({
      role: msg.role,
      content: msg.message
    }));

    // Get AI response
    const result = await getChatResponse(message, chatHistory);

    if (!result.success) {
      return res.status(500).json({
        error: 'Error generating response',
        details: result.error
      });
    }

    // Save AI response
    await saveChatMessage(req.user.userId, result.response, 'assistant');

    res.json({
      success: true,
      message: result.response
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Error processing chat message' });
  }
});

/**
 * Get chat history for logged in user
 * GET /api/chat/history
 */
app.get('/api/chat/history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await getChatHistory(req.user.userId, limit);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Error retrieving chat history' });
  }
});

// ==================== Popular Terms Endpoint ====================

/**
 * Get popular medical terms (pre-defined list)
 * GET /api/popular-terms
 */
app.get('/api/popular-terms', async (req, res) => {
  const popularTerms = [
    'Hypertension',
    'Diabetes',
    'Common Cold',
    'Migraine',
    'Asthma',
    'Arthritis',
    'Anxiety',
    'Depression'
  ];

  res.json({
    success: true,
    data: popularTerms
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🏥 HealthSpeak Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
