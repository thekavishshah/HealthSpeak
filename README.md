# HealthSpeak

A healthcare communication platform powered by Google Gemini AI that simplifies medical terminology for patients.

## Overview

HealthSpeak bridges the communication gap between patients and healthcare providers by providing clear, accessible definitions of medical terms. Using Google's Gemini AI, the platform generates patient-friendly explanations including:

- Simple definitions without complex medical jargon
- Common symptoms
- Possible causes
- Related medical terms

## Technology Stack

**Frontend:**
- React 19.2.0
- React Router DOM 7.10.1
- Vite 7.2.2
- CSS3 with theme support (Light/Dark mode)

**Backend:**
- Django 5.2.11
- Django REST Framework
- PostgreSQL 16
- Docker & Docker Compose
- Google Gemini AI integration

**Database:**
- PostgreSQL 16 (Docker)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker & Docker Compose (required)
- Python 3.12+ (included in Docker)
- Gemini API key from Google AI Studio

## Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Setup Backend with Docker

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd HealthSpeak

# Start Docker containers (PostgreSQL + Django backend)
docker compose up -d

# Wait for containers to start, then run migrations
docker compose exec web python manage.py migrate

# Create the default superuser (both you and your team can use these credentials)
docker compose exec web python manage.py init_superuser
```

**Default Admin Credentials:**
- Username: `healthspeakAdmin`
- Password: `sundevils123`
- Admin URL: `http://localhost:8000/admin/`

Note: Everyone on your team should run `init_superuser` to get the same admin credentials.

### 3. Setup Frontend

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install
```

### 4. Run the Application

**Backend (Django + PostgreSQL):**
The backend is already running via Docker Compose on `http://localhost:8000`

To view logs:
```bash
docker compose logs -f web
```

To stop the backend:
```bash
docker compose down
```

**Frontend:**
```bash
npm run dev
```
Frontend will start on `http://localhost:5173`

### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

**Demo Credentials:**
- Patient ID: `HS-12345`
- Date of Birth: `2000-05-04`

## Features

### Current Features
- Patient authentication (login/signup)
- Medical term search with AI-powered responses
- Comprehensive medical information display
- Dark/Light theme support
- Responsive design for mobile and desktop
- Text-to-speech accessibility feature
- Related terms navigation

### AI-Powered Search
The application uses Google Gemini AI to:
- Understand medical terminology
- Generate patient-friendly explanations
- Provide context with symptoms and causes
- Suggest related medical concepts

## Project Structure

```
HealthSpeak/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── LandingPage.jsx   # Search interface
│   │   ├── ResultsPage.jsx   # AI results display
│   │   ├── Login.jsx         # Authentication
│   │   └── ...
│   ├── context/              # React Context (Theme, Settings)
│   └── App.jsx               # Main app component
├── server/                   # Backend API server
│   ├── services/
│   │   └── geminiService.js  # Gemini AI integration
│   ├── server.js             # Express server
│   ├── .env                  # Environment variables (not in git)
│   └── package.json          # Server dependencies
├── public/                   # Static assets
├── docker-compose.yml        # PostgreSQL configuration
└── package.json              # Frontend dependencies
```

## API Documentation

### Backend Endpoints

#### Health Check
```
GET http://localhost:8000/api/health
```

#### Search Medical Term
```
POST http://localhost:8000/api/search
Content-Type: application/json

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
    "definition": "Clear explanation...",
    "symptoms": ["headaches", "dizziness", ...],
    "causes": ["genetics", "lifestyle", ...],
    "relatedTerms": ["Blood Pressure", "Cardiovascular Disease", ...]
  }
}
```

## Development

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development (Django)

```bash
# Start containers in development mode
docker compose up

# Run Django management commands
docker compose exec web python manage.py <command>

# Create migrations after model changes
docker compose exec web python manage.py makemigrations

# Apply migrations
docker compose exec web python manage.py migrate

# Access Django shell
docker compose exec web python manage.py shell

# Create/reset superuser credentials
docker compose exec web python manage.py init_superuser
```

## Environment Variables

### Backend (Django Settings)
Django settings are in `/backend/config/settings.py`

Database credentials are configured in `docker-compose.yml`:
```yaml
POSTGRES_DB: healthspeak
POSTGRES_USER: healthspeak_user
POSTGRES_PASSWORD: healthspeak_pass
```

## Security Notes

- Never commit `.env` files to git
- Keep your Gemini API key private
- The `.env` file is already in `.gitignore`
- API keys should be rotated periodically

## Troubleshooting

### Docker containers won't start
- Ensure Docker is running: `docker --version`
- Check if ports 8000 and 5432 are available
- Try rebuilding containers: `docker compose up --build`
- View container logs: `docker compose logs`

### Backend server errors
- Check container status: `docker compose ps`
- View Django logs: `docker compose logs web`
- Restart containers: `docker compose restart`
- If timezone errors occur, ensure Dockerfile uses `python:3.12-slim` (not `python:3`)

### Cannot access admin page
- Ensure containers are running: `docker compose ps`
- Run the superuser command: `docker compose exec web python manage.py init_superuser`
- Access admin at: `http://localhost:8000/admin/`
- Use credentials: `healthspeakAdmin` / `sundevils123`

### Frontend can't connect to backend
- Ensure backend server is running on port 8000: `curl http://localhost:8000/admin/`
- Check browser console for CORS errors
- Verify CORS settings in `backend/config/settings.py`

### Database connection issues
- Ensure PostgreSQL container is running: `docker compose ps db`
- Check database logs: `docker compose logs db`
- Verify database credentials in `docker-compose.yml` match `settings.py`

### Gemini API errors
- Check if your API key is valid
- Ensure you have API quota remaining
- Check Google AI Studio for API status

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

## Acknowledgments

- Google Gemini AI for medical information generation
- React team for the amazing framework
- All contributors to this project

## Contact

For questions or support, please open an issue on GitHub.

---

**Disclaimer:** This application is for educational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for accurate diagnosis and treatment.
