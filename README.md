# EduVoice - Dyslexia Reading Assistant 🎤📖

**Microphone-Aware Reading Support for People with Dyslexia**

EduVoice is an innovative web application that helps people with dyslexia read more easily by monitoring their spoken reading in real-time and automatically providing assistance when difficulties are detected.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🌟 Key Features

### 🎤 Real-Time Speech Monitoring
- **Automatic Difficulty Detection**: Monitors reading through microphone to detect:
  - Long pauses/hesitations (>1.2s configurable)
  - Repeated word attempts
  - Mispronunciations via ASR confidence scoring
  - Word mismatches against expected text
- **Manual Help**: User can tap "I'm stuck" button for on-demand assistance
- **Privacy-First**: Choose local-only processing or cloud-enhanced mode

### 💡 Intelligent Assistance
- **Instant Simplification**: When difficulty detected, shows:
  - Highlighted problematic word
  - Simple explanation (1-2 sentences)
  - Recommended easier alternative
  - Example sentence for context
- **Text-to-Speech**: "Hear It" button plays simplified text with word-by-word highlighting
- **Event Logging**: Timestamps all assist events for progress tracking

### 👥 Dual Account System
- **Self Login**: Individual learners track their own progress
- **Parent Login**: Parents monitor multiple children's progress
  - Add child profiles
  - View session-by-session breakdowns
  - Export detailed PDF reports
  - Track common problem words

### 📊 Comprehensive Reporting
- **Live Stats**: WPM counter, accuracy, assist usage
- **Session Timeline**: Visual timeline showing audio-triggered assist markers
- **Problem Word Analysis**: Identifies most frequently difficult words
- **Downloadable Reports**: PDF export with detailed metrics

### ♿ Accessibility-Focused Design
- **Dyslexia-Friendly Fonts**: OpenDyslexic, Comic Sans, Arial options
- **Adjustable Typography**: Font size, line spacing, letter spacing controls
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **High Contrast**: WCAG-compliant color schemes
- **Keyboard Navigation**: Full keyboard control support
- **ARIA Labels**: Screen reader compatible

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with hooks for state management
- **React Router 6** for navigation
- **Framer Motion** for smooth animations
- **Tailwind CSS** for responsive styling
- **Lucide React** for accessible icons

### Voice & Speech
- **Web Speech API** (browser-based ASR)
  - Real-time transcript generation
  - Confidence scoring
  - Multi-alternative results
- **Browser TTS** with word timing synchronization
- **Custom Detection Engine** for reading difficulty analysis

### Data & Export
- **jsPDF** for generating downloadable reports
- **localStorage** for session persistence (upgrade to backend API)

---

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern browser with Web Speech API support (Chrome, Edge recommended)
- Microphone access

### Setup Steps

1. **Clone or navigate to project directory**:
```bash
cd "c:\Users\himub\Desktop\project Cop"
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open in browser**:
The app will automatically open at `http://localhost:3000`

5. **Grant microphone permission** when prompted

---

## 🚀 Usage Guide

### For Individual Learners (Self Login)

1. **Login**: Choose "Self Login" on the landing page
2. **Dashboard**: View your progress, stats, and recent sessions
3. **Start Reading**:
   - Click "Start Reading" to open the Reader
   - Click the microphone button to enable voice detection
   - Begin reading the passage aloud
4. **Get Help**:
   - Automatic: System detects difficulty and shows assist popover
   - Manual: Click the "?" button to request help on any word
5. **Hear It**: Click "Hear It" button to hear simplified text with word highlighting
6. **View Reports**: Check detailed session breakdowns and problem word analysis

### For Parents

1. **Login**: Choose "Parent Login"
2. **Add Children**: Create profiles for each child (name, age, grade)
3. **Monitor Progress**:
   - Select child to view their sessions
   - Review assist counts and problem words
   - Download PDF reports for teachers/specialists
4. **Session Details**: Expand sessions to see assist timeline with timestamps

### Microphone Permissions

**First Time Setup**:
- Browser will request microphone permission
- Click "Allow" to enable voice monitoring
- Permission persists across sessions

**Privacy Options**:
- **Local Mode**: All processing happens in browser
- **Cloud Mode**: Enhanced accuracy via cloud ASR (future integration)
- Audio is never recorded without explicit consent

---

## 🧩 Project Structure

```
project Cop/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx          # Top navigation bar
│   │   ├── AssistPopover.jsx       # Help popover with simplification
│   │   └── MicrophoneStatus.jsx    # Live mic status indicator
│   ├── contexts/
│   │   └── AuthContext.jsx         # Authentication & user state
│   ├── pages/
│   │   ├── Login.jsx               # Account selection & login
│   │   ├── Dashboard.jsx           # Main dashboard for users
│   │   ├── Reader.jsx              # ⭐ Core reading interface with mic
│   │   ├── Reports.jsx             # Detailed session reports
│   │   └── ParentDashboard.jsx     # Parent view of children
│   ├── services/
│   │   ├── ASRService.js           # 🎤 Speech recognition wrapper
│   │   ├── SimplificationService.js # 💡 Text simplification engine
│   │   └── TTSService.js           # 🔊 Text-to-speech with timing
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles & Tailwind
├── public/                         # Static assets
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind theme & colors
└── README.md                       # This file
```

