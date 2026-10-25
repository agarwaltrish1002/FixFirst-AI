# FixFirst AI — Project Context

## Purpose
AI-powered campus maintenance & safety complaint prioritization system for a hackathon.

## Tech Stack
- **Frontend:** HTML/CSS/JS (vanilla, no framework), Vite dev server
- **Backend:** Python, FastAPI
- **Database:** SQLite (auto-created at `backend/fixfirst.db`)
- **AI:** Ollama + Qwen3 1.7B (optional, rule-based fallback works without it)

## Ports
| Service  | Port |
|----------|------|
| Frontend | 5174 |
| Backend  | 8001 |

## Key URLs
- Website: http://localhost:5174/
- API: http://127.0.0.1:8001/api/

## Database
- Location: `backend/fixfirst.db`
- Created automatically on first run
- 8 demo complaints seeded on first launch

## Current Status
- ✅ Backend fully working (FastAPI + SQLite)
- ✅ Frontend fully working (HTML/CSS/JS + Vite)
- ✅ Complaint submission, listing, filtering, search
- ✅ Safety rules engine with priority override
- ✅ Maintenance ticket generation
- ✅ Rule-based fallback when Ollama unavailable
- ✅ Demo data seeded
- ⬜ Ollama AI not installed (fallback active)
