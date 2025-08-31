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
    deleteDoc, setLogLevel, where, arrayUnion 
} from 'firebase/firestore';

// --- SVG Icons ---
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm11 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V4a1 1 0 011-1zM5.293 8.293a1 1 0 011.414 0L8 9.586l1.293-1.293a1 1 0 111.414 1.414L9.414 11l1.293 1.293a1 1 0 01-1.414 1.414L8 12.414l-1.293 1.293a1 1 0 01-1.414-1.414L6.586 11 5.293 9.707a1 1 0 010-1.414zM15 9a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-6 6a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// --- Logo Component ---
const Logo = ({ className }) => (
    <img src="http://googleusercontent.com/file_content/2" alt="FinADR Logo" className={`${className}`} />
);

// --- Welcome Screen Component ---
const WelcomeScreen = ({ onNavigate }) => (
    <div className="flex flex-col min-h-screen bg-black text-white p-8">
        <nav className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
                <Logo className="w-10 h-10" />
                <span className="text-2xl font-bold text-green-500">FinADR</span>
            </div>
            <div className="space-x-2">
                <button onClick={() => onNavigate('auth', 'login')} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition">Login</button>
                <button onClick={() => onNavigate('auth', 'signup')} className="px-4 py-2 text-sm font-semibold bg-green-700 text-white rounded-lg hover:bg-green-800 transition">Sign Up</button>
            </div>
        </nav>
        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Take Control of Your Finances</h1>
            <p className="text-lg text-gray-400 max-w-xl mb-8">
                Track personal expenses, manage shared budgets with friends, and get AI-powered insights to achieve your financial goals.
            </p>
            <button onClick={() => onNavigate('auth', 'signup')} className="bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-transform transform hover:scale-105">
                Get Started
            </button>
        </div>
    </div>
);

// --- Auth Screen Component ---
const AuthScreen = ({ auth, initialMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [error, setError] = useState('');

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
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-6"><Logo className="w-20 h-20" /></div>
                <h1 className="text-3xl font-bold text-green-500 text-center mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p className="text-gray-400 text-center mb-8">{isLogin ? 'Sign in to continue' : 'Get started with FinADR'}</p>
                
                <form onSubmit={handleAuthAction} className="bg-zinc-900 shadow-lg rounded-xl p-8 space-y-6">
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <button type="submit" className="w-full bg-green-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 transition-colors">{isLogin ? 'Login' : 'Sign Up'}</button>
                </form>
                
                <p className="text-center text-gray-500 text-sm mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-green-500 hover:text-green-400 ml-1">{isLogin ? 'Sign Up' : 'Login'}</button>
                </p>
            </div>
        </div>
    );
};

// --- Modal Component ---
const Modal = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
        <div className="bg-zinc-900 rounded-xl shadow-lg w-full max-w-md border border-zinc-700">
            <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

