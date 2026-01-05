import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Award, Clock } from 'lucide-react';

const Reports = () => {
  const { user, isParent } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState(user?.children?.[0]?.id || null);

  const children = user?.children || [];
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  const stats = useMemo(() => {
    if (!selectedChild || !selectedChild.sessions) return null;
    const completed = selectedChild.sessions.filter(s => s.status === 'completed');
    if (completed.length === 0) return null;

    const totalWpm = completed.reduce((acc, s) => acc + (s.wpm || 0), 0);
    const avgWpm = Math.round(totalWpm / completed.length);
    const totalAcc = completed.reduce((acc, s) => acc + (s.accuracy || 0), 0);
    const avgAcc = Math.round(totalAcc / completed.length);

    // Chart Data
    const chartData = completed.map(s => ({
      date: new Date(s.date || s.assignedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      wpm: s.wpm || 0,
      accuracy: s.accuracy || 0
    })).slice(-10); // Last 10 sessions

    // Difficulty Analysis
    const wordcounts = {};
    completed.forEach(s => {
      if (s.struggleWords && Array.isArray(s.struggleWords)) {
        s.struggleWords.forEach(w => {
          wordcounts[w] = (wordcounts[w] || 0) + 1;
        });
      }
    });

    const difficultyData = Object.entries(wordcounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    return { avgWpm, avgAcc, totalSessions: completed.length, chartData, difficultyData };
  }, [selectedChild]);

  if (!isParent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/parent-dashboard" className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Progress Reports</h1>
        </div>

        {children.length === 0 ? (
          <div className="card text-center p-12">
            <p>No children added yet.</p>
            <Link to="/parent-dashboard" className="btn btn-primary mt-4">Add Child</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar / Child Selector */}
            <div className="lg:col-span-1 space-y-2">
              <h3 className="font-semibold text-gray-500 uppercase text-sm mb-3">Select Child</h3>
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${selectedChild?.id === child.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="font-bold text-lg">{child.name}</div>
                  <div className="text-sm opacity-80">{child.sessions?.filter(s => s.status === 'completed').length || 0} Sessions Completed</div>
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {stats ? (
                <>
                  {/* Key Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="card p-6 bg-white border-l-4 border-primary-500">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 rounded-lg"><TrendingUp className="h-5 w-5 text-primary-600" /></div>
                        <span className="text-gray-500 font-medium">Avg WPM</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-800">{stats.avgWpm}</div>
                    </div>
                    <div className="card p-6 bg-white border-l-4 border-green-500">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg"><Award className="h-5 w-5 text-green-600" /></div>
                        <span className="text-gray-500 font-medium">Avg Accuracy</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-800">{stats.avgAcc}%</div>
                    </div>
                    <div className="card p-6 bg-white border-l-4 border-purple-500">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg"><Clock className="h-5 w-5 text-purple-600" /></div>
                        <span className="text-gray-500 font-medium">Total Sessions</span>
                      </div>
                      <div className="text-3xl font-bold text-gray-800">{stats.totalSessions}</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="card p-6 bg-white shadow-lg mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Reading Velocity (WPM)</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Line
                            type="monotone"
                            dataKey="wpm"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                            name="Words Per Minute"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Difficulty Analysis */}
                  {stats.difficultyData.length > 0 && (
                    <div className="card p-6 bg-white shadow-lg">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Most Challenging Words</h3>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.difficultyData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="word" type="category" width={100} tick={{ fill: '#374151', fontSize: 14, fontWeight: 500 }} />
                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Bar dataKey="count" fill="#F87171" radius={[0, 4, 4, 0]} barSize={20} name="Times Struggled" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card p-12 text-center bg-white">
                  <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400">No Data Available</h3>
                  <p className="text-gray-400">Complete reading sessions to visualize progress.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
