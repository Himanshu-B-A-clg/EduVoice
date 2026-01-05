# EduVoice Deployment Guide

This guide will help you upload your code to GitHub and host your application live on the web.

## 1. Prerequisites (Install Git)
It looks like **Git** is not installed on your computer.
1.  Download Git from: [git-scm.com](https://git-scm.com/downloads)
2.  Install it (click "Next" through the defaults).
3.  Restart your terminal (or computer) for the changes to take effect.

---

## 2. Upload to GitHub

1.  **Create a New Repository**:
    *   Go to [github.com/new](https://github.com/new).
    *   Name it `eduvoice`.
    *   Make it **Public** (or Private).
    *   Click **Create repository**.

2.  **Push Your Code**:
    Open your terminal in the `EduVoice` folder and run these commands one by one:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of EduVoice"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/eduvoice.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## 3. Host the Frontend (React) on GitHub Pages (Recommended)
I have added a special "Workflow" file that will automatically build your site when you upload to GitHub.

1.  **Upload your code** to GitHub (as described in Step 2).
2.  Go to your Repository **Settings** -> **Pages**.
3.  Under **"Build and deployment"**, change "Source" to **GitHub Actions**.
4.  That's it! GitHub will now build your site.
5.  Wait about 2-3 minutes.
6.  Your site will pass be live at `https://YOUR_USERNAME.github.io/eduvoice/`.

*(Note: You still need Step 4 for the AI Backend)*

---

## 3b. Alternative: Host on Vercel
Vercel is also great and requires no configuration.
1.  Go to [vercel.com](https://vercel.com) and Sign Up with GitHub.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `eduvoice` repository.
4.  **Configure Project**:
    *   Framework Preset: `Vite`
    *   Root Directory: `./`
5.  **Environment Variables**:
    *   Add the variables from your local `.env` file here.
6.  Click **Deploy**.

---

## 4. Host the Backend (Python) on Render
The backend is needed for "AI Story Generation".

1.  Go to [render.com](https://render.com) and Sign Up.
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Runtime**: Python 3
    *   **Build Command**: `pip install -r backend/requirements.txt`
    *   **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
    *   **Root Directory**: `.` (or leave blank)
5.  **Environment Variables**:
    *   Copy everything from `backend/.env` into the Environment Variables section on Render.
    *   `GROQ_API_KEY`, `OPENAI_API_KEY`, etc.
6.  Click **Create Web Service**.

Render will give you a URL like `https://eduvoice-backend.onrender.com`.

### Final Step: Connect Frontend to Backend
1.  Go back to your **Vercel Project Settings** -> **Environment Variables**.
2.  Add a new variable:
    *   Key: `VITE_API_URL`
    *   Value: `https://eduvoice-backend.onrender.com` (Your Render URL)
3.  **Redeploy** the Vercel project.

---

## Summary
*   **GitHub**: Stores your code.
*   **Vercel**: Hosts the visual website (React).
*   **Render**: Runs the AI and logic server (Python).
