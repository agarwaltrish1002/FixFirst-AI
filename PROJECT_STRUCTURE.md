# FixFirst AI — Project Structure

```
FixFirstAI/
├── backend/
│   ├── __init__.py            # Package marker
│   ├── config.py              # Ports, paths, model settings
│   ├── database.py            # SQLite setup, tables, demo data
│   ├── safety_engine.py       # Rule-based priority engine
│   ├── ai_service.py          # Ollama AI integration + fallback
│   ├── main.py                # FastAPI app, all API routes
│   └── uploads/               # Uploaded complaint images
├── frontend/
│   ├── index.html             # Main SPA page
│   ├── css/style.css          # Complete stylesheet (green theme)
│   ├── js/
│   │   ├── api.js             # Backend API calls
│   │   ├── app.js             # Router, toasts, modals, utilities
│   │   ├── dashboard.js       # Dashboard page
│   │   ├── submit.js          # Complaint submission form
│   │   ├── complaints.js      # Complaints list + detail view
│   │   ├── tickets.js         # Maintenance tickets page
│   │   └── ai-status.js       # AI connection status page
│   ├── package.json           # npm config (vite)
│   └── vite.config.js         # Vite port config (5174)
├── venv/                      # Python virtual environment (gitignored)
├── run_backend.py             # Backend start script
├── start_fixfirst.bat         # One-click launcher (Windows)
├── stop_fixfirst.bat          # Safe shutdown script
├── requirements.txt           # Python dependencies
├── README.md                  # Full documentation
├── .gitignore                 # Git exclusions
├── LICENSE                    # MIT License
├── PROJECT_CONTEXT.md         # Session context for AI assistant
├── HANDOFF.md                 # Session handoff notes
└── PROJECT_STRUCTURE.md       # This file
```
