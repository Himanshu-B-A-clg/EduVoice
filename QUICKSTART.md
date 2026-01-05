# 🚀 Quick Start Guide - EduVoice (v2.0)

## System Requirements
- Node.js (v18+)
- Python (v3.9+)
- Firebase Project (Firestore & Auth enabled)

---

## ⚡ Setup Guide

### 1. Backend Setup (Python)
This handles Speech Recognition (Whisper) and AI logic.

```bash
cd backend
pip install -r requirements.txt
# Place your 'serviceAccountKey.json' in backend/ folder for Admin features (Optional)
python main.py
```
*Server runs on `http://localhost:8000`*

### 2. Frontend Setup (React + Vite)
```bash
# In the root, install dependencies
npm install

# Setup Firebase
# 1. Create a project at console.firebase.google.com
# 2. Add a Web App
# 3. Copy config to src/firebase.js (Replace placeholders)
# 4. Enable "Email/Password" Auth provider
# 5. Create "users" collection in Firestore (optional, app handles it)

# Run the frontend
npm run dev
```

---

## 🎯 How to Use

### 1. Admin / Parent Registration
1. Go to Login Page.
2. Select **Parent / Admin**.
3. Register a new account.
4. You will be redirected to the **Parent Dashboard**.

### 2. Manage Children
1. In Parent Dashboard, click **Add Child**.
2. Enter Name, Age, Grade, and a **4-digit PIN**.
3. Use the **Assign Reading** section to:
   - Type a custom paragraph.
   - OR Generate one using AI (Select Level & Topic).
4. Click **Assign**.

### 3. Child Interface
1. Go to Login Page.
2. Select **Child Login**.
3. Enter Parent's Email -> Search.
4. Select Child Name -> Enter PIN.
5. In Dashboard, see **"Your Reading Tasks"**.
6. Click **Start Reading**.
7. Allow Microphone.
8. Read aloud! (Backend processes speech in real-time).
9. Click **Finish** when done.

### 4. Progress Tracking
- **Child**: Can see completed sessions in their history (but restricted view).
- **Parent**: Can download detailed PDF reports and view full metrics in Parent Dashboard.

---

## 🛠 Troubleshooting

### Backend Connection Failed?
- Ensure `python main.py` is running.
- Check Console for `WebSocket connection failed`.

### Firebase Errors?
- Ensure `src/firebase.js` has valid keys.
- Ensure Firestore Security Rules allow read/write for development.

### Microphone Issues?
- Ensure Browser permission is granted.
- The app streams raw audio to Python backend (16kHz).

---

**Ready to help readers succeed! 🎉**
