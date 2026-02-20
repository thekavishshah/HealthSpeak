# HealthSpeak

A medical terminology platform that helps patients understand complex medical terms using AI-powered explanations and an interactive chat assistant.

## Features

- **Medical Term Search**: Look up and understand medical terminology in plain language
- **AI Chat Assistant**: Ask questions about health topics and get informative responses
- **User Authentication**: Secure patient accounts with JWT authentication
- **Search History**: Track your previous searches and chat conversations
- **Smart Caching**: Reduced API calls with intelligent caching of medical terms

## Tech Stack

**Frontend:**
- React 19
- React Router
- Vite

**Backend:**
- Node.js & Express
- PostgreSQL
- Google Gemini AI API
- JWT Authentication
- bcrypt for password hashing

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 16

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **npm** (comes with Node.js)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HealthSpeak
```

### 2. Install Dependencies

**Install frontend dependencies:**
```bash
npm install
```

**Install backend dependencies:**
```bash
cd server
npm install
cd ..
```

### 3. Set Up Environment Variables

Create a `.env` file in the `server/` directory by copying the example:

```bash
cd server
cp .env.example .env
```

Then edit `server/.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your-actual-api-key-here
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthspeak
DB_USER=healthspeak_user
DB_PASSWORD=healthspeak_pass
JWT_SECRET=your-secret-key-change-this-in-production
```

**Important:**
- Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- For production, change the `JWT_SECRET` to a strong, random value
- Never commit the `.env` file to git (it's already in `.gitignore`)

### 4. Start PostgreSQL with Docker

Make sure Docker Desktop is running, then start the PostgreSQL database:

```bash
docker-compose up -d
```

This will:
- Download the PostgreSQL 16 image (first time only)
- Create a container named `healthspeak-postgres`
- Initialize the database with the credentials from `docker-compose.yml`
- Create a persistent volume to store your data

**Verify the database is running:**
```bash
docker ps
```

You should see `healthspeak-postgres` in the list.

### 5. Start the Backend Server

From the project root:

```bash
cd server
npm start
```

Or for development mode with auto-reload:
```bash
npm run dev
```

The server will:
- Start on `http://localhost:3001`
- Automatically create database tables (users, search_history, chat_history, medical_terms_cache)
- Connect to the PostgreSQL database

**You should see:**
```
🏥 HealthSpeak Server is running on port 3001
📍 API endpoint: http://localhost:3001
✅ Health check: http://localhost:3001/api/health

Connected to PostgreSQL database
Database schema initialized successfully
```

### 6. Start the Frontend

In a **new terminal**, from the project root:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy).

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Docker Commands

### Start the database
```bash
docker-compose up -d
```

### Stop the database
```bash
docker-compose down
```

### Stop and remove all data (fresh start)
```bash
docker-compose down -v
```

### View database logs
```bash
docker logs healthspeak-postgres

# Follow logs in real-time
docker logs -f healthspeak-postgres
```

### Access PostgreSQL shell
```bash
docker exec -it healthspeak-postgres psql -U healthspeak_user -d healthspeak
```

### List all tables
```bash
docker exec healthspeak-postgres psql -U healthspeak_user -d healthspeak -c "\dt"
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with patient ID and date of birth

### Medical Search
- `POST /api/search` - Search for medical term information (requires authentication)
- `GET /api/search/history` - Get search history (requires authentication)

### Chat
- `POST /api/chat` - Send a message to the AI assistant (requires authentication)
- `GET /api/chat/history` - Get chat history (requires authentication)

### Other
- `GET /api/health` - Health check endpoint
- `GET /api/popular-terms` - Get list of popular medical terms

## Project Structure

```
HealthSpeak/
├── server/                 # Backend server
│   ├── services/          # Business logic
│   │   ├── database.js    # Database operations
│   │   └── geminiService.js # AI integration
│   ├── server.js          # Express server & API routes
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── src/                   # Frontend React app
│   ├── components/        # React components
│   ├── services/          # API service layer
│   └── App.jsx           # Main app component
├── docker-compose.yml     # Docker configuration
├── package.json          # Frontend dependencies
└── README.md             # This file
```

## Database Schema

### users
- `id` - Primary key
- `patient_id` - Unique patient identifier (HS-XXXXX)
- `first_name`, `last_name` - User name
- `date_of_birth` - Birth date (used for authentication)
- `email` - User email (unique)
- `password_hash` - Hashed password
- `created_at`, `updated_at` - Timestamps

### search_history
- `id` - Primary key
- `user_id` - Foreign key to users
- `search_term` - Medical term searched
- `result_data` - JSON data with AI response
- `searched_at` - Timestamp

### chat_history
- `id` - Primary key
- `user_id` - Foreign key to users
- `message` - Chat message
- `role` - 'user' or 'assistant'
- `created_at` - Timestamp

### medical_terms_cache
- `id` - Primary key
- `term` - Medical term (unique)
- `data` - JSON data with medical information
- `cached_at`, `updated_at` - Timestamps (cache expires after 7 days)

## Troubleshooting

### Port 5432 already in use

If you get an error that port 5432 is already allocated:

1. Check what's using the port:
```bash
lsof -i :5432
```

2. Stop local PostgreSQL if running:
```bash
brew services stop postgresql@16
```

3. Or stop other Docker containers using that port:
```bash
docker ps
docker stop <container-name>
```

### Docker daemon not running

If you get "Cannot connect to the Docker daemon":
- Make sure Docker Desktop is open and running
- Check the Docker icon in your menu bar

### Database connection failed

1. Verify Docker container is running:
```bash
docker ps | grep healthspeak
```

2. Check the logs:
```bash
docker logs healthspeak-postgres
```

3. Verify environment variables in `server/.env` match `docker-compose.yml`

### Server won't start

1. Make sure you're in the correct directory
2. Verify all dependencies are installed: `npm install`
3. Check if port 3001 is available: `lsof -i :3001`

## Development

### Backend Development
The backend uses `nodemon` for auto-reload during development:
```bash
cd server
npm run dev
```

### Frontend Development
Vite provides hot module replacement for instant updates:
```bash
npm run dev
```

## Team Collaboration

All team members should:
1. Have Docker Desktop installed and running
2. Run `docker-compose up -d` to start the database
3. Install dependencies in both root and `server/` directories
4. Get their own Gemini API key (don't commit API keys!)
5. Keep `server/.env` in `.gitignore` (already configured)

## License

MIT
