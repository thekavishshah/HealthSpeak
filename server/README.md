# HealthSpeak Backend Server

Backend API server for HealthSpeak with OpenAI integration.

## Features

- Medical term search using OpenAI GPT models
- Structured responses with definitions, symptoms, causes, and related terms
- RESTful API endpoints
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API key from OpenAI Platform

## Setup

1. **Get your OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create or sign in to your OpenAI account
   - Generate a new API key

2. **Configure Environment Variables**
   ```bash
   cd server
   cp .env.example .env
   ```

3. **Add your OpenAI API key to `.env`**
   ```
   OPENAI_API_KEY=your_actual_api_key_here
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
- `500` - Server error (OpenAI API failure)

## Dependencies

- `express` - Web framework
- `openai` - OpenAI SDK
- `dotenv` - Environment variable management
- `cors` - CORS middleware

## Security Notes

- Never commit your `.env` file
- Keep your OpenAI API key private
- Use environment variables for sensitive data
- The `.env` file is already in `.gitignore`
