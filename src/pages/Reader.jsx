import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, CheckCircle, Ruler } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ASRService } from '../services/ASRService';
import SimplificationService from '../services/SimplificationService';
import TTSService from '../services/TTSService';
import AssistPopover from '../components/AssistPopover';

const Reader = () => {
  const { user, updateChildSessions } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionData = location.state?.session;

  const [passage, setPassage] = useState({
    title: sessionData?.source === 'ai' ? 'AI Generated Story' : 'Assigned Reading',
    content: sessionData?.text || 'The quick brown fox jumps over the lazy dog. This is a sample text because no session was selected.',
  });

  const words = useMemo(() => passage.content.split(/\s+/), [passage.content]);

  // Reading State
  const [matchedIndex, setMatchedIndex] = useState(0);
  const [isMicActive, setIsMicActive] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Dyslexia Aids
  const [showRuler, setShowRuler] = useState(false);
  const [overlayColor, setOverlayColor] = useState('transparent'); // 'transparent', 'yellow', 'blue', 'rose'

  // Stats
  const [startTime, setStartTime] = useState(null);
  const [assistCount, setAssistCount] = useState(0);
  const [struggleWords, setStruggleWords] = useState([]);

  // Assistance
  const [showAssistPopover, setShowAssistPopover] = useState(false);
  const [assistData, setAssistData] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const asrService = useRef(null);
  const ttsService = useRef(null);
  const simplificationService = useRef(new SimplificationService());
  const matchedIndexRef = useRef(0);
  const lastSpeechTimeRef = useRef(Date.now());
  const silenceTimerRef = useRef(null);

  // Sync ref
  useEffect(() => {
    matchedIndexRef.current = matchedIndex;
  }, [matchedIndex]);

  // Silence Detection
  useEffect(() => {
    if (!isMicActive) return;

    const checkSilence = () => {
      const timeSinceSpeech = Date.now() - lastSpeechTimeRef.current;
      if (timeSinceSpeech > 4000 && !showAssistPopover && matchedIndexRef.current < words.length) {
        // User stuck for 4 seconds
        handleSilenceDetected();
      }
      silenceTimerRef.current = requestAnimationFrame(checkSilence);
    };

    silenceTimerRef.current = requestAnimationFrame(checkSilence);
    return () => cancelAnimationFrame(silenceTimerRef.current);
  }, [isMicActive, showAssistPopover, words]);

  useEffect(() => {
    asrService.current = new ASRService();
    ttsService.current = new TTSService();

    asrService.current.onError = (err) => {
      console.error("Mic Error:", err);
      // alert("Microphone access blocked or failed. Please allow permissions.");
      setIsMicActive(false);
    };

    asrService.current.onResult = (results) => {
      const res = results[0];
      setTranscript(res.transcript);
      // We don't reset silence timer here because we want to know if *useful* speech happened
      // But for basic "is user ALIVE" detection, this is fine.
      lastSpeechTimeRef.current = Date.now();

      if (res.transcript) {
        matchWords(res.transcript);
      }
    };

    return () => {
      asrService.current?.stop();
      ttsService.current?.stop();
    };
  }, []);

  const matchWords = (inputTranscript) => {
    if (!inputTranscript) return;

    const normalize = (str) => str.toLowerCase().replace(/[.,!?]/g, '').trim();
    const inputWords = normalize(inputTranscript).split(/\s+/);

    let currentIndex = matchedIndexRef.current;
    let madeProgress = false;

    // Greedy forward match strategy
    for (const w of inputWords) {
      if (currentIndex >= words.length) break;

      const targetWord = normalize(words[currentIndex]);

      if (w === targetWord || (targetWord.length > 3 && w.includes(targetWord)) || (w.length > 3 && targetWord.includes(w))) {
        currentIndex++;
        madeProgress = true;
      }
    }

    if (madeProgress) {
      setMatchedIndex(currentIndex);
      lastSpeechTimeRef.current = Date.now(); // Reset silence on progress
    }
  };

  const handleSilenceDetected = () => {
    // Only trigger if we aren't showing help
    if (!showAssistPopover && matchedIndexRef.current < words.length) {
      const currentWord = words[matchedIndexRef.current];
      if (currentWord) {
        requestHelp(currentWord);
        // Reset timer significantly to prevent immediate re-trigger after closing
        lastSpeechTimeRef.current = Date.now() + 2000;
      }
    }
  };

  const toggleMicrophone = async () => {
    if (isMicActive) {
      asrService.current.stop();
      setIsMicActive(false);
    } else {
      await asrService.current.start();
      setIsMicActive(true);
      if (!startTime) setStartTime(Date.now());
      lastSpeechTimeRef.current = Date.now();
    }
  };

  const handleFinish = async () => {
    asrService.current?.stop();
    setIsMicActive(false);

    const durationMins = (Date.now() - (startTime || Date.now())) / 60000;
    const finalAccuracy = Math.round((matchedIndex / words.length) * 100);
    const finalWpm = durationMins > 0 ? Math.round(matchedIndex / durationMins) : 0;

    const completedSession = {
      ...sessionData,
      status: 'completed',
      wpm: finalWpm,
      accuracy: finalAccuracy,
      assistCount,
      struggleWords, // Save the list
      duration: Math.round(durationMins),
      date: new Date().toISOString()
    };

    if (sessionData && user) {
      await updateChildSessions(user.id, completedSession);
    }

    alert(`Session Finished!\nWPM: ${finalWpm}\nAccuracy: ${finalAccuracy}%`);
    navigate('/dashboard');
  };

  const requestHelp = async (word) => {
    if (!word) return;
    const cleanWord = word.replace(/[.,!?]/g, '');

    // Track
    setStruggleWords(prev => [...prev, cleanWord.toLowerCase()]);

    // Get complex simplification
    const simpleData = await simplificationService.current.simplifyWord(cleanWord, passage.content);
    const pronunData = await simplificationService.current.getPronunciationHelp(cleanWord);

    setAssistData({
      word: cleanWord,
      simplification: simpleData,
      syllables: pronunData.syllables,
      type: 'manual'
    });
    setShowAssistPopover(true);
    setAssistCount(c => c + 1);
  };

  const handleWordClick = (word) => {
    requestHelp(word);
  };

  // Styles
  const bgColors = {
    'transparent': 'bg-gray-50',
    'yellow': 'bg-yellow-50',
    'blue': 'bg-blue-50',
    'rose': 'bg-rose-50'
  };

  return (
    <div className={`min-h-screen pb-20 ${bgColors[overlayColor]} transition-colors duration-300`} >
      {/* Ruler Element */}
      {
        showRuler && (
          <div className="fixed pointer-events-none h-12 bg-yellow-200/30 w-full border-b-2 border-yellow-400 z-10"
            style={{ top: '50%', transform: 'translateY(-50%)' }} />
        )
      }

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-20">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reading Time</h1>
            <p className="text-gray-600">Read aloud. We'll follow along!</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {/* Dyslexia Tools */}
            <div className="bg-white p-1 rounded-lg shadow-sm border flex gap-1 items-center mr-4">
              <button onClick={() => setShowRuler(!showRuler)} className={`p-2 rounded ${showRuler ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`} title="Reading Ruler">
                <Ruler size={20} />
              </button>
              <button onClick={() => setOverlayColor('transparent')} className="w-6 h-6 rounded-full bg-gray-100 border border-gray-300" title="Normal" />
              <button onClick={() => setOverlayColor('yellow')} className="w-6 h-6 rounded-full bg-yellow-100 border border-yellow-300" title="Warm Tint" />
              <button onClick={() => setOverlayColor('blue')} className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300" title="Cool Tint" />
            </div>

            <button onClick={toggleMicrophone} className={`btn p-3 rounded-full ${isMicActive ? 'bg-red-500 text-white animate-pulse' : 'bg-primary-600 text-white'}`}>
              {isMicActive ? <MicOff /> : <Mic />}
            </button>
            <button onClick={handleFinish} className="btn bg-green-600 text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Finish
            </button>
          </div>
        </div>

        {/* Reading Passage */}
        <div className={`card p-8 md:p-12 mb-6 border-2 leading-loose text-2xl md:text-3xl font-medium tracking-wide shadow-lg ${showRuler ? 'cursor-text' : ''}`}
          style={{ fontFamily: 'sans-serif' }}>
          {words.map((word, i) => {
            let statusClass = "text-gray-700";
            if (i < matchedIndex) statusClass = "text-green-600 opacity-60"; // Previously read
            else if (i === matchedIndex) statusClass = "bg-yellow-200 text-gray-900 px-1 rounded transform scale-105 inline-block transition-all border-b-4 border-yellow-400"; // Current
            else statusClass = "text-gray-900"; // Future

            return (
              <span key={i}
                onClick={() => handleWordClick(word)}
                className={`inline-block mr-3 mb-2 cursor-pointer hover:underline decoration-primary-300 underline-offset-4 ${statusClass}`}>
                {word}
              </span>
            );
          })}
        </div>

        {/* Live Transcript (Optional Feedback) */}
        <AnimatePresence>
          {isMicActive && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-200 shadow-sm text-center">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Live Listening...</p>
              <p className="text-gray-800 italic">"{transcript || '...'}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assist Popover */}
        <AnimatePresence>
          {showAssistPopover && assistData && (
            <AssistPopover
              data={assistData}
              onClose={() => setShowAssistPopover(false)}
              onHearIt={(text) => ttsService.current.speak(text)}
              isSpeaking={isSpeaking}
            />
          )}
        </AnimatePresence>
      </div>
    </div >
  );
};

export default Reader;
