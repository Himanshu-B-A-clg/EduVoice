import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Plus, Activity, User, Shield, RefreshCw, Users, CheckCircle, LogOut, Eye, Key, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [stats, setStats] = useState({ parents: 0, children: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const [broadcasting, setBroadcasting] = useState(false);

    // Add Parent State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newParent, setNewParent] = useState({ name: '', email: '', password: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "users"), where("role", "==", "parent"));
            const querySnapshot = await getDocs(q);

            const loadedParents = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const totalChildren = loadedParents.reduce((acc, p) => acc + (p.children?.length || 0), 0);
            setStats({
                parents: loadedParents.length,
                children: totalChildren
            });

            setParents(loadedParents);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddParent = async (e) => {
        e.preventDefault();
        setIsAdding(true);

        // Initialize a secondary app to avoid logging out the admin
        const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newParent.email, newParent.password);
            const uid = userCredential.user.uid;

            // Write to Firestore (using main app's db)
            await setDoc(doc(db, "users", uid), {
                name: newParent.name,
                email: newParent.email,
                role: 'parent',
                createdAt: new Date().toISOString(),
                children: []
            });

            alert(`Parent "${newParent.name}" created successfully!`);
            setShowAddModal(false);
            setNewParent({ name: '', email: '', password: '' });
            fetchParents();
        } catch (error) {
            alert("Error creating parent: " + error.message);
        } finally {
            setIsAdding(false);
            // Cleanup secondary app
        }
    };

    const handlePasswordReset = async (uid, email) => {
        const newPassword = prompt(`Enter new password for ${email}:`);
        if (!newPassword) return;
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/admin/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, new_password: newPassword })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to update password');
            }

            alert(`Password for ${email} updated successfully.`);
        } catch (e) {
            console.error(e);
            alert("Error updating password: " + e.message + "\n\nEnsure backend is running and serviceAccountKey.json is configured.");
            if (window.confirm("Backend update failed. Send reset email instead?")) {
                try {
                    const mainAuth = getAuth();
                    await sendPasswordResetEmail(mainAuth, email);
                    alert("Reset email sent.");
                } catch (err) { alert(err.message); }
            }
        }
    };

    // ... existing functions ... 

    // Render loop helper
    const renderChildren = (children) => {
        if (!children || children.length === 0) return <span className="text-gray-300 italic text-xs">None</span>;
        return (
            <div className="flex flex-wrap gap-2">
                {children.map((c, i) => (
                    <div key={i} className="group/child relative px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200 font-medium cursor-help hover:bg-gray-200 transition-colors">
                        {c.name}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/child:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-800">
                            PIN: {c.pin || 'N/A'}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const handleViewDashboard = (parentId) => {
        navigate('/parent-dashboard', { state: { viewAsId: parentId } });
    };

    const handleViewReports = (parentId) => {
        navigate('/reports', { state: { viewAsId: parentId } });
    };

    const handleDelete = async (uid, name) => {
        if (!window.confirm(`Are you sure you want to completely delete parent "${name}"?`)) return;

        try {
            await deleteDoc(doc(db, "users", uid));
            try {
                await fetch(`http://localhost:8000/api/admin/parents/${uid}`, { method: 'DELETE' });
            } catch (e) { console.warn("Backend delete skipped"); }
            alert('Parent deleted.');
            fetchParents();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleSystemTest = async () => {
        setTestResult('Running tests...');
        try {
            const res = await fetch('http://localhost:8000/health');
            const data = await res.json();
            setTestResult(`System Online. API Configured: ${data.api_configured}`);
        } catch (err) {
            setTestResult('System Check Failed: Backend Unreachable');
        }
    };

    const handleExportCSV = () => {
        const headers = ['Parent Name,Email,ID,Children Count,Children Names\n'];
        const rows = parents.map(p => {
            const childNames = p.children?.map(c => c.name).join('; ') || '';
            return `"${p.name || ''}","${p.email}","${p.id}",${p.children?.length || 0},"${childNames}"`;
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setBroadcasting(true);
        try {
            await setDoc(doc(db, 'system', 'general'), {
                announcement: announcement,
                updatedAt: new Date().toISOString(),
                active: !!announcement
            });
            alert('Announcement updated!');
            setAnnouncement('');
        } catch (e) {
            alert('Failed: ' + e.message);
        } finally {
            setBroadcasting(false);
        }
    };

    const filteredParents = parents.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col shadow-xl z-10 transition-all">
                <h1 className="text-2xl font-bold mb-10 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-red-500" />
                    <span>Super Admin</span>
                </h1>
                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-800'}`}
                    >
                        <User size={20} /> Manage Users
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all ${activeTab === 'tools' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-800'}`}
                    >
                        <Activity size={20} /> System Tools
                    </button>
                </nav>

                <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition font-medium mt-auto">
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-auto">

                {/* VIEW: USERS */}
                {activeTab === 'users' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <header className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
                                <p className="text-gray-500 mt-1">Overview of {stats.parents} parents and {stats.children} students.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddModal(true)} className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm">
                                    <Plus size={18} /> Add Parent
                                </button>
                                <button onClick={handleExportCSV} className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-sm">
                                    <RefreshCw size={18} /> Export CSV
                                </button>
                            </div>
                        </header>

                        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-200">{error}</div>}

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><User size={24} /></div>
                                <div><p className="text-xs text-gray-500 font-bold uppercase">Parents</p><h3 className="text-2xl font-bold">{stats.parents}</h3></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg text-purple-600"><Users size={24} /></div>
                                <div><p className="text-xs text-gray-500 font-bold uppercase">Students</p><h3 className="text-2xl font-bold">{stats.children}</h3></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg text-green-600"><CheckCircle size={24} /></div>
                                <div><p className="text-xs text-gray-500 font-bold uppercase">Status</p><h3 className="text-xl font-bold text-gray-800">Online</h3></div>
                            </div>
                        </div>

                        {/* Search & Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    className="input w-full max-w-md bg-white border-gray-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button onClick={fetchParents} className="btn btn-ghost btn-sm text-gray-500 hover:bg-gray-100">Refresh List</button>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                                    <tr>
                                        <th className="p-4 font-semibold">Parent</th>
                                        <th className="p-4 font-semibold">Email</th>
                                        <th className="p-4 font-semibold">Students</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredParents.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No matching users found.</td></tr>
                                    ) : (
                                        filteredParents.map(parent => (
                                            <tr key={parent.id} className="hover:bg-gray-50 transition group">
                                                <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {parent.name?.charAt(0) || 'U'}
                                                    </div>
                                                    {parent.name || 'No Name'}
                                                </td>
                                                <td className="p-4 text-gray-600">{parent.email}</td>
                                                <td className="p-4">
                                                    {renderChildren(parent.children)}
                                                </td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    <button onClick={() => handleViewReports(parent.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="View Reports">
                                                        <FileText size={18} />
                                                    </button>
                                                    <button onClick={() => handleViewDashboard(parent.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Dashboard">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button onClick={() => handlePasswordReset(parent.id, parent.email)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Reset Password">
                                                        <Key size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(parent.id, parent.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Account">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* VIEW: SYSTEM TOOLS */}
                {activeTab === 'tools' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
                        <header className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">System Tools</h2>
                            <p className="text-gray-500 mt-1">Maintenance and communication utilities.</p>
                        </header>

                        {/* Health Check */}
                        <div className="card p-6 mb-8 border-l-4 border-blue-500">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Activity className="text-blue-500" /> Connection Status
                            </h3>
                            <div className="flex items-center gap-4">
                                <button onClick={handleSystemTest} className="btn bg-gray-100 hover:bg-gray-200 text-gray-800">
                                    Run Diagnostics
                                </button>
                                {testResult && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${testResult.includes('Failed') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {testResult}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Broadcast Msg */}
                        <div className="card p-6 border-l-4 border-purple-500">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <RefreshCw className="text-purple-500" /> Global Broadcast
                            </h3>
                            <p className="text-gray-600 mb-4 text-sm">Send a message to all users. It will appear on their dashboard.</p>
                            <form onSubmit={handleBroadcast}>
                                <textarea
                                    className="input w-full h-32 text-lg mb-4"
                                    placeholder="e.g. System maintenance scheduled for tonight..."
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                />
                                <button disabled={broadcasting} className="btn bg-purple-600 hover:bg-purple-700 text-white w-full">
                                    {broadcasting ? 'Posting...' : 'Post Announcement'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Parent Modal - OUTSIDE tabs, always available when state is true */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Add New Parent</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddParent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                                    <input type="text" className="input w-full" required
                                        value={newParent.name} onChange={e => setNewParent({ ...newParent, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" className="input w-full" required
                                        value={newParent.email} onChange={e => setNewParent({ ...newParent, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                                    <input type="password" className="input w-full" required minLength={6}
                                        value={newParent.password} onChange={e => setNewParent({ ...newParent, password: e.target.value })} />
                                </div>
                                <button disabled={isAdding} className="btn bg-blue-600 hover:bg-blue-700 text-white w-full py-3 mt-4">
                                    {isAdding ? 'Creating Account...' : 'Create Parent Account'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
