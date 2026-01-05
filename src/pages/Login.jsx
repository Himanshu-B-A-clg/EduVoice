import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, User, Users, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Login = () => {
  const [mode, setMode] = useState(null); // 'parent', 'child', 'admin'
  const [formData, setFormData] = useState({ email: '', password: '', pin: '', childId: '', name: '' });
  const [childrenList, setChildrenList] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const { user, login, loginChild, register } = useAuth();
  const navigate = useNavigate();

  // Redirect when user is authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
  const fetchChildren = async () => {
    if (!formData.email) return;
    try {
      const q = query(collection(db, "users"), where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);
      const parentDoc = querySnapshot.docs[0];

      if (parentDoc) {
        const parentData = parentDoc.data();
        if (parentData.children && parentData.children.length > 0) {
          setChildrenList(parentData.children);
          setFormData({ ...formData, parentId: parentDoc.id });
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

  const handleChildLogin = (e) => {
    e.preventDefault();
    const child = childrenList.find(c => c.id === formData.childId);
    if (child) {
      // Verify PIN (Simple check)
      if (child.pin === formData.pin) {
        loginChild(child, formData.parentId);
        // Navigation handled by useEffect
      } else {
        setError('Incorrect PIN');
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full card p-8">
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
                  <button onClick={fetchChildren} className="btn btn-secondary">Search</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleChildLogin} className="space-y-4">
                <label className="block text-gray-700">Select your name:</label>
                <div className="grid grid-cols-2 gap-2">
                  {childrenList.map(child => (
                    <div key={child.id}
                      onClick={() => setFormData({ ...formData, childId: child.id })}
                      className={`p-3 rounded-lg border-2 cursor-pointer text-center ${formData.childId === child.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                      {child.name}
                    </div>
                  ))}
                </div>
                {formData.childId && (
                  <input type="password" placeholder="Enter PIN" className="input text-lg text-center tracking-widest" maxLength={4}
                    value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value })} />
                )}
                <button type="submit" className="btn btn-primary w-full text-lg" disabled={!formData.childId || !formData.pin}>Start Learning</button>
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
