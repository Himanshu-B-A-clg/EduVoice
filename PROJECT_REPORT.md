# EduVoice: Technical Specification & Limitations Report

This document provides a comprehensive summary of every technology used in the EduVoice project, its role, and the specific limitations imposed by the current "Free Tier" hosting architecture.

---

## 1. Hosting Architecture (The Infrastructure)

### **A. Frontend Hosting: Vercel**
*   **Role**: Hosts the React Website (HTML, CSS, JS) and serves it to users worldwide.
*   **Plan**: Hobby (Free).
*   **Limitations**:
    *   **Bandwidth**: 100 GB / month (More than enough for thousands of visitors).
    *   **Commercial Use**: Not allowed on the free plan (Academic/Personal use only).
    *   **Serverless Functions**: 10 seconds execution limit (Not applicable here as we don't use internal API routes).

### **B. Backend Hosting: Render**
*   **Role**: Hosts the Python/FastAPI "Brain" that connects to AI services.
*   **Plan**: Free Tier.
*   **Critical Limitations (IMPORTANT)**:
    *   **Sleep Mode**: The server **goes to sleep** after 15 minutes of inactivity.
        *   **Impact**: The first person to visit the site after a break will experience a **50-second delay** while the server wakes up.
        *   **Solution**: We set up a "Pinger" (cron-job) to hit the server every 10 minutes to prevent this.
    *   **RAM**: 512 MB.
        *   **Impact**: Sufficient for text processing, but cannot handle heavy video processing or running local AI models.
    *   **Usage Scenarios**: Good for demos and small scale use. Not for high-traffic production without upgrading ($7/mo).

---

## 2. Artificial Intelligence (AI)

### **A. Large Language Model (LLM): Groq (Llama 3)**
*   **Role**: Generates stories, simplifies text, and creates quizzes instantly.
*   **Technology**: Uses the `Llama-3-70b` model via Groq's ultra-fast inference API.
*   **Limitations**:
    *   **Rate Limits**: Groq Free Tier allows roughly **30 requests per minute** or **14,400 requests per day**.
    *   **Context Window**: Can process about 8,000 tokens (approx. 6,000 words) at once. If a story is too long, the AI might "forget" the beginning.
    *   **Privacy**: Data is sent to Groq's servers for processing (standard for cloud AI).

### **B. Speech Recognition (ASR): Web Speech API**
*   **Role**: Listens to the user reading aloud and converts speech to text in real-time.
*   **Technology**: Native Browser API (Chrome/Edge/Safari).
*   **Limitations**:
    *   **Browser Dependency**: Works best in **Chrome** and **Edge**. Performance in Firefox/Safari may vary or require permissions.
    *   **Offline Capability**: Most browsers require internet to process speech accurately, even though it's a "browser" API.
    *   **Session**: Continuous listening often stops after a minute of silence (we added code to auto-restart it, but it's a known quirk).

---

## 3. Database & Authentication

### **A. Database: Firebase Firestore**
*   **Role**: Stores user profiles, session reports, "struggle words", and reading history.
*   **Plan**: Spark (Free).
*   **Limitations**:
    *   **Writes**: 20,000 writes per day.
    *   **Reads**: 50,000 reads per day.
    *   **Storage**: 1 GB total storage.
    *   **Impact**: Practically unlimited for a student project (enough for hundreds of users for years).

### **B. Authentication: Firebase Auth**
*   **Role**: Handles Login, Sign Up, and Password Management.
*   **Limitations**:
    *   **Monthly Active Users**: 50,000 free users per month (Huge limit).

---

## 4. Code & Frameworks

### **A. Frontend Framework: React + Vite**
*   **Core Library**: `React (v18)`
*   **Build Tool**: `Vite` (Extremely fast bundling).
*   **Styling**: `TailwindCSS` (Utility-first CSS for responsive design).
*   **Charts**: `Recharts` (For the progress bar charts).
*   **Animations**: `Framer Motion` (For smooth transitions).

### **B. Backend Framework: FastAPI (Python)**
*   **Language**: Python 3.9+
*   **Framework**: `FastAPI` (Modern, high-performance web framework).
*   **Server**: `Uvicorn` (ASGI server to run Python on the web).

---

## 5. Summary of "Time Limits"

| Component | Condition | Time Limit / Delay | Fix Installed? |
| :--- | :--- | :--- | :--- |
| **Backend (Render)** | Inactivity > 15 mins | **50s Wake-up Delay** | ✅ Yes (Cron Job pinger) |
| **AI (Groq)** | Per Request | **< 1 Second** (Ultra fast) | N/A |
| **Speech API** | Silence | **~60 Seconds** (Auto-stop) | ✅ Yes (Auto-restart code) |
| **Firebase Auth** | Login Session | **Indefinite** (Persists) | N/A |

---

## 6. Deployment Links (Bookmark These)
*   **Live Website (Frontend)**: `https://edu-voice-ashy.vercel.app`
*   **Live Backend (API)**: `https://eduvoice-backend-oy2d.onrender.com`
*   **Cron Job (Keep-Alive)**: Used to prevent Render sleep mode.
