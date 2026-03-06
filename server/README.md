# HealthSpeak Backend Server

Backend API server for HealthSpeak with Google Gemini AI integration.

## Features

- Medical term search using Gemini AI
- Structured responses with definitions, symptoms, causes, and related terms
- RESTful API endpoints
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v18 or higher)
- Gemini API key from Google AI Studio

## Setup

1. **Get your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create or sign in to your Google account
   - Generate a new API key

2. **Configure Environment Variables**
   ```bash
   cd server
   cp .env.example .env
   ```

3. **Add your Gemini API key to `.env`**
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

**Response:**
```json
{
  "status": "OK",
  "message": "HealthSpeak API is running"
}
```

### Search Medical Term
```
POST /api/search
```

**Request Body:**
```json
{
  "term": "hypertension"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "term": "Hypertension",
    "definition": "Patient-friendly explanation...",
    "symptoms": ["symptom1", "symptom2", ...],
    "causes": ["cause1", "cause2", ...],
    "relatedTerms": ["term1", "term2", ...]
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing term)
- `500` - Server error (Gemini API failure)

## Dependencies

- `express` - Web framework
- `@google/generative-ai` - Gemini AI SDK
- `dotenv` - Environment variable management
- `cors` - CORS middleware

## Security Notes

- Never commit your `.env` file
- Keep your Gemini API key private
- Use environment variables for sensitive data
- The `.env` file is already in `.gitignore`
