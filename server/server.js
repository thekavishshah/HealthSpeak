import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchMedicalTerm } from './services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'HealthSpeak API is running' });
});

// Medical term search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { term } = req.body;

    if (!term || term.trim() === '') {
      return res.status(400).json({
        error: 'Medical term is required'
      });
    }

    console.log(`Searching for medical term: ${term}`);

    const result = await searchMedicalTerm(term);

    res.json(result);
  } catch (error) {
    console.error('Error searching medical term:', error);
    res.status(500).json({
      error: 'Failed to process medical term search',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`HealthSpeak API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
