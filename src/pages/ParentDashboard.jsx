import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Plus,
  TrendingUp,
  Clock,
  Mic,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  BookOpen,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';

const ParentDashboard = () => {
  const { user, addChild, updateChildSessions } = useAuth();
  const children = user?.children || [];

  const [selectedChild, setSelectedChild] = useState(children[0] || null);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildData, setNewChildData] = useState({ name: '', age: '', grade: '', pin: '' });

  // Assignment State
  const [assignmentType, setAssignmentType] = useState('ai'); // 'manual' or 'ai'
  const [assignmentText, setAssignmentText] = useState('');
  const [aiLevel, setAiLevel] = useState('medium');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSessionExpand = (sessionId) => {
    setExpandedSessions((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  const handleAddChild = async () => {
    if (newChildData.name && newChildData.pin) {
      await addChild(newChildData);
      setShowAddChildModal(false);
      setNewChildData({ name: '', age: '', grade: '', pin: '' });
    }
  };

  const calculateChildStats = (child) => {
    if (!child.sessions || child.sessions.length === 0) {
      return { avgWPM: 0, avgAccuracy: 0, totalAssists: 0, totalSessions: 0 };
    }
    const completedSessions = child.sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return { avgWPM: 0, avgAccuracy: 0, totalAssists: 0, totalSessions: 0 };

    return {
      avgWPM: Math.round(completedSessions.reduce((sum, s) => sum + (s.wpm || 0), 0) / completedSessions.length),
      avgAccuracy: Math.round(completedSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / completedSessions.length),
      totalAssists: completedSessions.reduce((sum, s) => sum + (s.assistCount || 0), 0),
      totalSessions: completedSessions.length,
    };
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:8000/api/generate-paragraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: aiLevel, topic: aiTopic })
      });
      const data = await res.json();
      setAssignmentText(data.text);
    } catch (err) {
      console.error(err);
      alert("Failed to generate text. Is Backend running?");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssignSession = async () => {
    if (!selectedChild || !assignmentText) return;

    const newSession = {
      id: Date.now().toString(),
      text: assignmentText,
      status: 'pending',
      assignedAt: new Date().toISOString(),
      source: assignmentType
    };

    await updateChildSessions(selectedChild.id, newSession);
    setAssignmentText('');
    alert("Session Assigned Successfully!");
  };

  const generateChildPDFReport = (child) => {
    const doc = new jsPDF();
    const stats = calculateChildStats(child);
    const completed = child.sessions?.filter(s => s.status === 'completed') || [];

    doc.setFontSize(20);
    doc.text('EduVoice Progress Report', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Student: ${child.name}`, 20, 35);
    doc.text(`Stats: ${stats.avgWPM} WPM | ${stats.avgAccuracy}% Accuracy`, 20, 45);

    let y = 60;
    completed.forEach((s, i) => {
      doc.text(`${new Date(s.date).toLocaleDateString()}: ${s.wpm} WPM`, 20, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.save(`report-${child.name}.pdf`);
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Users className="h-10 w-10 text-calm-500" />
            Parent Dashboard
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
                className={`card text-left transition-all ${isSelected ? 'border-4 border-calm-400 shadow-xl' : 'card-hover'}`}>
                <div className="flex justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">{child.name}</h3>
                  {isSelected && <div className="bg-calm-100 p-2 rounded-lg"><Users className="h-5 w-5 text-calm-600" /></div>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-primary-50 rounded text-center"><div className="font-bold">{stats.avgWPM}</div><div className="text-xs">WPM</div></div>
                  <div className="p-2 bg-success-50 rounded text-center"><div className="font-bold">{stats.avgAccuracy}%</div><div className="text-xs">Acc</div></div>
                </div>
              </motion.button>
            );
          })}
          <motion.button onClick={() => setShowAddChildModal(true)}
            whileHover={{ scale: 1.02 }} className="card card-hover border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[150px] text-gray-500 hover:text-calm-600">
            <Plus className="h-12 w-12 mb-2" />
            <span className="text-lg font-semibold">Add Child</span>
          </motion.button>
        </div>

        {selectedChild && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Stats / History Column */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{selectedChild.name}'s History</h2>
                  <button onClick={() => generateChildPDFReport(selectedChild)} className="btn btn-primary sm"><Download className="h-4 w-4 mr-1" /> Report</button>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedChild.sessions?.filter(s => s.status === 'completed').length > 0 ? (
                    selectedChild.sessions.filter(s => s.status === 'completed').map(s => (
                      <div key={s.id} className="border rounded-xl p-4 bg-gray-50">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold">{new Date(s.date).toLocaleDateString()}</span>
                          <span className="text-sm bg-green-100 text-green-800 px-2 rounded">Completed</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Score: {s.accuracy}% | WPM: {s.wpm} | Duration: {s.duration}m
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No completed sessions yet.</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Assignment Column */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="card border-2 border-calm-200">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-calm-600" />
                  Assign Reading
                </h2>

                <div className="flex gap-4 mb-4">
                  <button onClick={() => setAssignmentType('manual')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${assignmentType === 'manual' ? 'bg-calm-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    Manual Input
                  </button>
                  <button onClick={() => setAssignmentType('ai')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${assignmentType === 'ai' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <Sparkles className="h-4 w-4" /> AI Generate
                  </button>
                </div>

                {assignmentType === 'ai' && (
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <select value={aiLevel} onChange={e => setAiLevel(e.target.value)} className="input">
                      <option value="easy">Easy (Level 1)</option>
                      <option value="medium">Medium (Level 2)</option>
                      <option value="hard">Hard (Level 3)</option>
                      <option value="advanced">Advanced (Level 4)</option>
                      <option value="expert">Expert (Level 5)</option>
                    </select>
                    <input placeholder="Topic (Optional)" value={aiTopic} onChange={e => setAiTopic(e.target.value)} className="input" />
                    <button onClick={handleGenerateAI} disabled={isGenerating} className="btn bg-purple-600 hover:bg-purple-700 text-white col-span-2">
                      {isGenerating ? 'Generating...' : 'Generate New Paragraph'}
                    </button>
                  </div>
                )}

                <textarea
                  value={assignmentText}
                  onChange={e => setAssignmentText(e.target.value)}
                  placeholder="Reading text will appear here..."
                  className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl mb-4 focus:ring-4 focus:ring-calm-200"
                />

                <button onClick={handleAssignSession} disabled={!assignmentText || !selectedChild} className="btn btn-primary w-full text-lg">
                  Assign to {selectedChild?.name}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Child Modal */}
        <AnimatePresence>
          {showAddChildModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddChildModal(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Add New Child</h2>
                <div className="space-y-4">
                  <input placeholder="Name" className="input w-full" value={newChildData.name} onChange={e => setNewChildData({ ...newChildData, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Age" type="number" className="input" value={newChildData.age} onChange={e => setNewChildData({ ...newChildData, age: e.target.value })} />
                    <input placeholder="Grade" type="number" className="input" value={newChildData.grade} onChange={e => setNewChildData({ ...newChildData, grade: e.target.value })} />
                  </div>
                  <input placeholder="Set 4-digit PIN" maxLength={4} className="input w-full text-center tracking-widest text-lg"
                    value={newChildData.pin} onChange={e => setNewChildData({ ...newChildData, pin: e.target.value })} />
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleAddChild} className="btn btn-primary flex-1">Add Account</button>
                    <button onClick={() => setShowAddChildModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ParentDashboard;
