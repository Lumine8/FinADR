import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
    getFirestore, collection, addDoc, onSnapshot, query, doc, updateDoc, 
    deleteDoc, setLogLevel, where, arrayUnion, setDoc, documentId, getDocs
} from 'firebase/firestore';

import Logo from './assets/logo.png';
import './App.css';

const firebaseConfig = {
  apiKey: "AIzaSyA8vuFRowcXFzk3_SaLcUk3qn4clhvz0VU",
  authDomain: "finadr-c216d.firebaseapp.com",
  projectId: "finadr-c216d",
  storageBucket: "finadr-c216d.appspot.com",
  messagingSenderId: "608681523529",
  appId: "1:608681523529:web:8f3bed536feada05224298",
  measurementId: "G-S27XRWCX2M"
};

// --- SVG Icons (using class for styling now) ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon-sm sparkles-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm11 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V4a1 1 0 011-1zM5.293 8.293a1 1 0 011.414 0L8 9.586l1.293-1.293a1 1 0 111.414 1.414L9.414 11l1.293 1.293a1 1 0 01-1.414 1.414L8 12.414l-1.293 1.293a1 1 0 01-1.414-1.414L6.586 11 5.293 9.707a1 1 0 010-1.414zM15 9a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-6 6a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// --- Welcome Screen Component ---
const WelcomeScreen = ({ onNavigate }) => (
    <div id="welcome-screen">
        <nav>
            <div className="logo-container">
                <img src={Logo} alt="FinADR Logo" className="logo-sm" />
                <span className="app-name">FinADR</span>
            </div>
            <div className="nav-buttons">
                <button onClick={() => onNavigate('auth', 'login')} className="btn-secondary">Login</button>
                <button onClick={() => onNavigate('auth', 'signup')} className="btn-primary">Sign Up</button>
            </div>
        </nav>
        <div className="hero-section">
            <h1>Take Control of Your Finances</h1>
            <p>
                Track personal expenses, manage shared budgets with friends, and get AI-powered insights to achieve your financial goals.
            </p>
            <button onClick={() => onNavigate('auth', 'signup')} className="btn-cta">
                Get Started
            </button>
        </div>
    </div>
);

// --- Auth Screen Component ---
const AuthScreen = ({ auth, db, initialMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [error, setError] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode]);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        if(password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Create a public profile doc immediately on signup
                const userProfileRef = doc(db, `artifacts/${appId}/public/data/users`, userCredential.user.uid);
                await setDoc(userProfileRef, { displayName: userCredential.user.email });
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };
    
    return (
        <div id="auth-screen">
            <div className="auth-container">
                <div className="logo-container-large">
                    <img src={Logo} alt="FinADR Logo" className="logo-lg floating" />
                </div>
                <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p>{isLogin ? 'Sign in to continue' : 'Get started with FinADR'}</p>
                
                <form onSubmit={handleAuthAction} className="auth-form">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {error && <p className="error-message centered">{error}</p>}
                    <button type="submit" className="btn-primary full-width">{isLogin ? 'Login' : 'Sign Up'}</button>
                </form>
                
                <p className="auth-toggle">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</button>
                </p>
            </div>
        </div>
    );
};

// --- Modal Component ---
const Modal = ({ children, title, onClose }) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h2>{title}</h2>
                <button onClick={onClose} className="btn-icon"><CloseIcon /></button>
            </div>
            <div className="modal-body">{children}</div>
        </div>
    </div>
);

