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
api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
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
            
            # Smart default for Groq
            if (base_url and "groq" in base_url and gen_model == "gpt-3.5-turbo") or gen_model == "llama3-70b-8192":
                gen_model = "llama-3.3-70b-versatile"

            level_guides = {
                "easy": "Use very short sentences, simple words (Kindergarten level). Max 30 words.",
                "medium": "Use moderate vocabulary (Grade 3-4 level). Max 60 words.",
                "hard": "Use advanced vocabulary and complex sentence structures (Grade 6+). Max 80 words.",
                "expert": "Use sophisticated academic language and abstract concepts. Max 100 words."
            }
            guidance = level_guides.get(req.level, level_guides["medium"])

            import random
            styles = ["adventure", "mystery", "gentle", "exciting", "descriptive", "funny"]
            selected_style = random.choice(styles)

            messages = [
                {"role": "system", "content": "You are a reading content generator. Output exactly ONE single reading paragraph. Do not provide a list. Do not repeat text. Stop after one paragraph."},
                {"role": "user", "content": f"Write a reading paragraph about '{req.topic}'. Difficulty: {req.level}. Style: {selected_style}. {guidance}"}
            ]

            response = client.chat.completions.create(
                model=gen_model,
                messages=messages,
                temperature=0.8,
                max_tokens=150
            )
            return {"text": response.choices[0].message.content}
        except Exception as e:
            print(f"Gen Error: {e}")
            return {"text": f"AI Error: {str(e)}. Check backend console or .env configuration."}
            
    # Fallback with randomized content
    import random
    
    fallback_texts = {
        "easy": [
            "The cat sat on the mat. The sun is hot. I like to play.",
            "My dog runs fast. He likes the ball. We go to the park.",
            "I see a big blue bird. It sings a song. The sky is blue.",
            "The red car go fast. I ride my bike. It is fun.",
            "Look at the moon. It is white and round. The stars shine."
        ],
        "medium": [
            "I went to the market to buy apples and oranges. It was a sunny day.",
            "Friendship is magic. My friends and I like to play soccer after school.",
            "The library is quiet. There are many books to read about space and dinosaurs.",
            "My garden has many flowers. The bees and butterflies visit them every day.",
            "We went to the beach. The water was cold, but we built a big sandcastle."
        ],
        "hard": [
            "Photosynthesis is how plants make food from sunlight. This process is vital for life on Earth.",
            "The solar system consists of eight planets orbiting the sun. Jupiter is the largest planet.",
            "History teaches us about the past. We learn from mistakes to build a better future.",
            "Computers use binary code, which consists of zeros and ones, to process information.",
            "The ecosystem relies on a delicate balance between predators and prey to maintain stability."
        ],
        "advanced": [
            "The industrial revolution marked a major turning point in history; almost every aspect of daily life was influenced.",
            "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature.",
            "Sustainable energy solutions are critical for mitigating the effects of climate change and preserving our planet.",
            "The nuances of human language are complex, involving syntax, semantics, and pragmatics in communication."
        ],
        "expert": [
            "Neuroplasticity refers to the brain's ability to reorganize itself by forming new neural connections throughout life.",
            "The epistemological foundations of science question the nature of valid knowledge and how it is acquired.",
            "Cryptographic algorithms ensure data integrity and confidentiality in an increasingly digital and interconnected world."
        ]
    }
    
    topic_options = fallback_texts.get(req.level, fallback_texts["medium"])
    return {"text": random.choice(topic_options)}

class SimplificationRequest(BaseModel):
    word: str
    context: Optional[str] = ""

