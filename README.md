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
- Node.js with Express
- Google Gemini AI (@google/generative-ai)
- CORS enabled API

**Database:**
- PostgreSQL 16 (Docker)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for PostgreSQL - optional)
- Gemini API key from Google AI Studio

## Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Setup Backend Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Setup Frontend

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install
```

### 4. Run the Application

You need to run both the backend and frontend servers:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server will start on `http://localhost:3001`

**Terminal 2 - Frontend:**
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
GET http://localhost:3001/api/health
```

#### Search Medical Term
```
POST http://localhost:3001/api/search
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

### Backend Development
```bash
cd server
npm run dev          # Start with auto-reload
npm start            # Start production server
```

## Environment Variables

### Backend (.env in server/)
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

## Security Notes

- Never commit `.env` files to git
- Keep your Gemini API key private
- The `.env` file is already in `.gitignore`
- API keys should be rotated periodically

## Troubleshooting

### Backend server won't start
- Ensure Node.js v18+ is installed: `node --version`
- Check if port 3001 is available
- Verify your Gemini API key is correctly set in `.env`

### Frontend can't connect to backend
- Ensure backend server is running on port 3001
- Check browser console for CORS errors
- Verify `API_BASE_URL` in ResultsPage.jsx matches your backend URL

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