// --- Profile Modal ---
const ProfileModal = ({ auth, onClose }) => {
    const [displayName, setDisplayName] = useState(auth.currentUser.displayName || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSave = async () => {
        setError('');
        setSuccess('');
        if (!displayName.trim()) {
            setError("Display name cannot be empty.");
            return;
        }
        try {
            await updateProfile(auth.currentUser, { displayName: displayName.trim() });
            setSuccess("Profile updated successfully!");
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Modal title="Edit Profile" onClose={onClose}>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <div className="flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">Save</button>
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
    const appId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'default-app-id';

    const handleCreatePool = async () => {
        if (!poolName.trim()) {
            setError("Pool name cannot be empty.");
            return;
        }
        setError(''); setSuccess('');
        try {
            const poolsRef = collection(db, `artifacts/${appId}/public/data/pools`);
            await addDoc(poolsRef, {
                name: poolName.trim(),
                ownerId: userId,
                members: [userId]
            });
            setSuccess(`Pool "${poolName.trim()}" created!`);
            setPoolName('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleJoinPool = async () => {
        if (!joinId.trim()) {
            setError("Please enter a Pool ID to join.");
            return;
        }
        setError(''); setSuccess('');
        try {
            const poolRef = doc(db, `artifacts/${appId}/public/data/pools`, joinId.trim());
            await updateDoc(poolRef, {
                members: arrayUnion(userId)
            });
            setSuccess("Successfully joined pool!");
            setJoinId('');
        } catch {
            setError("Invalid Pool ID or you don't have permission.");
        }
    };

    return (
        <Modal title="Manage Expense Pools" onClose={onClose}>
            <div className="space-y-6">
                {/* Create Pool */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Create a New Pool</h3>
                    <div className="flex space-x-2">
                        <input type="text" placeholder="New Pool Name" value={poolName} onChange={(e) => setPoolName(e.target.value)} className="flex-grow px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <button onClick={handleCreatePool} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">Create</button>
                    </div>
                </div>

                {/* Join Pool */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Join a Pool</h3>
                    <div className="flex space-x-2">
                        <input type="text" placeholder="Enter Pool ID" value={joinId} onChange={(e) => setJoinId(e.target.value)} className="flex-grow px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <button onClick={handleJoinPool} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">Join</button>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center">{success}</p>}

                {/* List Pools */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Your Pools</h3>
                    {pools.length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {pools.map(pool => (
                                <li key={pool.id} className="bg-zinc-800 p-3 rounded-lg">
                                    <p className="font-semibold">{pool.name}</p>
                                    <p className="text-xs text-gray-400 cursor-pointer" onClick={() => navigator.clipboard.writeText(pool.id)}>ID: {pool.id} (click to copy)</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">You haven't joined any pools yet.</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};


// --- Main Application Component ---
const MainApp = ({ db, userId, auth }) => {
  // App State
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [editingId, setEditingId] = useState(null);
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showPools, setShowPools] = useState(false);

  // Pool State
  const [pools, setPools] = useState([]);
  const [currentPoolId, setCurrentPoolId] = useState('personal'); // 'personal' or a pool ID

  // Gemini State
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const appId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'default-app-id';

  // --- Firestore Data Subscriptions ---
  useEffect(() => {
    if (!db || !userId) return;

    // Subscribe to pools
    const poolsRef = collection(db, `artifacts/${appId}/public/data/pools`);
    const qPools = query(poolsRef, where("members", "array-contains", userId));
    const unsubscribePools = onSnapshot(qPools, (snapshot) => {
        const poolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPools(poolsData);
    });

    // Subscribe to expenses based on current context (personal/pool)
    let expensesRef;
    if (currentPoolId === 'personal') {
        expensesRef = collection(db, `artifacts/${appId}/users/${userId}/expenses`);
    } else {
        expensesRef = collection(db, `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses`);
    }
    const qExpenses = query(expensesRef);
    const unsubscribeExpenses = onSnapshot(qExpenses, (snapshot) => {
        const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(expensesData);
    }, () => {
        console.error("Error fetching expenses.");
        setError("Failed to load expenses.");
    });

    return () => {
        unsubscribePools();
        unsubscribeExpenses();
    };
  }, [db, userId, currentPoolId, appId]);
  
    // --- Gemini API Call Helper ---
    const callGeminiAPI = async (systemPrompt, userPrompt) => {
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: userPrompt }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (error) {
            console.error("Gemini API call failed:", error);
            setError("Failed to communicate with the AI.");
            return "";
        }
    };
    
    const handleGetAnalysis = async () => {
        if (expenses.length === 0) {
            setAnalysis("Not enough data to analyze.");
            return;
        }
        setIsAnalyzing(true); setAnalysis('');
        const systemPrompt = "You are a friendly financial assistant in India. Analyze the following list of expenses (in INR) and provide a brief, insightful summary of spending habits in 2-3 sentences. Then, offer two practical, actionable savings tips specific to Vellore, India. Format in Markdown with 'Summary' and 'Savings Tips' headings.";
        const userPrompt = `Here are the recent expenses: ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category, date: e.date })))}`;
        const result = await callGeminiAPI(systemPrompt, userPrompt);
        setAnalysis(result);
        setIsAnalyzing(false);
    };
    
    const handleSuggestCategory = async () => {
        if (!title.trim()) { setError("Please enter a title first."); return; }
        setIsSuggesting(true); setError('');
        const systemPrompt = "You are an expert expense categorizer. Based on the expense title, suggest the most appropriate category. Available categories: Food, Transport, Shopping, Bills, Entertainment, Other. Respond with ONLY the single most relevant category name.";
        const userPrompt = title.trim();
        const result = await callGeminiAPI(systemPrompt, userPrompt);
        const validCategories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];
        if (result && validCategories.includes(result)) { setCategory(result); } 
        else { setError("Could not suggest a category."); }
        setIsSuggesting(false);
    };

  const validateForm = () => {
    if (!title.trim() || amount <= 0 || !date) {
      setError('Please fill all fields with valid data.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !db || !userId) return;

    const expenseData = { title: title.trim(), amount: parseFloat(amount), category, date, authorId: userId, authorName: auth.currentUser.displayName || "Anonymous" };
    
    let collectionPath;
    if (currentPoolId === 'personal') {
        collectionPath = `artifacts/${appId}/users/${userId}/expenses`;
    } else {
        collectionPath = `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses`;
    }

    try {
      if (editingId) {
        const docRef = doc(db, collectionPath, editingId);
        await updateDoc(docRef, expenseData);
      } else {
        const collectionRef = collection(db, collectionPath);
        await addDoc(collectionRef, expenseData);
      }
      resetForm();
    } catch (err) {
      console.error("Error saving document: ", err);
      setError("Could not save the expense.");
    }
  };

  const handleDelete = async (id) => {
    if (!db || !userId) return;
    let docPath;
    if (currentPoolId === 'personal') {
        docPath = `artifacts/${appId}/users/${userId}/expenses/${id}`;
    } else {
        docPath = `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses/${id}`;
    }
    try {
      await deleteDoc(doc(db, docPath));
    } catch (err) {
      console.error("Error deleting document: ", err);
      setError("Could not delete the expense.");
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date.slice(0, 16));
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setTitle(''); setAmount(''); setCategory('Food');
    setDate(new Date().toISOString().slice(0, 16));
    setEditingId(null); setShowForm(false); setError('');
  };

  const toggleForm = () => showForm ? resetForm() : setShowForm(true);
  
  const totalExpenses = useMemo(() => expenses.reduce((acc, exp) => acc + exp.amount, 0), [expenses]);
  
  const expensesByCategory = useMemo(() => {
      const categoryMap = expenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
      }, {});
      return Object.entries(categoryMap).sort(([,a],[,b]) => b - a);
  }, [expenses]);
  
  const currentContextName = useMemo(() => {
    if (currentPoolId === 'personal') return "Personal Expenses";
    const pool = pools.find(p => p.id === currentPoolId);
    return pool ? pool.name : "Loading Pool...";
  }, [currentPoolId, pools]);

  return (
    <>
      {showProfile && <ProfileModal auth={auth} onClose={() => setShowProfile(false)} />}
      {showPools && <PoolsModal db={db} userId={userId} pools={pools} onClose={() => setShowPools(false)} />}

      <div className="bg-black min-h-screen font-sans text-gray-300">
        <div className="container mx-auto max-w-2xl p-4">
          <header className="bg-zinc-900 shadow-lg rounded-xl p-6 mb-6 border-b-4 border-green-800">
              <div className="flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <Logo className="w-12 h-12"/>
                      <h1 className="text-3xl font-bold text-green-500">FinADR</h1>
                  </div>
                  <div className="flex items-center space-x-3">
                      <button onClick={() => setShowProfile(true)} className="text-gray-400 hover:text-white" title="Profile"><UserIcon /></button>
                      <button onClick={() => setShowPools(true)} className="text-gray-400 hover:text-white" title="Manage Pools"><UsersIcon /></button>
                      <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-white" title="Logout"><LogoutIcon /></button>
                  </div>
              </div>
            <p className="text-left text-gray-400 mt-1">Welcome, {auth.currentUser.displayName || 'User'}!</p>
          </header>

          <div className="mb-6">
            <label htmlFor="context-switcher" className="sr-only">Switch Context</label>
            <select id="context-switcher" value={currentPoolId} onChange={e => setCurrentPoolId(e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold">
                <option value="personal">Personal Expenses</option>
                {pools.map(pool => <option key={pool.id} value={pool.id}>{pool.name}</option>)}
            </select>
          </div>

          <div className="fixed bottom-6 right-6 z-10">
             <button onClick={toggleForm} className="bg-green-700 text-white rounded-full p-4 shadow-lg hover:bg-green-800 transition-transform transform hover:scale-110"><PlusIcon /></button>
          </div>
          
          {showForm && (
            <div className="bg-zinc-900 p-6 rounded-xl shadow-lg mb-6 animate-fade-in-down">
              <h2 className="text-2xl font-semibold mb-4 text-center text-white">{editingId ? 'Edit Expense' : 'Add New Expense'} to {currentContextName}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                <div className="flex items-center space-x-2">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>Food</option><option>Transport</option><option>Shopping</option><option>Bills</option><option>Entertainment</option><option>Other</option>
                  </select>
                  <button type="button" onClick={handleSuggestCategory} disabled={isSuggesting || !title} className="px-3 py-2 bg-green-900/50 text-green-400 rounded-lg hover:bg-green-900/80 transition-colors disabled:opacity-50 flex-shrink-0">{isSuggesting ? '...' : '✨ Suggest'}</button>
                </div>
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required min="0.01" step="0.01" />
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={resetForm} className="px-6 py-2 bg-zinc-700 text-gray-200 rounded-lg hover:bg-zinc-600">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">{editingId ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          )}
          
          <div className="bg-zinc-900 p-6 rounded-xl shadow-lg mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">Summary for {currentContextName}</h2>
              <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg"><span className="font-medium text-gray-300">Total Expenses:</span><span className="font-bold text-green-500 text-xl">₹{totalExpenses.toFixed(2)}</span></div>
                  <hr className="border-zinc-700"/>
                  <h3 className="font-semibold pt-2 text-gray-300">By Category:</h3>
                  {expensesByCategory.length > 0 ? (<ul className="space-y-2">{expensesByCategory.map(([cat, total]) => (<li key={cat} className="flex justify-between items-center"><span>{cat}</span><span className="font-semibold">₹{total.toFixed(2)}</span></li>))}</ul>) : (<p className="text-gray-500 text-center py-2">No expenses yet.</p>)}
              </div>
              <div className="mt-4 border-t border-zinc-700 pt-4">
                  <button onClick={handleGetAnalysis} disabled={isAnalyzing} className="w-full flex items-center justify-center py-2 px-4 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-green-900 disabled:cursor-not-allowed"><SparklesIcon/> {isAnalyzing ? 'Analyzing...' : 'Get Spending Insights'}</button>
                  {analysis && <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-sm prose text-gray-300" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
              </div>
          </div>

          <div className="bg-zinc-900 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">History for {currentContextName}</h2>
            {expenses.length === 0 ? (<p className="text-center text-gray-500 py-4">No expenses recorded. Tap '+' to add one!</p>) : (
              <ul className="space-y-3">
                {expenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800">
                    <div className="flex-grow">
                      <p className="font-bold text-lg text-gray-100">{expense.title}</p>
                      <p className="text-sm text-gray-400">{expense.category} - {new Date(expense.date).toLocaleString()}</p>
                      {currentPoolId !== 'personal' && <p className="text-xs text-green-400 pt-1">Added by: {expense.authorName}</p>}
                    </div>
                    <div className="flex items-center space-x-3">
                      <p className="text-lg font-semibold text-gray-100">₹{expense.amount.toFixed(2)}</p>
                      <button onClick={() => handleEdit(expense)} className="text-gray-400 hover:text-green-500 p-1"><EditIcon /></button>
                      <button onClick={() => handleDelete(expense.id)} className="text-gray-400 hover:text-red-500 p-1"><DeleteIcon /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
         <style>{`@keyframes fade-in-down{0%{opacity:0;transform:translateY(-20px)}100%{opacity:1;transform:translateY(0)}}.animate-fade-in-down{animation:fade-in-down .5s ease-out forwards}.prose p{margin-bottom:.5em}.prose strong{color:#4ade80}`}</style>
      </div>
    </>
  );
};

// --- App Controller Component ---
export default function App() {
  const [view, setView] = useState('welcome'); // 'welcome', 'auth', 'app'
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      const firebaseConfig = typeof window !== 'undefined' && window.__firebase_config ? JSON.parse(window.__firebase_config) : { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN" };
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestore = getFirestore(app);
      
      setDb(firestore);
      setAuth(authInstance);
      setLogLevel('debug');

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        if (user) {
          setUserId(user.uid);
          setView('app');
        } else {
          setUserId(null);
          // Stay on welcome screen until user interacts
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setIsLoading(false);
    }
  }, []);

  const handleNavigate = (targetView, mode = 'login') => {
    setAuthInitialMode(mode);
    setView(targetView);
  };
  
  if (isLoading) {
      return <div className="flex justify-center items-center min-h-screen bg-black text-white"><div className="text-xl font-semibold">Initializing...</div></div>
  }

  if (view === 'app' && userId) {
      return <MainApp db={db} userId={userId} auth={auth} />;
  }
  
  if (view === 'auth') {
      return <AuthScreen auth={auth} initialMode={authInitialMode} />;
  }

  return <WelcomeScreen onNavigate={handleNavigate} />;
}

