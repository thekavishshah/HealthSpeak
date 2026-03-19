# UMLS Integration Guide for HealthSpeak

## Overview

HealthSpeak now integrates with the **UMLS (Unified Medical Language System)** knowledge base to provide standardized medical terminology, codes, and classifications alongside AI-generated explanations.

### What's Included

- **CUI (Concept Unique Identifier)**: Standardized medical concept identifiers
- **ICD-10 Codes**: International Classification of Diseases codes
- **SNOMED CT Codes**: Systematized Nomenclature of Medicine codes
- **Semantic Types**: Medical categorization (e.g., Disease or Syndrome, Pharmacologic Substance)
- **Medical Definitions**: Professional definitions from trusted medical sources
- **Related Concepts**: Medically related terms and concepts
- **Vocabulary Mappings**: Cross-references across multiple medical vocabularies

---

## Setup Instructions

### Step 1: Get Your UMLS API Key

1. **Create a UTS Account**
   - Go to: https://uts.nlm.nih.gov/uts/signup-login
   - Click "Sign Up" if you don't have an account
   - Fill in your information and agree to the terms of service

2. **Generate API Key**
   - After logging in, go to: https://uts.nlm.nih.gov/uts/profile
   - Look for the "API KEY" section
   - Click "Generate new API Key" or use your existing key
   - Copy the API key

3. **Add API Key to Environment**
   - Open `/server/.env`
   - Replace `your-umls-api-key-here` with your actual API key:
     ```
     UMLS_API_KEY=your-actual-api-key-here
     ```

### Step 2: Configure Database

The UMLS integration requires a PostgreSQL database for caching results.

1. **Make sure PostgreSQL is running**
   ```bash
   # If using Docker (as in your current setup)
   docker ps | grep postgres

   # If needed, start your PostgreSQL container
   docker-compose up -d
   ```

2. **Update Database Credentials in .env**
   Open `/server/.env` and configure:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=healthspeak
   DB_USER=postgres
   DB_PASSWORD=your-actual-password
   ```

3. **Initialize Database Schema**

   The database schema will be automatically created when you uncomment the initialization line in `server/server.js`:

   **File: `/server/server.js`** (around line 50-51)

   Change:
   ```javascript
   // Initialize database on startup (disabled for development - authentication in progress)
   // initializeDatabase().catch(console.error);
   ```

   To:
   ```javascript
   // Initialize database on startup
   initializeDatabase().catch(console.error);
   ```

   This will create the necessary tables including:
   - `umls_terms_cache` - Caches UMLS API responses (30-day TTL)
   - `medical_terms_cache` - Caches AI-generated responses (7-day TTL)
   - `users`, `search_history`, `chat_history` - User data tables

### Step 3: Install Dependencies

If not already installed, make sure axios is installed:

```bash
cd server
npm install axios
```

### Step 4: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
Connected to PostgreSQL database
Database schema initialized successfully
🏥 HealthSpeak Server is running on port 3001
```

---

## How It Works

### Architecture

```
User Search Request
       ↓
   API Endpoint (/api/search)
       ↓
   ┌──────────────────────┐
   │ 1. Check UMLS Cache  │
   └──────────────────────┘
       ↓ (if not cached)
   ┌──────────────────────┐
   │ 2. Query UMLS API    │
   │    - Search term     │
   │    - Get CUI         │
   │    - Get codes       │
   │    - Get definitions │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ 3. Cache UMLS Data   │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ 4. Get AI Response   │
   │    (OpenAI GPT-4o)   │
   └──────────────────────┘
       ↓
   ┌──────────────────────┐
   │ 5. Combine Both      │
   │    - AI explanation  │
   │    - UMLS codes      │
   └──────────────────────┘
       ↓
   Return to Frontend
```

### Caching Strategy

- **UMLS Cache**: 30 days (medical codes rarely change)
- **AI Cache**: 7 days (can be refreshed more frequently)
- Both caches use PostgreSQL JSONB for efficient storage

### Graceful Degradation

The system is designed to work even if:
- UMLS API is unavailable → AI data is still returned
- UMLS API key is not configured → Warning logged, AI data returned
- AI service fails but UMLS succeeds → UMLS data with medical definitions returned

---

## API Response Format

### Before (AI Only)
```json
{
  "success": true,
  "data": {
    "term": "Diabetes",
    "definition": "A chronic condition...",
    "symptoms": [...],
    "causes": [...],
    "relatedTerms": [...]
  }
}
```

### After (AI + UMLS)
```json
{
  "success": true,
  "data": {
    "term": "Diabetes",
    "definition": "A chronic condition...",
    "symptoms": [...],
    "causes": [...],
    "relatedTerms": [...],
    "umls": {
      "cui": "C0003873",
      "preferredName": "Diabetes Mellitus",
      "semanticTypes": [
        {"name": "Disease or Syndrome", "uri": "..."}
      ],
      "icd10Codes": [
        {"code": "E11.9", "name": "Type 2 diabetes mellitus without complications"}
      ],
      "snomedCodes": [
        {"code": "73211009", "name": "Diabetes mellitus"}
      ],
      "definitions": [
        {
          "source": "NCI",
          "value": "A metabolic disorder characterized by..."
        }
      ],
      "sourceVocabularies": ["ICD10CM", "SNOMEDCT_US", "MSH"],
      "relatedConcepts": [
        {"cui": "C0011860", "name": "Type 2 Diabetes Mellitus", "relationLabel": "isa"}
      ]
    }
  }
}
```