---

## 🎨 Design System

### Color Palette (Dyslexia-Friendly)
- **Primary (Blue)**: `#0ea5e9` - Main actions, navigation
- **Accent (Yellow)**: `#fbbf24` - Highlights, attention
- **Success (Green)**: `#10b981` - Positive feedback
- **Calm (Purple)**: `#c084fc` - Parent features, relaxing

### Typography
- **Dyslexic Font**: OpenDyslexic (primary)
- **Readable Fallback**: Verdana, Tahoma, Arial
- **Adjustable Sizes**: Small (18px) → XLarge (48px+)
- **Wide Letter Spacing**: 0.12em for improved readability

### Animations
- **Micro-interactions**: Subtle hover/tap feedback
- **Elastic Motion**: Assist popover slides up with bounce
- **Pulse Effects**: Live microphone indicator
- **Reduced Motion**: Automatic detection and minimal animation fallback

---

## 🔧 Configuration

### User Settings (Stored in AuthContext)
```javascript
settings: {
  fontSize: 'medium',           // small | medium | large | xlarge
  fontFamily: 'dyslexic',       // dyslexic | readable
  lineSpacing: 'normal',        // normal | wide | extra-wide
  micAutoDetect: true,          // Auto-restart mic after pause
  hesitationThreshold: 1.2,     // Seconds before flagging pause
  privacyMode: 'local',         // local | cloud
}
```

### Detection Thresholds
Adjust in `src/services/ASRService.js`:
```javascript
{
  hesitationThreshold: 1.2,      // Seconds
  repeatThreshold: 2,            // Number of repeats
  confidenceThreshold: 0.6,      // ASR confidence (0-1)
  minWordLength: 3,              // Ignore short words
}
```

---

## 🔌 Integration Points (Production Roadmap)

### 1. Advanced ASR (Replace Web Speech API)
**Current**: Browser Web Speech API (Chrome/Edge only, limited accuracy)

**Upgrade to**:
- **OpenAI Whisper**: High-accuracy, multilingual
- **Google Cloud Speech-to-Text**: Enterprise-grade, streaming
- **Deepgram**: Real-time with low latency
- **Azure Speech Services**: SSML support

**Integration Example** (OpenAI Whisper):
```javascript
// In ASRService.js
import OpenAI from 'openai';

async transcribeAudio(audioBlob) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const file = new File([audioBlob], 'audio.webm');
  
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
    language: 'en',
    response_format: 'verbose_json',
    timestamp_granularities: ['word']
  });
  
  return transcription;
}
```

### 2. LLM-Powered Simplification
**Current**: Mock simplification with static dictionary

**Upgrade to**:
- **OpenAI GPT-4**: Contextual simplification
- **Anthropic Claude**: Nuanced explanations
- **Custom Fine-tuned Model**: Dyslexia-specific vocabulary

**Integration Example** (OpenAI):
```javascript
// In SimplificationService.js
async simplifyWordWithLLM(word, sentence) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'system',
      content: 'You are a reading assistant for people with dyslexia. Provide simple, clear explanations.'
    }, {
      role: 'user',
      content: `In the sentence: "${sentence}"
      
      Simplify the word "${word}" for a dyslexic reader:
      1. Provide a simpler alternative (1-2 words)
      2. Write a one-sentence explanation (max 15 words)
      3. Give a simple example sentence
      
      Format as JSON with keys: simplified, explanation, example`
    }],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### 3. Enhanced TTS with SSML
**Current**: Browser TTS (limited voice quality, basic timing)

**Upgrade to**:
- **Google Cloud TTS**: Neural voices, SSML timing marks
- **Amazon Polly**: Multiple voice options
- **ElevenLabs**: Ultra-realistic AI voices

**Integration Example** (Google Cloud):
```javascript
// In TTSService.js
import textToSpeech from '@google-cloud/text-to-speech';

async synthesizeSpeechWithTimings(text) {
  const client = new textToSpeech.TextToSpeechClient();
  
  // Add SSML marks for word boundaries
  const ssml = `<speak>${text.split(' ').map((word, i) => 
    `<mark name="${i}"/>${word}`
  ).join(' ')}</speak>`;
  
  const [response] = await client.synthesizeSpeech({
    input: { ssml },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-C',
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.85,
      pitch: 0
    },
    enableTimePointing: ['SSML_MARK']
  });
  
  return {
    audioContent: response.audioContent,
    timepoints: response.timepoints // Word timings for highlighting
  };
}
```

### 4. Backend API & Database
**Current**: localStorage for client-side persistence

**Recommended Stack**:
- **Backend**: Node.js + Express or Next.js API routes
- **Database**: PostgreSQL or MongoDB
- **Auth**: Firebase Auth, Auth0, or Supabase
- **Storage**: AWS S3 for audio recordings (if enabled)

**Schema Example**:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50), -- 'self' or 'parent'
  settings JSONB,
  created_at TIMESTAMP
);

-- Children table (for parent accounts)
CREATE TABLE children (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES users(id),
  name VARCHAR(255),
  age INTEGER,
  grade INTEGER,
  created_at TIMESTAMP
);

-- Reading sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  start_time TIMESTAMP,
  duration INTEGER,
  wpm INTEGER,
  accuracy FLOAT,
  assist_count INTEGER,
  passage_id UUID,
  created_at TIMESTAMP
);

-- Assist events
CREATE TABLE assist_events (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  timestamp VARCHAR(50),
  event_type VARCHAR(50), -- 'hesitation', 'repeat', etc.
  word VARCHAR(255),
  asr_transcript TEXT,
  simplification JSONB,
  resolved BOOLEAN,
  created_at TIMESTAMP
);
```

