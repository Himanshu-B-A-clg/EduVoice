import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Star, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user, isParent } = useAuth();
  const navigate = useNavigate();

  // If Parent, redirect to ParentDashboard immediately? OR show a "hub".
  // User asked for separation. If parent, show standard dash or link.

  if (isParent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome Parent</h1>
          <Link to="/parent-dashboard" className="btn btn-primary">Go to Parent Dashboard</Link>
        </div>
      </div>
    );
  }

  // Child View
  const sessions = user?.sessions || [];
  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  const startSession = (session) => {
    // Navigate to Reader with session data
    navigate('/reader', { state: { session } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Hello, {user?.name}! 👋</h1>
          <p className="text-xl text-gray-600">Ready to practice reading today?</p>
        </motion.div>

        {/* Pending Assignments */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary-600" />
            Your Reading Tasks
          </h2>

          {pendingSessions.length > 0 ? (
            <div className="grid gap-4">
              {pendingSessions.map(session => (
                <motion.div key={session.id} whileHover={{ scale: 1.01 }} className="card p-6 flex justify-between items-center bg-white border-2 border-primary-100 shadow-lg">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">New Reading Assignment</h3>
                    <p className="text-gray-500 text-sm">Assigned {new Date(session.assignedAt).toLocaleDateString()}</p>
                    <span className={`text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 font-bold uppercase`}>
                      {session.source === 'ai' ? 'AI Challenge' : 'From Parent'}
                    </span>
                  </div>
                  <button onClick={() => startSession(session)} className="btn btn-primary flex items-center gap-2">
                    Start Reading <ArrowRight className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center bg-white border-dashed border-2 border-gray-300">
              <Star className="h-12 w-12 mx-auto text-yellow-400 mb-3" />
              <h3 className="text-xl font-medium text-gray-600">All caught up!</h3>
              <p className="text-gray-500">Ask your parent to assign a new story.</p>
            </div>
          )}
        </div>

        {/* Recent Achievements / Completed */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Completed Stories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedSessions.length > 0 ? completedSessions.map(session => (
              <div key={session.id} className="card p-4 bg-gray-100 opacity-80">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-700">{new Date(session.date || session.assignedAt).toLocaleDateString()}</span>
                  <span className="text-green-600 font-bold">{session.accuracy}% Acc</span>
                </div>
                <div className="text-sm text-gray-600">
                  {session.wpm} WPM • {session.duration} min
                </div>
              </div>
            )) : (
              <p className="text-gray-500 col-span-3">No completed sessions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
