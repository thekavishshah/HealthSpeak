# HealthSpeak - Gemini AI Integration Setup Guide

This guide will help you set up and run HealthSpeak with Google Gemini AI integration.

## Step-by-Step Setup

### Step 1: Configure Your Gemini API Key

1. **Get your API key:**
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Add the API key to your backend:**
   ```bash
   cd server
   ```

3. **Open the `.env` file** in a text editor and replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIza...your_actual_key_here
   PORT=3001
   ```

### Step 2: Start the Backend Server

Open a terminal window and run:

```bash
cd server
npm run dev
```

You should see:
```
HealthSpeak API server running on port 3001
Health check: http://localhost:3001/api/health
```

**Keep this terminal window open!**

### Step 3: Start the Frontend

Open a **NEW terminal window** (keep the backend running) and run:

```bash
# Make sure you're in the HealthSpeak root directory
npm run dev
```

You should see:
```
  VITE v7.2.2  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Test the Application

1. Open your browser and go to `http://localhost:5173`

2. Log in with demo credentials:
   - Patient ID: `HS-12345`
   - Date of Birth: `2000-05-04`

3. Search for a medical term (e.g., "diabetes", "asthma", "migraine")

4. Watch as Gemini AI generates:
   - A clear, patient-friendly definition
   - Common symptoms
   - Possible causes
   - Related medical terms

## What You Should See

### Loading State
When you search for a term, you'll see:
- A spinning loader
- "Analyzing medical term with AI..." message

### Results
After a few seconds, you'll see:
- The medical term as a title
- A simple definition
- 6 common symptoms in a grid layout
- 4 possible causes in a list
- 4 related terms as clickable buttons

## Troubleshooting

### Problem: Backend won't start
**Error:** `Error: API key not valid`
- **Solution:** Check that your `GEMINI_API_KEY` in `server/.env` is correct

**Error:** `Port 3001 is already in use`
- **Solution:** Either stop the process using port 3001, or change the PORT in `server/.env`

### Problem: Frontend shows error
**Error:** "Unable to Load Information"
- **Solution:** Make sure the backend server is running on port 3001
- Check the backend terminal for error messages

**Error:** "Failed to fetch medical information"
- **Solution:**
  1. Check your internet connection
  2. Verify your Gemini API key is valid
  3. Check if you've exceeded API quota limits

### Problem: Slow responses
- Gemini AI typically takes 2-5 seconds to respond
- First request may be slower
- Complex medical terms may take longer to process

## Testing Different Medical Terms

Try searching for these terms to test the AI:

**Common Conditions:**
- Hypertension
- Diabetes
- Asthma
- Migraine
- Arthritis

**Symptoms:**
- Fever
- Headache
- Fatigue
- Nausea

**Body Parts:**
- Heart
- Kidney
- Liver
- Lungs

## How It Works

1. **User searches** for a medical term in the frontend
2. **Frontend sends** a POST request to `http://localhost:3001/api/search`
3. **Backend receives** the request and calls Gemini AI
4. **Gemini AI generates** a structured response with medical information
5. **Backend formats** the response as JSON
6. **Frontend displays** the results in a user-friendly format

## API Response Example

When you search for "Hypertension", Gemini returns:

```json
{
  "success": true,
  "data": {
    "term": "Hypertension",
    "definition": "High blood pressure is a common condition where...",
    "symptoms": [
      "Severe headaches",
      "Chest pain",
      "Dizziness",
      "Difficulty breathing",
      "Nausea",
      "Blurred vision"
    ],
    "causes": [
      "Family history and genetics",
      "Being overweight or obese",
      "Lack of physical activity",
      "High salt intake"
    ],
    "relatedTerms": [
      "Blood Pressure",
      "Cardiovascular Disease",
      "Stroke",
      "Heart Disease"
    ]
  }
}
```

## Next Steps

Now that you have Gemini AI integrated, you can:

1. **Customize the AI prompt** in `server/services/geminiService.js` to change the output format
2. **Add caching** to avoid redundant API calls for the same terms
3. **Implement search history** using the PostgreSQL database
4. **Add user authentication** with backend validation
5. **Deploy to production** (remember to use environment variables!)

## Need Help?

- Check the main README.md for more details
- Review the server logs in the terminal
- Check the browser console for frontend errors
- Ensure both servers are running simultaneously

Happy coding!