---

## Frontend Display

The UMLS data is displayed in a new section called "Medical Classification (UMLS)" on the results page with:

- **Concept Identifier**: CUI and preferred medical name
- **Medical Categories**: Semantic type badges
- **ICD-10 Codes**: List of ICD-10 codes with descriptions
- **SNOMED CT Codes**: List of SNOMED codes
- **Medical Definitions**: Professional medical definitions
- **Available Vocabularies**: Shows which medical vocabularies contain this term

### Styling

- Gradient background to distinguish from AI content
- Color-coded badges and labels
- Monospace font for medical codes
- Responsive design for mobile devices
- Light/dark mode support

---

## Testing the Integration

### Test 1: Basic Search

1. Start the frontend and backend servers
2. Search for a common medical term like "Hypertension"
3. Check that you see both:
   - AI-generated explanation (top sections)
   - UMLS Medical Classification section (bottom)

### Test 2: Verify Caching

1. Search for "Diabetes"
2. Check server logs - should see: `Fetching UMLS data for: Diabetes`
3. Search for "Diabetes" again
4. Check server logs - should see: `Using cached UMLS data for: Diabetes`

### Test 3: Check Database

```sql
-- Connect to PostgreSQL
psql -U postgres -d healthspeak

-- Check UMLS cache
SELECT term, cached_at FROM umls_terms_cache;

-- View full UMLS data for a term
SELECT umls_data FROM umls_terms_cache WHERE term = 'diabetes';
```

### Test 4: Error Handling

1. Temporarily set an invalid UMLS API key
2. Search for a term
3. Should still see AI-generated content with a warning in server logs
4. No error shown to user

---

## Files Modified/Created

### New Files
- `/server/services/umlsService.js` - UMLS API integration service

### Modified Files
- `/server/server.js` - Updated search endpoint to integrate UMLS
- `/server/services/database.js` - Added UMLS caching functions
- `/frontend/src/components/ResultsPage.jsx` - Added UMLS display section
- `/frontend/src/components/ResultsPage.css` - Added UMLS styling
- `/server/.env` - Added UMLS_API_KEY configuration
- `/server/package.json` - Added axios dependency

---

## Troubleshooting

### Issue: "UMLS_API_KEY not found in environment variables"

**Solution**: Make sure you've added your API key to `/server/.env` and restarted the server.

### Issue: Database connection error

**Solution**:
1. Check PostgreSQL is running: `docker ps`
2. Verify credentials in `.env` match your database
3. Test connection: `psql -U postgres -d healthspeak`

### Issue: "No UMLS results found"

**Solution**:
- This is normal for very rare or misspelled terms
- The system will still return AI-generated content
- Try a common medical term like "Diabetes" or "Hypertension"

### Issue: UMLS section not showing in frontend

**Solution**:
1. Check browser console for errors
2. Verify API response includes `umls` field in DevTools Network tab
3. Clear browser cache and reload

### Issue: Rate limiting from UMLS API

**Solution**:
- UMLS API has rate limits (not publicly documented)
- Caching helps reduce API calls
- Consider implementing exponential backoff if needed

---

## Performance Considerations

### Cache Hit Rates

With proper caching, you should expect:
- **First search**: ~1-2 seconds (UMLS API + AI)
- **Cached search**: ~200-500ms (AI only, UMLS from cache)
- **Fully cached**: ~100-200ms (both from cache)

### Database Storage

Each cached UMLS entry is approximately:
- **Storage**: 2-10 KB per term (depending on code mappings)
- **1000 terms**: ~5 MB
- **10,000 terms**: ~50 MB

PostgreSQL JSONB provides excellent performance for this use case.

---

## Next Steps

### Recommended Enhancements

1. **Background Jobs**: Pre-cache common medical terms
2. **Admin Dashboard**: View cache statistics and manage cached terms
3. **Analytics**: Track which UMLS codes are most frequently searched
4. **Export Feature**: Allow users to export medical codes (PDF/CSV)
5. **Code Lookup**: Add reverse lookup - search by ICD-10 or SNOMED code

### UMLS Advanced Features

The UMLS API offers additional endpoints not yet integrated:
- **Crosswalk**: Map codes between different vocabularies
- **Ancestors/Descendants**: Hierarchical relationships
- **Semantic Network**: Detailed semantic type relationships

---

## Support & Resources

- **UMLS Documentation**: https://documentation.uts.nlm.nih.gov/rest/home.html
- **UTS Support**: https://support.nlm.nih.gov/
- **API Key Management**: https://uts.nlm.nih.gov/uts/profile
- **UMLS License Agreement**: https://uts.nlm.nih.gov/uts/license

---

## License & Terms

By using the UMLS API, you agree to the UMLS License Agreement. The UMLS is provided by the U.S. National Library of Medicine (NLM) and usage must comply with their terms of service.

Key points:
- Free for research and development
- Attribution to NLM required
- Cannot redistribute UMLS data
- Must have active UTS account

---

**Integration completed successfully!** 🎉

Your HealthSpeak application now provides professional medical terminology alongside patient-friendly AI explanations.
