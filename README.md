Varia-AI

A complete low-latency, multi-tenant AI chat platform with FastAPI backend and React frontend.

## 🚀 Features

- **Text-only chatbot agents** with AI-generated system prompts
- **PDF + text knowledge base** with vector embeddings
- **Supabase Cloud** for auth, database, and file storage
- **Local Ollama LLM** for low-latency inference
- **WebSocket streaming** for real-time chat
- **Multi-tenant architecture** with Row Level Security
- **Modern React UI** with TailwindCSS

## 🏗️ Architecture

```
├── backend/                 # FastAPI backend
│   ├── main.py             # App entry point
│   ├── auth.py             # Supabase JWT auth
│   ├── models.py           # Pydantic models
│   ├── database.py         # Supabase operations
│   ├── ollama_client.py    # Local LLM integration
│   ├── embedding_service.py # Vector embeddings
│   ├── pdf_parser.py       # PDF text extraction
│   └── routes/            # API endpoints
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   └── lib/           # Utilities and API
│   └── package.json
└── supabase/              # Database schema
```

## 🛠️ Quick Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- Ollama installed
- Supabase project

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp backend/.env.example backend/.env
# Edit with your Supabase credentials
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit with your Supabase credentials
```

### 3. Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL editor
3. Get project URL and API keys
4. Update environment files

### 4. Ollama Setup

```bash
# Install Ollama
ollama pull llama2
ollama serve
```

### 5. Run the Application

```bash
# Terminal 1: Backend
cd backend
python run_backend.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## 🔧 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OLLAMA_BASE_URL=http://localhost:11434
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

## 📡 API Endpoints

### Authentication
- Handled by Supabase Auth

### Agents
- `POST /agents` - Create agent
- `GET /agents` - List agents
- `GET /agents/{id}` - Get agent
- `DELETE /agents/{id}` - Delete agent

### Knowledge Base
- `POST /agents/{id}/kb/upload` - Upload file
- `GET /agents/{id}/kb` - List chunks
- `GET /agents/{id}/kb/search` - Search KB

### Chat
- `WS /chat/{agent_id}` - Real-time chat
- `GET /chat/logs/{agent_id}` - Chat history

## 🎯 Usage

1. **Sign up/Login** - Create account or sign in
2. **Create Agent** - Add name and description
3. **Upload Knowledge** - Add PDF/text files
4. **Start Chatting** - Real-time conversation with AI
5. **Manage Agents** - View, edit, or delete agents

## 🚀 Deployment

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy with git push
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist folder
```

## 🔒 Security

- JWT authentication with Supabase
- Row Level Security (RLS) for data isolation
- Input validation with Pydantic
- CORS protection
- Rate limiting (recommended for production)

## 📈 Performance

- Local LLM inference for low latency
- Vector embeddings for fast KB search
- WebSocket streaming for real-time chat
- Optimized React rendering with Zustand

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit PR

## 📄 License

MIT License 
