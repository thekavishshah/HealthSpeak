# UMLS Integration - Quick Start Checklist

## Prerequisites
- [ ] PostgreSQL database running
- [ ] Node.js and npm installed
- [ ] HealthSpeak project cloned/downloaded

## Setup Steps (5 minutes)

### 1. Get UMLS API Key
- [ ] Go to https://uts.nlm.nih.gov/uts/signup-login
- [ ] Sign up or log in
- [ ] Navigate to https://uts.nlm.nih.gov/uts/profile
- [ ] Generate/copy your API key

### 2. Configure Environment Variables
- [ ] Open `/server/.env`
- [ ] Add your UMLS API key:
  ```
  UMLS_API_KEY=your-actual-api-key-here
  ```
- [ ] Verify database credentials:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=healthspeak
  DB_USER=postgres
  DB_PASSWORD=your-actual-password
  ```

### 3. Enable Database Initialization
- [ ] Open `/server/server.js`
- [ ] Find line ~50-51
- [ ] Uncomment the initialization line:
  ```javascript
  initializeDatabase().catch(console.error);
  ```

### 4. Install Dependencies
```bash
cd server
npm install
```

### 5. Start the Server
```bash
npm run dev
```

Expected output:
```
Connected to PostgreSQL database
Database schema initialized successfully
🏥 HealthSpeak Server is running on port 3001
```

### 6. Test the Integration
- [ ] Start the frontend: `cd frontend && npm run dev`
- [ ] Open http://localhost:5173
- [ ] Search for "Diabetes" or "Hypertension"
- [ ] Verify you see:
  - AI-generated explanation (top)
  - UMLS Medical Classification section (bottom with codes)

## Expected Results

When searching for a medical term, you should see:

### AI-Generated Content
- Definition
- Common Symptoms
- Possible Causes
- Related Terms

### UMLS Medical Classification (NEW!)
- Concept Identifier (CUI)
- Medical Categories (Semantic Types)
- ICD-10 Codes
- SNOMED CT Codes
- Medical Definitions from trusted sources
- Available in Vocabularies

## Troubleshooting

### No UMLS section showing?
1. Check browser console for errors
2. Open DevTools → Network tab
3. Check the `/api/search` response
4. Verify `umls` field is present in response

### Server errors?
1. Check UMLS API key is correct
2. Verify database is running: `docker ps`
3. Check server logs for error messages

### Database connection failed?
```bash
# Test connection
psql -U postgres -d healthspeak

# If database doesn't exist, create it:
createdb -U postgres healthspeak
```

## Verification Commands

### Check Database Tables
```sql
psql -U postgres -d healthspeak

-- List all tables
\dt

-- You should see:
-- umls_terms_cache
-- medical_terms_cache
-- users
-- search_history
-- chat_history
```

### Check Cached Data
```sql
-- After searching for "diabetes"
SELECT term, cached_at FROM umls_terms_cache;
```

## Quick Links

- Full Documentation: `UMLS_INTEGRATION_GUIDE.md`
- UMLS Profile: https://uts.nlm.nih.gov/uts/profile
- API Documentation: https://documentation.uts.nlm.nih.gov/rest/home.html
- Support: https://support.nlm.nih.gov/

## What's Next?

✅ **Integration Complete!** Your app now provides:
- Standardized medical codes (ICD-10, SNOMED CT)
- Professional medical definitions
- Concept identifiers for cross-referencing
- Semantic categorization
- All cached for performance

### Optional Enhancements
- Pre-cache common medical terms
- Add export functionality (PDF/CSV)
- Implement code-based search
- Add analytics dashboard

---

**Need help?** Check `UMLS_INTEGRATION_GUIDE.md` for detailed troubleshooting and advanced features.
