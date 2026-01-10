# EduVoice Deployment Guide 

This folder is cleaned and configured for GitHub upload.

##  What's Fixed?
1. **Localhost URLs**: Replaced with \VITE_API_URL\.
2. **Vite Config**: Set \ase: './'\ for GitHub Pages.

##  Deployment Steps

### 1. Frontend (Vite)
*   **Host**: Vercel or Render (Static Site)
*   **Build Command**: \
pm run build\
*   **Publish Dir**: \dist\
*   **Environment Variable**:
    *   Set \VITE_API_URL\ to your backend URL.

### 2. Backend (Python/FastAPI)
*   **Host**: Render (Web Service)
*   **Root Directory**: \ackend\
*   **Build Command**: \pip install -r requirements.txt\
*   **Start Command**: \uvicorn main:app --host 0.0.0.0 --port 10000\
*   **Environment Variables**:
    *   \OPENAI_API_KEY\: Your AI Key.
    *   \serviceAccountKey.json\: Needed for Admin features.

Good luck!