// --- Profile Modal ---
const ProfileModal = ({ auth, db, onClose }) => {
    const [displayName, setDisplayName] = useState(auth.currentUser.displayName || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const handleSave = async () => {
        setError('');
        setSuccess('');
        if (!displayName.trim()) {
            setError("Display name cannot be empty.");
            return;
        }
        try {
            await updateProfile(auth.currentUser, { displayName: displayName.trim() });

            // Save public profile info to Firestore
            const userProfileRef = doc(db, `artifacts/${appId}/public/data/users`, auth.currentUser.uid);
            await setDoc(userProfileRef, { displayName: displayName.trim() }, { merge: true });

            setSuccess("Profile updated successfully!");
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Modal title="Edit Profile" onClose={onClose}>
            <div className="profile-modal-body">
                <label>Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="modal-actions">
                    <button onClick={handleSave} className="btn-primary">Save</button>
                </div>
            </div>
        </Modal>
    );
};

// --- Pools Modal ---
const PoolsModal = ({ db, userId, pools, onClose }) => {
    const [poolName, setPoolName] = useState('');
    const [joinId, setJoinId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [memberDetails, setMemberDetails] = useState({});
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    useEffect(() => {
        const fetchMemberNames = async () => {
            if (!pools.length) return;

            const allMemberIds = [...new Set(pools.flatMap(p => p.members))];
            if (!allMemberIds.length) return;
            
            try {
                const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
                const q = query(usersRef, where(documentId(), 'in', allMemberIds));
                const userDocs = await getDocs(q);
                
                const userMap = {};
                userDocs.forEach(doc => {
                    userMap[doc.id] = doc.data().displayName;
                });
                
                const details = {};
                pools.forEach(pool => {
                    details[pool.id] = pool.members.map(uid => userMap[uid] || `User...${uid.slice(-4)}`);
                });
                setMemberDetails(details);

            } catch (err) {
                console.error("Error fetching member names:", err);
            }
        };

        fetchMemberNames();
    }, [pools, db]);


    const handleCreatePool = async () => {
        if (!poolName.trim()) { setError("Pool name cannot be empty."); return; }
        setError(''); setSuccess('');
        try {
            const poolsRef = collection(db, `artifacts/${appId}/public/data/pools`);
            await addDoc(poolsRef, { name: poolName.trim(), ownerId: userId, members: [userId] });
            setSuccess(`Pool "${poolName.trim()}" created!`);
            setPoolName('');
        } catch (err) { setError(err.message); }
    };

    const handleJoinPool = async () => {
        if (!joinId.trim()) { setError("Please enter a Pool ID to join."); return; }
        setError(''); setSuccess('');
        try {
            const poolRef = doc(db, `artifacts/${appId}/public/data/pools`, joinId.trim());
            await updateDoc(poolRef, { members: arrayUnion(userId) });
            setSuccess("Successfully joined pool!");
            setJoinId('');
        } catch (err) { 
            console.error("Join pool error:", err);
            setError("Invalid Pool ID or you don't have permission."); 
        }
    };

    return (
        <Modal title="Manage Expense Pools" onClose={onClose}>
            <div className="pools-modal-body">
                <div className="pool-action-group">
                    <h3>Create a New Pool</h3>
                    <div className="input-group">
                        <input type="text" placeholder="New Pool Name" value={poolName} onChange={(e) => setPoolName(e.target.value)} />
                        <button onClick={handleCreatePool} className="btn-primary">Create</button>
                    </div>
                </div>
                <div className="pool-action-group">
                    <h3>Join a Pool</h3>
                    <div className="input-group">
                        <input type="text" placeholder="Enter Pool ID" value={joinId} onChange={(e) => setJoinId(e.target.value)} />
                        <button onClick={handleJoinPool} className="btn-primary">Join</button>
                    </div>
                </div>
                {error && <p className="error-message centered">{error}</p>}
                {success && <p className="success-message centered">{success}</p>}
                <div className="pool-list-container">
                    <h3>Your Pools</h3>
                    {pools.length > 0 ? (
                        <ul> {pools.map(pool => (
                            <li key={pool.id}>
                                <p className="pool-name">{pool.name}</p>
                                <p className="pool-id" onClick={() => navigator.clipboard.writeText(pool.id)}>
                                    ID: {pool.id} (click to copy)
                                </p>
                                <div className="pool-members">
                                    <h4>Members:</h4>
                                    <ul>
                                        {(memberDetails[pool.id] || []).map((name, index) => (
                                            <li key={index}>{name}</li>
                                        ))}
                                    </ul>
                                </div>
                            </li>))}
                        </ul>
                    ) : (<p className="no-data">You haven't joined any pools yet.</p>)}
                </div>
            </div>
        </Modal>
    );
};

// --- Main Application Component ---
const MainApp = ({ db, userId, auth }) => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showPools, setShowPools] = useState(false);
  const [pools, setPools] = useState([]);
  const [currentPoolId, setCurrentPoolId] = useState('personal');
  const [analysis, setAnalysis] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const appId = "1:608681523529:web:8f3bed536feada05224298";

  useEffect(() => {
    if (!db || !userId) return;
    const poolsRef = collection(db, `artifacts/${appId}/public/data/pools`);
    const qPools = query(poolsRef, where("members", "array-contains", userId));
    const unsubPools = onSnapshot(qPools, (snapshot) => setPools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    let expensesRef = currentPoolId === 'personal'
      ? collection(db, `artifacts/${appId}/users/${userId}/expenses`)
      : collection(db, `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses`);
    const qExpenses = query(expensesRef);
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(data);
    }, (err) => { console.error(err); setError("Failed to load expenses."); });
    return () => { unsubPools(); unsubExpenses(); };
  }, [db, userId, currentPoolId]);
  
    const callGeminiAPI = async (systemPrompt, userPrompt) => {
        const apiKey = ""; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: userPrompt }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (error) { 
            console.error("Gemini API call failed:", error); 
            return { error: "Failed to communicate with the AI. The API key may be missing or invalid." };
        }
    };
    
    const handleGetAnalysis = async () => {
        if (expenses.length === 0) { setAnalysis("Not enough data to analyze."); return; }
        setIsAnalyzing(true); setAnalysis(''); setAnalysisError('');
        const systemPrompt = "You are a friendly financial assistant in India. Analyze expenses (in INR) and provide a brief, insightful summary of spending habits in 2-3 sentences. Then, offer two practical, actionable savings tips specific to Vellore, India. Format in Markdown with '## Summary' and '## Savings Tips' headings, and use '*' for list items.";
        const userPrompt = `Here are the recent expenses: ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category, date: e.date })))}`;
        const result = await callGeminiAPI(systemPrompt, userPrompt);
        
        if (result.error) {
            setAnalysisError(result.error);
        } else {
            setAnalysis(result);
        }
        setIsAnalyzing(false);
    };
    
    const handleSuggestCategory = async () => {
        if (!title.trim()) { setError("Please enter a title first."); return; }
        setIsSuggesting(true); setError('');
        const systemPrompt = "You are an expert expense categorizer. Based on the expense title, suggest the most appropriate category. Available categories: Food, Transport, Shopping, Bills, Entertainment, Other. Respond with ONLY the single most relevant category name.";
        const userPrompt = title.trim();
        const result = await callGeminiAPI(systemPrompt, userPrompt);
        if (result && !result.error && ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"].includes(result)) { 
            setCategory(result); 
        } else { 
            setError("Could not suggest a category."); 
        }
        setIsSuggesting(false);
    };

  const validateForm = () => { if (!title.trim() || amount <= 0 || !date) { setError('Please fill all fields with valid data.'); return false; } setError(''); return true; };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validateForm() || !db || !userId) return;
    const expenseData = { title: title.trim(), amount: parseFloat(amount), category, date, authorId: userId, authorName: auth.currentUser.displayName || auth.currentUser.email };
    let collectionPath = currentPoolId === 'personal' ? `artifacts/${appId}/users/${userId}/expenses` : `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses`;
    try {
      if (editingId) { await updateDoc(doc(db, collectionPath, editingId), expenseData); } 
      else { await addDoc(collection(db, collectionPath), expenseData); }
      resetForm();
    } catch (err) { 
        console.error("Error saving expense:", err);
        if (err.code === 'permission-denied') {
            setError("Permission denied. You may not be a member of this pool or security rules are not set correctly.");
        } else {
            setError("Could not save the expense. Please try again.");
        }
    }
  };

  const handleDelete = async (id) => {
    if (!db || !userId) return;
    let docPath = currentPoolId === 'personal' ? `artifacts/${appId}/users/${userId}/expenses/${id}` : `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses/${id}`;
    try { 
        await deleteDoc(doc(db, docPath)); 
    } 
    catch (err) { 
        console.error("Error deleting expense:", err);
        if (err.code === 'permission-denied') {
            setError("Permission denied. You may not have permission to delete this expense.");
        } else {
            setError("Could not delete the expense. Please try again.");
        }
    }
  };

  const handleEdit = (expense) => { setEditingId(expense.id); setTitle(expense.title); setAmount(expense.amount); setCategory(expense.category); setDate(expense.date.slice(0, 16)); setShowForm(true); window.scrollTo(0, 0); };
  const resetForm = () => { setTitle(''); setAmount(''); setCategory('Food'); setDate(new Date().toISOString().slice(0, 16)); setEditingId(null); setShowForm(false); setError(''); };
  const toggleForm = () => showForm ? resetForm() : setShowForm(true);
  const totalExpenses = useMemo(() => expenses.reduce((acc, exp) => acc + exp.amount, 0), [expenses]);
  const expensesByCategory = useMemo(() => {
      const categoryMap = expenses.reduce((acc, exp) => { acc[exp.category] = (acc[exp.category] || 0) + exp.amount; return acc; }, {});
      return Object.entries(categoryMap).sort(([,a],[,b]) => b - a);
  }, [expenses]);
  const currentContextName = useMemo(() => { if (currentPoolId === 'personal') return "Personal Expenses"; const pool = pools.find(p => p.id === currentPoolId); return pool ? pool.name : "Loading Pool..."; }, [currentPoolId, pools]);
  const formattedAnalysis = useMemo(() => {
    if (!analysis) return '';
    return analysis
        .replace(/## (.*?)\n/g, '<h3>$1</h3>')
        .replace(/\* (.*?)\n/g, '<li>$1</li>')
        .replace(/\n/g, '<br/>');
  }, [analysis]);


  return (
    <>
      {showProfile && <ProfileModal auth={auth} db={db} onClose={() => setShowProfile(false)} />}
      {showPools && <PoolsModal db={db} userId={userId} pools={pools} onClose={() => setShowPools(false)} />}
      <div id="main-app">
        <div className="container">
          <header className="app-header">
              <div className="header-content">
                   <div className="logo-container">
                      <img src={Logo} alt="FinADR Logo" className="logo" />
                      <h1>FinADR</h1>
                  </div>
                  <div className="header-actions">
                      <button onClick={() => setShowProfile(true)} className="btn-icon" title="Profile"><UserIcon /></button>
                      <button onClick={() => setShowPools(true)} className="btn-icon" title="Manage Pools"><UsersIcon /></button>
                      <button onClick={() => signOut(auth)} className="btn-icon" title="Logout"><LogoutIcon /></button>
                  </div>
              </div>
            <p>Welcome, {auth.currentUser.displayName || auth.currentUser.email}!</p>
          </header>
          <div className="context-switcher">
            <select value={currentPoolId} onChange={e => setCurrentPoolId(e.target.value)}>
                <option value="personal">Personal Expenses</option>
                {pools.map(pool => <option key={pool.id} value={pool.id}>{pool.name}</option>)}
            </select>
          </div>
          <div id="add-expense-btn-container">
             <button onClick={toggleForm} className="btn-add-expense"><PlusIcon /></button>
          </div>
          {showForm && (
            <div className="card form-card">
              <h2>{editingId ? 'Edit Expense' : 'Add New Expense'} to {currentContextName}</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <div className="input-group">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option>Food</option><option>Transport</option><option>Shopping</option><option>Bills</option><option>Entertainment</option><option>Other</option>
                  </select>
                  <button type="button" onClick={handleSuggestCategory} disabled={isSuggesting || !title} className="btn-suggest">{isSuggesting ? '...' : <><SparklesIcon /> Suggest</>}</button>
                </div>
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                {error && <p className="error-message centered">{error}</p>}
                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          )}
          <div className="card">
              <h2>Summary for {currentContextName}</h2>
              <div className="summary-content">
                  <div className="summary-total"><span>Total Expenses:</span><span>₹{totalExpenses.toFixed(2)}</span></div>
                  <hr/>
                  <h3>By Category:</h3>
                  {expensesByCategory.length > 0 ? (<ul>{expensesByCategory.map(([cat, total]) => (<li key={cat}><span>{cat}</span><span>₹{total.toFixed(2)}</span></li>))}</ul>) : (<p className="no-data">No expenses yet.</p>)}
              </div>
              <div className="ai-section">
                  <button onClick={handleGetAnalysis} disabled={isAnalyzing} className="btn-primary full-width">{isAnalyzing ? 'Analyzing...' : <><SparklesIcon />Get Spending Insights</>}</button>
                  {analysisError && <p className="error-message centered">{analysisError}</p>}
                  {analysis && <div className="prose" dangerouslySetInnerHTML={{ __html: formattedAnalysis }} />}
              </div>
          </div>
          <div className="card">
            <h2>History for {currentContextName}</h2>
            {expenses.length === 0 ? (<p className="no-data">No expenses recorded. Tap '+' to add one!</p>) : (
              <ul className="expense-list">
                {expenses.map((expense) => (
                  <li key={expense.id}>
                    <div className="expense-details">
                      <p className="expense-title">{expense.title}</p>
                      <p className="expense-meta">{expense.category} - {new Date(expense.date).toLocaleString()}</p>
                      {currentPoolId !== 'personal' && <p className="expense-author">Added by: {expense.authorName}</p>}
                    </div>
                    <div className="expense-actions">
                      <p className="expense-amount">₹{expense.amount.toFixed(2)}</p>
                      <button onClick={() => handleEdit(expense)} className="btn-icon btn-edit"><EditIcon /></button>
                      <button onClick={() => handleDelete(expense.id)} className="btn-icon btn-delete"><DeleteIcon /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// --- App Controller Component ---
export default function App() {
  const [view, setView] = useState('welcome');
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestore = getFirestore(app);
      setDb(firestore); setAuth(authInstance); setLogLevel('debug');
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) { setUserId(user.uid); setView('app'); } 
        else { setUserId(null); setView('welcome'); } // Go to welcome if not logged in
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (e) { console.error("Firebase initialization failed:", e); setIsLoading(false); }
  }, []);

  const handleNavigate = (targetView, mode = 'login') => { setAuthInitialMode(mode); setView(targetView); };
  
  if (isLoading) { return <div id="loading-screen"><div>Initializing...</div></div>; }
  
  switch(view) {
    case 'app':
        return userId ? <MainApp db={db} userId={userId} auth={auth} /> : <WelcomeScreen onNavigate={handleNavigate} />;
    case 'auth':
        return <AuthScreen auth={auth} db={db} initialMode={authInitialMode} />;
    default:
        return <WelcomeScreen onNavigate={handleNavigate} />;
  }
}