### 5. Offline Mode (Progressive Web App)
- Service workers for offline functionality
- Local storage of passages
- Sync queue for when connection restored

---

## 🧪 Testing Recommendations

### Unit Tests
- ASR Service: Mock Web Speech API
- Difficulty Detector: Test threshold logic
- Simplification Service: Validate response format

### Integration Tests
- Reader component: Full mic-to-assist flow
- PDF generation: Verify report accuracy
- Auth flow: Login/logout, role-based access

### E2E Tests (Playwright/Cypress)
- Complete reading session with simulated speech
- Parent adding child and viewing reports
- PDF download and content verification

---

## 🎯 Accessibility Checklist

✅ **Visual**
- [x] Dyslexia-friendly fonts available
- [x] Adjustable font sizes (18px - 48px+)
- [x] High contrast color schemes
- [x] No color-only indicators

✅ **Motor**
- [x] Large touch targets (44x44px minimum)
- [x] Keyboard navigation support
- [x] No time-critical actions

✅ **Cognitive**
- [x] Simple, clear language
- [x] Consistent navigation
- [x] Reduced motion option
- [x] Progress indicators

✅ **Auditory**
- [x] Visual alternatives to audio cues
- [x] Transcript display
- [x] Volume controls

✅ **Screen Readers**
- [x] ARIA labels on interactive elements
- [x] Semantic HTML structure
- [x] Focus management in modals

---

## 📱 Browser Compatibility

| Browser | ASR Support | TTS Support | Recommended |
|---------|-------------|-------------|-------------|
| Chrome 88+ | ✅ Excellent | ✅ Good | ⭐⭐⭐⭐⭐ |
| Edge 88+ | ✅ Excellent | ✅ Good | ⭐⭐⭐⭐⭐ |
| Safari 14+ | ⚠️ Limited | ✅ Good | ⭐⭐⭐ |
| Firefox 90+ | ❌ No native | ✅ Good | ⭐⭐ (TTS only) |

**Note**: For production, integrate cloud ASR (Whisper, Google, etc.) to support all browsers.

---

## 🐛 Known Limitations & Future Enhancements

### Current Limitations
1. **ASR Accuracy**: Web Speech API has ~70-80% accuracy (upgrade to Whisper for 95%+)
2. **Browser Support**: Chrome/Edge only for microphone features
3. **Offline Mode**: Requires internet for cloud features
4. **Multi-language**: Currently English only
5. **Mock Data**: Session history is simulated (needs backend)

### Planned Features
- [ ] Multi-language support (Spanish, French, German)
- [ ] Custom passage upload (PDF, DOCX)
- [ ] Reading comprehension quizzes
- [ ] Gamification (badges, streaks, leaderboards)
- [ ] Teacher dashboard for classroom use
- [ ] Mobile app (React Native)
- [ ] Voice biometrics for automatic user recognition
- [ ] AI-powered reading level assessment
- [ ] Integration with school LMS systems

---

## 🤝 Contributing

Contributions welcome! Areas of focus:
- Improved ASR accuracy algorithms
- Additional language support
- Accessibility enhancements
- Performance optimizations
- Educational content integration

---

## 📄 License

MIT License - feel free to use for educational or commercial purposes.

---

## 👨‍💻 Development Notes

### Hot Tips
- **Mock Mode**: All services work with mock data—perfect for offline development
- **Fast Iteration**: Vite hot reload for instant feedback
- **Component Isolation**: Each service is modular and swappable
- **Extensibility**: Easy to add new detection heuristics or simplification sources

### Environment Variables (Production)
Create `.env` file:
```bash
VITE_OPENAI_API_KEY=your_key_here
VITE_GOOGLE_CLOUD_KEY=your_key_here
VITE_API_BASE_URL=https://api.eduvoice.com
VITE_ENABLE_ANALYTICS=true
```

---

## 📞 Support & Feedback

For issues, questions, or feature requests, please use the GitHub Issues tab or contact the development team.

**Privacy Notice**: EduVoice takes user privacy seriously. All voice data processing can be done locally, and cloud mode requires explicit consent. No data is sold or shared with third parties.

---

## 🎉 Acknowledgments

- **OpenDyslexic Font**: Christian Boer
- **Web Speech API**: W3C Community
- **React Community**: For amazing libraries and tools
- **Dyslexia Advocacy Groups**: For guidance on accessibility best practices

---

**Built with ❤️ for learners with dyslexia and their families**