@app.post("/api/simplify-word")
async def simplify_word_endpoint(req: SimplificationRequest):
    # Try using Real AI
    if client:
        try:
            gen_model = os.getenv("GENERATION_MODEL", "gpt-3.5-turbo")
            prompt = f"""For a dyslexic child reading assistant:
            Word: "{req.word}"
            Context: "{req.context}"
            
            Provide a JSON response with:
            - simple: A simpler synonym/phrase (max 3 words)
            - explanation: A clear, easy explanation (max 1 sentence)
            - example: A short example sentence using the SIMPLER word.
            """
            
            response = client.chat.completions.create(
                model=gen_model,
                messages=[
                    {"role": "system", "content": "You are a helpful reading assistant for children. Output strict JSON."},
                    {"role": "user", "content": prompt}
                ]
            )
            content = response.choices[0].message.content
            # Clean possible markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                 content = content.split("```")[1].split("```")[0]
                 
            data = json.loads(content.strip())
            return {
                "simplified": data.get("simple", "easier word"),
                "explanation": data.get("explanation", "A simpler meaning."),
                "example": data.get("example", "")
            }
        except Exception as e:
            print(f"Simplification API Error: {e}")
            pass

    # Expanded local dict for common words
    local_dict = {
        "teaches": {"simple": "shows", "explanation": "To show someone how to do something.", "example": "The teacher shows us math."},
        "struggle": {"simple": "have a hard time", "explanation": "When something is not easy to do.", "example": "I have a hard time with heavy boxes."},
        "detected": {"simple": "found", "explanation": "To see or find something.", "example": "The dog found the bone."},
        "magic": {"simple": "special power", "explanation": "Making impossible things happen.", "example": "The wizard used a special power."},
        "friendship": {"simple": "being friends", "explanation": "Loving and helping your friends.", "example": "Being friends is special."},
        "market": {"simple": "store", "explanation": "A place to buy food and things.", "example": "We buy apples at the store."},
        "library": {"simple": "book house", "explanation": "A quiet place full of books.", "example": "We read at the book house."},
        "ancient": {"simple": "very old", "explanation": "From a long time ago.", "example": "The castle is very old."},
        "enormous": {"simple": "huge", "explanation": "Very, very big.", "example": "The elephant is huge."},
        "frightened": {"simple": "scared", "explanation": "Feeling afraid.", "example": "I was scared of the ghost."},
        "exhausted": {"simple": "tired", "explanation": "Needing to sleep or rest.", "example": "I was tired after running."},
        "peculiar": {"simple": "strange", "explanation": "Different or weird.", "example": "That is a strange hat."},
        "delicious": {"simple": "yummy", "explanation": "Tasting very good.", "example": "The cake is yummy."},
        "after": {"simple": "later", "explanation": "Happening later in time.", "example": "after"},
        "before": {"simple": "earlier", "explanation": "Happening earlier.", "example": "before"},
        "photosynthesis": {"simple": "plant eating", "explanation": "How plants make food from sun.", "example": "Plants need sun to eat."},
        "industrial": {"simple": "factory", "explanation": "Making things with machines.", "example": "The factory makes cars."},
        "revolution": {"simple": "big change", "explanation": "A time when everything changes.", "example": "The big change helped everyone."},
        "quantum": {"simple": "tiny parts", "explanation": "How very small things work.", "example": "Atoms are tiny parts."},
        "mechanics": {"simple": "how it works", "explanation": "The rules of moving things.", "example": "I know how the car works."},
        "sustainable": {"simple": "lasting", "explanation": "Can keep going for a long time.", "example": "Sun power is lasting."},
        "nuances": {"simple": "small details", "explanation": "Tiny differences that matter.", "example": "Look for the small details."},
        "neuroplasticity": {"simple": "brain changing", "explanation": "The brain can learn new tricks.", "example": "Learning changes the brain."},
        "epistemological": {"simple": "knowledge", "explanation": "Asking how we know things.", "example": "How do we know it is true?"},
        "cryptographic": {"simple": "secret code", "explanation": "Writing in secret codes.", "example": "Spies use secret codes."}
    }
    
    word_lower = req.word.lower().strip()
    match = local_dict.get(word_lower) or local_dict.get(word_lower.rstrip('s'))
    
    if match:
        return {"simplified": match["simple"], "explanation": match["explanation"], "example": match["example"]}

    # Smart Fallback
    # Break word into chunks (visual syllables)
    chunks = [word_lower[i:i+3] for i in range(0, len(word_lower), 3)]
    simplified_display = "-".join(chunks)
    
    return {
        "simplified": simplified_display, 
        "explanation": f"Break it down: {simplified_display}",
        "example": req.word
    }

# --- ADMIN ENDPOINTS ---

@app.get("/api/admin/parents")
async def get_all_parents():
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    try:
        # Fetch all users where role is parent
        # Note: In a real large app, you'd paginate.
        users_ref = db.collection("users").where("role", "==", "parent")
        docs = users_ref.stream()
        
        parents = []
        for doc in docs:
            p_data = doc.to_dict()
            p_data["id"] = doc.id
            parents.append(p_data)
            
        return {"parents": parents}
    except Exception as e:
        print(f"Admin List Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/parents/{uid}")
async def delete_parent(uid: str):
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    print(f"Admin deleting parent: {uid}")
    
    # 1. Delete from Firestore (Cascading to children implicitly if in same doc)
    try:
        # Verify it exists first
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()
        if not doc.exists:
             raise HTTPException(status_code=404, detail="Parent not found")
        
        # Delete user doc
        doc_ref.delete()
        print(f"Firestore doc {uid} deleted.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firestore Delete Error: {e}")

    # 2. Delete from Auth (Requires Service Account)
    try:
        auth.delete_user(uid)
        print(f"Auth user {uid} deleted.")
    except Exception as e:
        print(f"Auth Delete Warning (Expected if no service key): {e}")
        # We don't raise error here because user might not have service key, 
        # and deleting from Firestore is enough to block login in our app logic.
        return {"status": "success", "message": "Parent data deleted (Auth deletion requires admin key)."}

    return {"status": "success", "message": "Parent account and data completely deleted."}
class PasswordResetRequest(BaseModel):
    uid: str
    new_password: str

@app.post("/api/admin/reset-password")
async def admin_reset_password(req: PasswordResetRequest):
    if not db:
       raise HTTPException(status_code=503, detail="Backend not connected to Firebase Admin SDK")
    try:
        auth.update_user(req.uid, password=req.new_password)
        print(f"Password updated for {req.uid}")
        return {"status": "success", "message": "Password updated successfully"}
    except Exception as e:
        print(f"Password Update Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "api_configured": client is not None}
