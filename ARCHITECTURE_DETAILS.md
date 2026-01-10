# EduVoice: How It Works - Detailed Architecture Flow

This document explains exactly how the Frontend, Backend, and AI components work together in real-time when a user interacts with EduVoice.

---

## 🏗️ The 3 Pillars of EduVoice

1.  **The Frontend (Vercel)**: The "Face" of the app. It's what you see.
2.  **The Backend (Render)**: The "Brain" of the app. It thinks and calls AI.
3.  **The Database (Firebase)**: The "Memory" of the app. It remembers users and reports.

---

## 🔄 Scenario: A User Generates a Story about "Space"

Here is the step-by-step journey of data when a user clicks the button:

### 1. User Interaction (Frontend)
*   User opens the website (`edu-voice-ashy.vercel.app`).
*   **Vercel** sends the HTML/JS code to the user's browser.
*   User types "Space" and clicks **"Generate Story"**.
*   **Code Action**: The Javascript running in the browser sends a `POST` request to the backend.
    *   *Payload*: `{ "topic": "Space", "difficulty": "Hard" }`
    *   *Destination*: `https://eduvoice-backend-oy2d.onrender.com/generate-story`

### 2. Processing (Backend on Render)
*   The Python server (FastAPI) receives this request.
*   It checks the API key (security).
*   It constructs a prompt for the AI: *"Write a short story about Space for a dyslexic student. Keep sentences simple."*
*   It calls the **Groq API** (Llama 3 model) with this prompt.

### 3. AI Generation (Groq Cloud)
*   **Groq** (External AI Service) effectively "thinks" and generates the story text in milliseconds.
*   It sends the text back to your **Backend**.

### 4. Response (Backend -> Frontend)
*   The Backend receives the AI story.
*   It formats it into JSON: `{ "title": "The Star", "content": "Once upon a time..." }`
*   It sends this JSON back to the **Frontend**.

### 5. Display (Frontend)
*   Accessibilty Check: The Frontend receives the text.
*   It renders the text using the **OpenDyslexic Font**.
*   It gets the browser ready to listen (Microphone).

---

## 🎤 Scenario: A User Reads Aloud (Speech Recognition)

### 1. Listening (Browser API)
*   User clicks **"Start Reading"**.
*   The Website tells the **Browser** (Chrome/Edge): *"Turn on the microphone and tell me what the user says."*
*   **Note**: This happens locallly in the browser. No audio is sent to the backend (Privacy friendly).

### 2. Comparison (Frontend Logic)
*   **Expected Word**: "Astronaut" (from the story on screen).
*   **Spoken Word**: "Astro... naught" (received from Microphone).
*   **Logic**:
    *   The Javascript compares the two words.
    *   If they match -> Turn word **Green**.
    *   If they don't match or user pauses -> Wait 3 seconds -> Highlight word **Yellow** (Help).

### 3. Saving Progress (Firebase)
*   When the user finishes, the Frontend calculates the score (e.g., "90% Accuracy").
*   It sends this score to **Firebase Firestore**.
*   **Firebase** saves it securely under the user's ID so the teacher/parent can see it later in the Reports dashboard.

---

## 🛠️ Summary of "Who Does What"

| Component | Technology | Responsibility | Hosted On |
| :--- | :--- | :--- | :--- |
| **User Interface** | React + Vite | Buttons, Colors, Fonts, Logic | **Vercel** |
| **Logic Server** | Python FastAPI | Handling requests, API Keys | **Render** |
| **AI Generation** | Llama 3 (via Groq) | Writing stories, simplifying text | **Groq Cloud** |
| **Ears (Voice)** | Web Speech API | Listening to microphone | **User's Browser** |
| **Storage** | Firebase | Saving Users, Passwords, Scores | **Google Cloud** |

---

## ⚠️ The Limitation Fix (Cron Job)
*   **The Issue**: The **Render** server goes to sleep if no one asks for a story for 15 minutes.
*   **The Fix**: **Cron-Job.org** sends a fake "Hello" signal to the Render server every 10 minutes.
*   **Result**: The server stays awake, so when a real user clicks "Generate", it responds instantly instead of waking up groggily (which would take 50s).
