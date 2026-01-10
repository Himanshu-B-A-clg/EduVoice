import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, User, Users, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const Login = () => {
  const [mode, setMode] = useState(null); // 'parent', 'child', 'admin'
  const [formData, setFormData] = useState({ email: '', password: '', pin: '', childId: '', name: '' });
  const [childrenList, setChildrenList] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  const { user, login, loginChild, register } = useAuth();
  const navigate = useNavigate();

  // Redirect when user is authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle Admin Key Verification
  const handleAdminVerify = (e) => {
    e.preventDefault();
    if (adminKey === 'admin123') {
      localStorage.setItem('eduvoice_admin_session', 'true');
      navigate('/admin-dashboard');
    } else {
      setError('Invalid Admin Key');
    }
  };

  // Handle Parent/Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        // Use existing register flow
        await register(formData.email, formData.password, formData.name, "parent");
      } else {
        await login(formData.email, formData.password);
      }
      // Navigation handled by useEffect
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
  };

  // Find Children by Parent Email
  const fetchChildren = async (emailToUse = null) => {
    const email = emailToUse || formData.email;
    if (!email) return;

    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const parentDoc = querySnapshot.docs[0];
        const parentData = parentDoc.data();
        if (parentData.children && parentData.children.length > 0) {
          setChildrenList(parentData.children);
          setFormData({ ...formData, parentId: parentDoc.id, email: email });
          // Cache the email for future auto-login
          localStorage.setItem('eduvoice_cached_parent_email', email);
        } else {
          setError('No children found for this parent account.');
        }
      } else {
        setError('Parent account not found.');
      }
    } catch (err) {
      setError('Error finding account: ' + err.message);
    }
  };

  // Auto-load on Child Mode
  useEffect(() => {
    if (mode === 'child') {
      const cachedEmail = localStorage.getItem('eduvoice_cached_parent_email');
      if (cachedEmail) {
        fetchChildren(cachedEmail);
      }
    }
  }, [mode]);

  const handleChildLogin = (e) => {
    e.preventDefault();
    if (!formData.pin) return;

    // Try to find child by PIN across the loaded list
    const matchingChildren = childrenList.filter(c => c.pin === formData.pin);

    if (matchingChildren.length === 1) {
      // Success
      loginChild(matchingChildren[0], formData.parentId);
    } else if (matchingChildren.length > 1) {
      // Duplicate PINs? Fallback to name match if selected, or error
      if (formData.childId) {
        const specificChild = matchingChildren.find(c => c.id === formData.childId);
        if (specificChild) {
          loginChild(specificChild, formData.parentId);
          return;
        }
      }
      setError('Multiple children have this PIN. Please select your name first.');
    } else {
      setError('Incorrect PIN. Please try again.');
    }
  };

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <BookOpen className="h-20 w-20 text-primary-500 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-primary-600 font-dyslexic mb-3">EduVoice</h1>
            <p className="text-xl text-gray-600">Reading Assistant with Microphone Support</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setMode('child')}
              className="card card-hover text-left p-8 border-2 border-primary-200">
              <div className="bg-primary-100 p-4 rounded-2xl w-fit mb-4">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Child Login</h2>
              <p className="text-gray-600">Practice reading and start a session.</p>
            </motion.button>

            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setMode('parent')}
              className="card card-hover text-left p-8 border-2 border-calm-200">
              <div className="bg-calm-100 p-4 rounded-2xl w-fit mb-4">
                <Users className="h-10 w-10 text-calm-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Parent / Admin</h2>
              <p className="text-gray-600">Monitor progress and assign sessions.</p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ... (inside JSX)
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full card p-8 relative overflow-hidden">

        {/* Admin Corner Button (Parent Mode Only) */}
        {mode === 'parent' && !isRegistering && (
          <div className="absolute top-2 right-2 z-20">
            {!showAdminInput ? (
              <button
                onClick={() => setShowAdminInput(true)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                title="Admin Access"
              >
                <ShieldAlert size={16} />
              </button>
            ) : (
              <form onSubmit={handleAdminVerify} className="flex bg-white shadow-lg border border-red-100 p-1 rounded-lg items-center animate-in fade-in slide-in-from-right-4">
                <input
                  type="password"
                  placeholder="Key"
                  className="bg-transparent border-none text-xs px-2 focus:ring-0 w-20 outline-none"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="text-[10px] bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Go</button>
                <button type="button" onClick={() => setShowAdminInput(false)} className="ml-1 text-gray-400 hover:text-gray-600 px-1 text-xs">×</button>
              </form>
            )}
          </div>
        )}

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{mode === 'child' ? 'Student Login' : 'Parent Access'}</h2>
          {error && <p className="text-red-500 bg-red-50 p-2 rounded">{error}</p>}
        </div>

        {mode === 'parent' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {isRegistering && (
              <input type="text" placeholder="Full Name" className="input text-lg" required
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            )}
            <input type="email" placeholder="Email Address" className="input text-lg" required
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <input type="password" placeholder="Password" className="input text-lg" required
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

            <button type="submit" className="btn btn-primary w-full text-lg">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>

            {!isRegistering && (
              <button type="button" onClick={() => {
                const email = prompt("Please enter your email address for password reset:");
                if (email) {
                  sendPasswordResetEmail(auth, email)
                    .then(() => alert("Password reset email sent! check your inbox."))
                    .catch(e => alert("Error: " + e.message));
                }
              }} className="text-xs text-gray-500 hover:text-blue-600 block text-right mt-1 mb-4">
                Forgot Password?
              </button>
            )}

            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="w-full text-sm text-primary-600 hover:text-primary-700 underline mt-2">
              {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </form>
        )}

        {mode === 'child' && (
          <div className="space-y-4">
            {childrenList.length === 0 ? (
              <>
                <label className="block text-gray-700">Find your account via Parent Email:</label>
                <div className="flex gap-2">
                  <input type="email" placeholder="Parent's Email" className="input flex-1"
                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  <button onClick={() => fetchChildren()} className="btn btn-secondary">Search</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleChildLogin} className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-600 mb-4">Welcome! Enter your secret code:</h3>

                  {/* Optional: Show names if they want to click, but PIN is primary */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {childrenList.map(child => (
                      <div key={child.id}
                        onClick={() => setFormData({ ...formData, childId: child.id })}
                        className={`px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors ${formData.childId === child.id ? 'bg-primary-100 border-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-500'}`}
                      >
                        {child.name}
                      </div>
                    ))}
                  </div>

                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="****"
                    autoFocus
                    className="w-48 text-center text-4xl tracking-[1rem] font-bold p-3 border-b-4 border-gray-300 focus:border-primary-500 outline-none bg-transparent mx-auto block"
                    maxLength={4}
                    value={formData.pin}
                    onChange={e => setFormData({ ...formData, pin: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full text-lg py-3 rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={formData.pin.length < 4}>
                  Go!
                </button>

                <button type="button" onClick={() => { localStorage.removeItem('eduvoice_cached_parent_email'); setChildrenList([]); }} className="text-xs text-gray-400 underline w-full text-center">
                  Not you? Switch Account
                </button>
              </form>
            )}
          </div>
        )}

        <button onClick={() => { setMode(null); setChildrenList([]); setError(''); }} className="mt-6 text-gray-500 hover:text-gray-700 w-full text-sm">Cancel</button>
      </motion.div>
    </div>
  );
};

export default Login;
