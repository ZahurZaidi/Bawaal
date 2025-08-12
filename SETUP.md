# Environment Setup Guide

## ✅ Current Status

Your environment is now correctly configured for Supabase! Here's what has been fixed:

### 1. Dependencies Fixed ✅
- **`httpx` version conflict resolved**: Updated to `>=0.25.2` to be compatible with `supabase==2.0.2`
- **`torch` and `torchaudio` versions pinned**: Set to `2.7.0` to prevent conflicts
- **All dependencies are compatible**: `pip check` shows no conflicts

### 2. Environment Files Created ✅
- **Backend**: `backend/env.example` created with all required variables
- **Frontend**: `frontend/env.example` already exists

## 🚀 Next Steps

### 1. Create Your Environment Files

**Backend Setup:**
```bash
cd backend
cp env.example .env
# Edit .env with your actual Supabase credentials
```

**Frontend Setup:**
```bash
cd frontend
cp env.example .env
# Edit .env with your actual Supabase credentials
```

### 2. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings → API
3. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY` (frontend)
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (backend)

### 3. Set Up Database Schema

**Option 1: Try the main schema first (recommended)**
1. In your Supabase project, go to SQL Editor
2. Run the contents of `supabase/schema.sql`
3. This creates all required tables with proper RLS policies

**Option 2: If you get pgvector extension error**
If you see the error "extension 'pgvector' is not available", use the fallback schema:
1. In your Supabase project, go to SQL Editor
2. Run the contents of `supabase/schema_fallback.sql` instead
3. This uses JSONB for embeddings instead of vector types

**Note:** The main schema is preferred for better performance, but the fallback schema will work for basic functionality.

### 4. Install Dependencies

**Backend:**
```bash
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 5. Test Your Setup

**Run the setup test:**
```bash
python test_setup.py
```

This will test:
- ✅ Supabase connection
- ✅ Vector extension availability
- ✅ Database schema status

**Manual Backend Test:**
```bash
cd backend
python -c "from supabase import create_client; print('Supabase client imported successfully')"
```

**Frontend Test:**
```bash
cd frontend
npm run dev
```

### 6. Start the Application

**Option 1: Use the startup script (Recommended)**
```bash
# Windows PowerShell
.\start_app.ps1

# Windows Command Prompt
start_app.bat
```

**Option 2: Manual startup**
```bash
# Terminal 1: Backend
cd backend
python run_backend.py

# Terminal 2: Frontendy
cd frontend
npm run dev
```

**Option 3: If Ollama is not installed**
1. Download from [ollama.ai](https://ollama.ai)
2. Install and run: `ollama pull llama2`
3. Start: `ollama serve`
4. Then use Option 1 or 2 above

## 🔧 Environment Variables Reference

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
HOST=0.0.0.0
PORT=8000
DEBUG=true
EMBEDDING_MODEL=all-MiniLM-L6-v2
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

## 🚨 Important Notes

1. **Never commit `.env` files** - they contain sensitive credentials
2. **Use different keys for frontend and backend**:
   - Frontend: `SUPABASE_ANON_KEY` (public, safe for client-side)
   - Backend: `SUPABASE_SERVICE_ROLE_KEY` (private, server-side only)
3. **Enable Row Level Security (RLS)** in Supabase for data protection

## 🐛 Troubleshooting

### Common Issues:

1. **"SUPABASE_URL and SUPABASE_ANON_KEY must be set"**
   - Check that your `.env` file exists and has the correct variable names
   - Ensure no extra spaces or quotes around values

2. **"Invalid authentication credentials"**
   - Verify your Supabase keys are correct
   - Check that RLS policies are properly configured

3. **CORS errors**
   - Ensure `ALLOWED_ORIGINS` includes your frontend URL
   - Check Supabase project settings for allowed origins

4. **Database connection errors**
   - Verify your Supabase project is active
   - Check that the schema has been applied correctly

## ✅ Verification Checklist

- [ ] Environment files created (`.env`)
- [ ] Supabase credentials added
- [ ] Database schema applied
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Backend starts without errors
- [ ] Frontend connects to Supabase
- [ ] Authentication works
- [ ] Database operations succeed

Your environment is now ready for development! 🎉 