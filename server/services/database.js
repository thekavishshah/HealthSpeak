import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialize database schema
 */
export async function initializeDatabase() {
  const client = await pool.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        patient_id VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create search history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS search_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        search_term VARCHAR(255) NOT NULL,
        result_data JSONB,
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create chat history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create medical terms i table (to reduce API calls)
    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_terms_cache (
        id SERIAL PRIMARY KEY,
        term VARCHAR(255) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create UMLS terms cache table (for UMLS-specific data)
    await client.query(`
      CREATE TABLE IF NOT EXISTS umls_terms_cache (
        id SERIAL PRIMARY KEY,
        term VARCHAR(255) UNIQUE NOT NULL,
        umls_data JSONB NOT NULL,
        cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_medical_terms_term ON medical_terms_cache(term);
      CREATE INDEX IF NOT EXISTS idx_umls_terms_term ON umls_terms_cache(term);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Save search history
 */
export async function saveSearchHistory(userId, searchTerm, resultData) {
  try {
    const result = await pool.query(
      'INSERT INTO search_history (user_id, search_term, result_data) VALUES ($1, $2, $3) RETURNING *',
      [userId, searchTerm, resultData]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving search history:', error);
    throw error;
  }
}

/**
 * Get search history for a user
 */
export async function getSearchHistory(userId, limit = 20) {
  try {
    const result = await pool.query(
      'SELECT * FROM search_history WHERE user_id = $1 ORDER BY searched_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching search history:', error);
    throw error;
  }
}

/**
 * Save chat message
 */
export async function saveChatMessage(userId, message, role) {
  try {
    const result = await pool.query(
      'INSERT INTO chat_history (user_id, message, role) VALUES ($1, $2, $3) RETURNING *',
      [userId, message, role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

/**
 * Get chat history for a user
 */
export async function getChatHistory(userId, limit = 50) {
  try {
    const result = await pool.query(
      'SELECT * FROM chat_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

/**
 * Cache medical term data
 */
export async function cacheMedicalTerm(term, data) {
  try {
    const result = await pool.query(
      `INSERT INTO medical_terms_cache (term, data)
       VALUES ($1, $2)
       ON CONFLICT (term)
       DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [term.toLowerCase(), data]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error caching medical term:', error);
    throw error;
  }
}

/**
 * Get cached medical term data
 */
export async function getCachedMedicalTerm(term) {
  try {
    const result = await pool.query(
      'SELECT * FROM medical_terms_cache WHERE term = $1',
      [term.toLowerCase()]
    );

    if (result.rows.length > 0) {
      const cached = result.rows[0];
      // Check if cache is less than 7 days old
      const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      if (cacheAge < maxAge) {
        return cached.data;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching cached medical term:', error);
    return null;
  }
}

/**
 * Cache UMLS data for a medical term
 */
export async function cacheUMLSData(term, umlsData) {
  try {
    const result = await pool.query(
      `INSERT INTO umls_terms_cache (term, umls_data)
       VALUES ($1, $2)
       ON CONFLICT (term)
       DO UPDATE SET umls_data = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [term.toLowerCase(), umlsData]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error caching UMLS data:', error);
    throw error;
  }
}

/**
 * Get cached UMLS data for a medical term
 */
export async function getCachedUMLSData(term) {
  try {
    const result = await pool.query(
      'SELECT * FROM umls_terms_cache WHERE term = $1',
      [term.toLowerCase()]
    );

    if (result.rows.length > 0) {
      const cached = result.rows[0];
      // Check if cache is less than 30 days old (UMLS data changes less frequently)
      const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      if (cacheAge < maxAge) {
        return cached.umls_data;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching cached UMLS data:', error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData) {
  try {
    const result = await pool.query(
      `INSERT INTO users (patient_id, first_name, last_name, date_of_birth, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, patient_id, first_name, last_name, email, created_at`,
      [
        userData.patientId,
        userData.firstName,
        userData.lastName,
        userData.dateOfBirth,
        userData.email,
        userData.passwordHash
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Find user by patient ID
 */
export async function findUserByPatientId(patientId) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE patient_id = $1',
      [patientId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

export default {
  initializeDatabase,
  saveSearchHistory,
  getSearchHistory,
  saveChatMessage,
  getChatHistory,
  cacheMedicalTerm,
  getCachedMedicalTerm,
  cacheUMLSData,
  getCachedUMLSData,
  createUser,
  findUserByPatientId,
  findUserByEmail
};
