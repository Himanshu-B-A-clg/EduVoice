import os
import io
import wave
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore, auth
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize API Client (OpenAI or compatible)
api_key = os.getenv("OPENAI_API_KEY")
base_url = os.getenv("OPENAI_BASE_URL")  # Optional, for Groq/other providers
model_name = os.getenv("MODEL_NAME", "whisper-1")

client = None
if api_key and "your-key-here" not in api_key:
    client = OpenAI(api_key=api_key, base_url=base_url)
    print(f"API Client initialized. Using model: {model_name}")
else:
    print("Warning: OPENAI_API_KEY not set in backend/.env")

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firebase
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Warning: Firebase not initialized properly. Error: {e}")
    db = None

class ParagraphRequest(BaseModel):
    level: str
    topic: Optional[str] = "general"

@app.websocket("/ws/transcribe")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected.")
    
    if not client:
        await websocket.send_json({"text": "Error: Server missing API Key.", "isFinal": True})
        await websocket.close()
        return

    # Buffer for aggregating audio chunks
    # API calls are expensive/slow, so we buffer more (e.g., 3-5 seconds)
    audio_buffer = bytearray()
    
    try:
        while True:
            # Receive raw PCM data (16kHz, 16-bit, mono)
            data = await websocket.receive_bytes()
            audio_buffer.extend(data)
            
            # 16kHz * 2 bytes/sample * 2 seconds = ~64000 bytes
            if len(audio_buffer) > 64000: 
                transcript = await process_audio_api(audio_buffer)
                if transcript:
                    await websocket.send_json({"text": transcript, "isFinal": False})
                audio_buffer = bytearray()
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Error in WS: {e}")
        await websocket.close()

async def process_audio_api(pcm_data):
    if not client:
        return ""

    try:
        # Create an in-memory WAV file
        # Whisper API expects a valid audio file (wav, mp3, etc), not raw PCM
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2) # 16-bit
            wf.setframerate(16000)
            wf.writeframes(pcm_data)
        
        wav_buffer.name = "audio.wav" # Name is required for OpenAI client to detect type
        wav_buffer.seek(0)
        
        # Run in executor to avoid blocking async loop with sync API call
        loop = asyncio.get_event_loop()
        transcription = await loop.run_in_executor(
            None, 
            lambda: client.audio.transcriptions.create(
                model=model_name, 
                file=wav_buffer,
                language="en"
            )
        )
        return transcription.text.strip()
    
    except Exception as e:
        print(f"API API Error: {e}")
        return ""

@app.post("/api/register-parent")
async def register_parent(email: str, password: str, name: str):
    if not db:
        raise HTTPException(status_code=503, detail="Firebase not initialized")
    try:
        user = auth.create_user(email=email, password=password, display_name=name)
        db.collection("users").document(user.uid).set({
            "email": email,
            "name": name,
            "role": "parent",
            "children": [],
            "createdAt": firestore.SERVER_TIMESTAMP
        })
        return {"uid": user.uid, "email": user.email}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-paragraph")
async def generate_paragraph(req: ParagraphRequest):
    # If using OpenAI for text gen
    if client:
        try:
            gen_model = os.getenv("GENERATION_MODEL", "gpt-3.5-turbo")
            prompt = f"Write a {req.level} level reading paragraph for a child about {req.topic}. Max 50 words. Simple language."
            response = client.chat.completions.create(
                model=gen_model,
                messages=[{"role": "user", "content": prompt}]
            )
            return {"text": response.choices[0].message.content}
        except Exception as e:
            print(f"Gen Error: {e}")
            pass
            
    # Fallback
    levels = {
        "easy": "The cat sat on the mat. The sun is hot.",
        "medium": "I went to the market to buy apples and oranges.",
        "hard": "Photosynthesis is how plants make food from sunlight."
    }
    return {"text": levels.get(req.level, levels["medium"])}

@app.get("/health")
def health_check():
    return {"status": "ok", "api_configured": client is not None}
