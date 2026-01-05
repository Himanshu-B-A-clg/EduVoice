import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for child session first
    const storedChild = localStorage.getItem('eduvoice_child_session');
    if (storedChild) {
      setUser(JSON.parse(storedChild));
      setLoading(false);
      return;
    }

    // Firebase Auth Listener (Parents/Admins)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...userDoc.data(), uid: firebaseUser.uid, id: firebaseUser.uid });
          } else {
            // Fallback/Init logic
            setUser({
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'parent'
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: 'parent' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, name, role = 'parent') => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const userData = {
      uid: res.user.uid,
      email,
      name,
      role,
      children: [],
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', res.user.uid), userData);
    setUser(userData);
    return res.user;
  };

  const loginChild = (childData, parentId) => {
    const childUser = {
      ...childData,
      role: 'child',
      parentId,
      id: childData.id
    };
    setUser(childUser);
    localStorage.setItem('eduvoice_child_session', JSON.stringify(childUser));
  };

  const logout = async () => {
    localStorage.removeItem('eduvoice_child_session');
    await signOut(auth);
    setUser(null);
  };

  const addChild = async (childData) => {
    if (!user || user.role !== 'parent') throw new Error('Unauthorized');

    const newChild = {
      id: Math.random().toString(36).substr(2, 9),
      ...childData,
      createdAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        children: arrayUnion(newChild)
      });

      // Update local state
      setUser(prev => ({
        ...prev,
        children: [...(prev.children || []), newChild]
      }));
      return newChild;
    } catch (e) {
      console.error("Error adding child: ", e);
      throw e;
    }
  };

  const updateChildSessions = async (childId, newSessionOrUpdate) => {
    // Determine the parent ID (Firestore Document ID)
    let targetParentId = null;
    if (user.role === 'child') {
      targetParentId = user.parentId;
    } else if (user.role === 'parent') {
      targetParentId = user.uid || user.id;
    }

    if (!targetParentId) {
      console.error("Critical: Cannot determine Parent ID for session update.");
      return;
    }

    console.log("Updating session for child:", childId, "Parent:", targetParentId, "Data:", newSessionOrUpdate);

    const parentRef = doc(db, 'users', targetParentId);
    const parentSnap = await getDoc(parentRef);

    if (parentSnap.exists()) {
      const parentData = parentSnap.data();
      const updatedChildren = parentData.children.map(c => {
        if (c.id === childId) {
          // Handle new session vs update existing
          let updatedSessions = c.sessions || [];
          const existingIndex = updatedSessions.findIndex(s => s.id === newSessionOrUpdate.id);

          if (existingIndex >= 0) {
            updatedSessions[existingIndex] = { ...updatedSessions[existingIndex], ...newSessionOrUpdate };
          } else {
            updatedSessions.push(newSessionOrUpdate);
          }
          return { ...c, sessions: updatedSessions };
        }
        return c;
      });

      await updateDoc(parentRef, { children: updatedChildren });

      // Update local state if we are the relevant user
      if (user.role === 'parent') {
        setUser({ ...user, children: updatedChildren });
      } else if (user.role === 'child' && user.id === childId) {
        // Reload child session data
        const myData = updatedChildren.find(c => c.id === childId);
        const newChildUser = { ...user, ...myData };
        setUser(newChildUser);
        localStorage.setItem('eduvoice_child_session', JSON.stringify(newChildUser));
      }
    } else {
      console.error("Parent document not found!");
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginChild,
    logout,
    addChild,
    updateChildSessions,
    isAuthenticated: !!user,
    isParent: user?.role === 'parent',
    isAdmin: user?.role === 'admin',
    isChild: user?.role === 'child'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
