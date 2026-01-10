import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Users,
  Plus,
  BookOpen,
  Sparkles,
  Download,
  Shield,
  History,
  CheckCircle,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';

const ParentDashboard = () => {
  const { user, addChild, updateChildSessions } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Impersonation State
  const viewAsId = location.state?.viewAsId;
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  // Assignment State
  const [assignmentType, setAssignmentType] = useState('ai');
  const [assignmentText, setAssignmentText] = useState('');
  const [aiLevel, setAiLevel] = useState('medium');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildData, setNewChildData] = useState({ name: '', age: '', grade: '', pin: '' });

  // 1. Fetch Impersonated User
  useEffect(() => {
    const fetchImpersonatedUser = async () => {
      if (!viewAsId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", viewAsId));
        if (userDoc.exists()) {
          setImpersonatedUser({ id: userDoc.id, ...userDoc.data() });
        }
      } catch (e) {
        console.error("Failed to fetch user for admin view", e);
      }
    };
    fetchImpersonatedUser();
  }, [viewAsId]);

  // 2. Determine Active User Data
  // If viewAsId is present, we use impersonatedUser. 
  // If we are waiting for it (null), activeUser might be null momentarily.
  // Fallback to 'user' only if NOT viewing as ID.
  const activeUser = viewAsId ? impersonatedUser : user;
  const children = activeUser?.children || [];

  // 3. Auto-select first child
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
    // If we switch children list (e.g. changed parent), reset selected
    if (selectedChild && !children.find(c => c.id === selectedChild.id)) {
      if (children.length > 0) setSelectedChild(children[0]);
      else setSelectedChild(null);
    }
  }, [children, selectedChild]);

  // Helper Functions
  const calculateChildStats = (child) => {
    const sessions = child.sessions || [];
    if (sessions.length === 0) return { avgWPM: 0, avgAccuracy: 0, totalSessions: 0 };
    const avgWPM = Math.round(sessions.reduce((acc, s) => acc + (s.wpm || 0), 0) / sessions.length);
    const avgAccuracy = Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / sessions.length);
    return { avgWPM, avgAccuracy, totalSessions: sessions.length };
  };

  const handleAddChild = async () => {
    if (viewAsId) { alert("Admin View: Cannot add children here."); return; }
    if (!newChildData.name || !newChildData.pin) return;
    try {
      await addChild(newChildData);
      setShowAddChildModal(false);
      setNewChildData({ name: '', age: '', grade: '', pin: '' });
    } catch (e) {
      alert(e.message);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/generate-paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: aiLevel,
          topic: aiTopic || 'general'
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setAssignmentText(data.text);
    } catch (e) {
      console.error(e);
      alert("AI Generation failed. Ensure backend is running.");
      // Fallback
      setAssignmentText("The cat sat on the mat. (Fallback content - Backend offline)");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssignSession = async () => {
    if (!selectedChild || !assignmentText) return;
    if (viewAsId) { alert("Admin View: Cannot assign sessions."); return; }

    try {
      const newSession = {
        id: Date.now().toString(),
        text: assignmentText,
        assignedAt: new Date().toISOString(),
        status: 'pending',
        accuracy: 0,
        wpm: 0
      };

      await updateChildSessions(selectedChild.id, newSession);
      alert(`Assignment set for ${selectedChild.name}!`);
      setAssignmentText('');
    } catch (e) {
      alert("Failed to assign: " + e.message);
    }
  };

  const generateChildPDFReport = (child) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${child.name}'s Reading Report`, 20, 20);

    doc.setFontSize(12);
    let y = 40;
    (child.sessions || []).forEach((s, i) => {
      if (s.status !== 'completed') return;
      doc.text(`${i + 1}. Date: ${new Date(s.date || s.assignedAt).toLocaleDateString()}`, 20, y);
      doc.text(`   WPM: ${s.wpm} | Accuracy: ${s.accuracy}%`, 20, y + 7);
      y += 20;
    });

    doc.save(`${child.name}_report.pdf`);
  };

  // Main Render
  return (
    <div className="min-h-screen pb-12 relative bg-gray-50">

      {/* Admin Banner */}
      {viewAsId && (
        <div className="bg-orange-500 text-white p-3 text-center font-bold flex items-center justify-center gap-2 shadow-md sticky top-0 z-50">
          <Shield className="h-5 w-5" /> You are viewing as {activeUser?.name || 'Parent'}. (Read Only Mode)
          <button onClick={() => navigate('/admin-dashboard')} className="ml-4 bg-white text-orange-600 px-3 py-1 rounded text-sm hover:bg-orange-50">Exit View</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Users className="h-10 w-10 text-calm-500" />
            {viewAsId ? `${activeUser?.name || 'Loading'}'s Dashboard` : 'Parent Dashboard'}
          </h1>
          <p className="text-xl text-gray-600">Monitor and Assign Reading Tasks</p>
        </div>

        {/* Children Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child) => {
            const stats = calculateChildStats(child);
            const isSelected = selectedChild?.id === child.id;
            return (
              <motion.button key={child.id} onClick={() => setSelectedChild(child)}
                whileHover={{ scale: 1.02 }}
                className={`card text-left transition-all bg-white p-6 rounded-xl border ${isSelected ? 'border-4 border-calm-400 shadow-xl' : 'border-gray-200 hover:shadow-lg'}`}>
                <div className="flex justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">{child.name}</h3>
                  {isSelected && <div className="bg-calm-100 p-2 rounded-lg"><Users className="h-5 w-5 text-calm-600" /></div>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-blue-50 text-blue-800 rounded text-center"><div className="font-bold">{stats.avgWPM}</div><div className="text-xs">WPM</div></div>
                  <div className="p-2 bg-green-50 text-green-800 rounded text-center"><div className="font-bold">{stats.avgAccuracy}%</div><div className="text-xs">Acc</div></div>
                </div>
              </motion.button>
            );
          })}

          {!viewAsId && (
            <motion.button onClick={() => setShowAddChildModal(true)}
              whileHover={{ scale: 1.02 }} className="card card-hover border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[150px] text-gray-500 hover:text-calm-600 bg-white rounded-xl">
              <Plus className="h-12 w-12 mb-2" />
              <span className="text-lg font-semibold">Add Child</span>
            </motion.button>
          )}
        </div>

        {/* Selected Child Detail View - RESTORED SECTION */}
        {selectedChild && (
          <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* History Column */}
            <div className="space-y-6">
              <div className="card bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <History className="text-blue-500" />
                    History
                  </h2>
                  <button onClick={() => generateChildPDFReport(selectedChild)} className="btn btn-primary btn-sm flex items-center gap-2">
                    <Download className="h-4 w-4" /> PDF Report
                  </button>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {selectedChild.sessions?.filter(s => s.status === 'completed').length > 0 ? (
                    selectedChild.sessions.filter(s => s.status === 'completed').reverse().map((s, i) => (
                      <div key={i} className="border rounded-xl p-4 bg-gray-50 flex justify-between items-center hover:bg-blue-50 transition-colors">
                        <div>
                          <span className="font-bold block text-gray-800">{new Date(s.date || s.assignedAt).toLocaleDateString()}</span>
                          <span className="text-sm text-gray-500">Score: {s.accuracy}% | {s.wpm} WPM</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle size={10} /> Completed
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic p-8 text-center border-2 border-dashed rounded-lg">No completed reading sessions yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Column */}
            <div>
              <div className="card border-2 border-calm-200 bg-white p-6 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><BookOpen size={100} /></div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 relative z-10">
                  <BookOpen className="h-6 w-6 text-calm-600" />
                  Assign Reading
                </h2>

                <div className="flex gap-4 mb-4 relative z-10">
                  <button onClick={() => setAssignmentType('manual')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${assignmentType === 'manual' ? 'bg-calm-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    Manual Input
                  </button>
                  <button onClick={() => setAssignmentType('ai')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${assignmentType === 'ai' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Sparkles className="h-4 w-4" /> AI Generate
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative z-10">
                  {assignmentType === 'ai' && (
                    <div className="mb-4 grid grid-cols-2 gap-4 animate-in fade-in">
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Difficulty</label>
                        <select value={aiLevel} onChange={e => setAiLevel(e.target.value)} className="input w-full p-2 border rounded">
                          <option value="easy">Easy (Level 1)</option>
                          <option value="medium">Medium (Level 2)</option>
                          <option value="hard">Hard (Level 3)</option>
                          <option value="expert">Expert (Level 4)</option>
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Topic</label>
                        <input placeholder="e.g. Space, Animals..." value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="input w-full" />
                      </div>
                      <button onClick={handleGenerateAI} disabled={isGenerating} className="col-span-2 btn bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                        {isGenerating ? <span className="animate-pulse">✨ Generating Magic...</span> : '✨ Generate Story'}
                      </button>
                    </div>
                  )}

                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Reading Text</label>
                  <textarea
                    className="input w-full h-32 mb-4 font-dyslexic text-lg p-3"
                    placeholder={assignmentType === 'ai' ? "AI Generated text will appear here..." : "Type or paste reading material here..."}
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                  />

                  <button onClick={handleAssignSession} disabled={!assignmentText || viewAsId}
                    className={`btn w-full py-3 text-lg font-bold shadow-md ${viewAsId ? 'bg-gray-300 cursor-not-allowed' : 'bg-calm-600 hover:bg-calm-700 text-white'}`}>
                    {viewAsId ? 'Read Only Mode' : 'Assign to Child'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Add Child Modal */}
        <AnimatePresence>
          {showAddChildModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddChildModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Plus className="bg-calm-100 p-1 rounded-full text-calm-600" /> Add New Child</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Child Name</label>
                    <input placeholder="Name" className="input w-full" value={newChildData.name} onChange={e => setNewChildData({ ...newChildData, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Age</label>
                      <input placeholder="Age" type="number" className="input w-full" value={newChildData.age} onChange={e => setNewChildData({ ...newChildData, age: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 block mb-1">Grade</label>
                      <input placeholder="Grade" type="number" className="input w-full" value={newChildData.grade} onChange={e => setNewChildData({ ...newChildData, grade: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Secret PIN (4-Digits)</label>
                    <input placeholder="0000" maxLength={4} className="input w-full text-center tracking-[1em] text-xl font-mono font-bold"
                      value={newChildData.pin} onChange={e => setNewChildData({ ...newChildData, pin: e.target.value })} />
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button onClick={handleAddChild} className="btn bg-calm-600 hover:bg-calm-700 text-white flex-1 py-3 shadow-md">Add Account</button>
                    <button onClick={() => setShowAddChildModal(false)} className="btn bg-gray-100 hover:bg-gray-200 text-gray-600 flex-1 py-3">Cancel</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div >
    </div >
  );
};

export default ParentDashboard;

