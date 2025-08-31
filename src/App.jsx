import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { 
    getStorage, ref, uploadBytes, getDownloadURL 
} from 'firebase/storage';


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
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

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
    
    const adjectives = ['Swift', 'Clever', 'Happy', 'Brave', 'Wise', 'Silent', 'Golden', 'Red', 'Cyber', 'Aqua'];
    const nouns = ['Panda', 'Tiger', 'Lion', 'Eagle', 'Fox', 'River', 'Star', 'Moon', 'Byte', 'Jet'];

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
                const user = userCredential.user;

                // Generate and check for a unique username
                const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
                let uniqueUsername = '';
                let isUnique = false;
                
                while (!isUnique) {
                    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
                    const randomNumber = Math.floor(Math.random() * 900) + 100; // 100-999
                    const potentialUsername = `${randomAdjective}${randomNoun}${randomNumber}`;
                    
                    const q = query(usersRef, where("displayName", "==", potentialUsername));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        uniqueUsername = potentialUsername;
                        isUnique = true;
                    }
                }

                // Update Auth profile and create public Firestore doc
                await updateProfile(user, { displayName: uniqueUsername, photoURL: '' });
                const userProfileRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
                await setDoc(userProfileRef, { displayName: uniqueUsername, photoURL: '' });
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
const ProfileModal = ({ auth, db, storage, onClose }) => {
    const [displayName, setDisplayName] = useState(auth.currentUser.displayName || '');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(auth.currentUser.photoURL);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setPhoto(e.target.files[0]);
            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setUploading(true);
        const newName = displayName.trim();
        let newPhotoURL = auth.currentUser.photoURL;

        if (!newName) {
            setError("Display name cannot be empty.");
            setUploading(false);
            return;
        }

        if (newName !== auth.currentUser.displayName) {
            const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
            const q = query(usersRef, where("displayName", "==", newName));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setError("This username is already taken.");
                setUploading(false);
                return;
            }
        }
        
        try {
            // Upload photo if a new one was selected
            if (photo) {
                const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
                await uploadBytes(storageRef, photo);
                newPhotoURL = await getDownloadURL(storageRef);
            }

            // Update Auth and Firestore
            await updateProfile(auth.currentUser, { displayName: newName, photoURL: newPhotoURL });
            const userProfileRef = doc(db, `artifacts/${appId}/public/data/users`, auth.currentUser.uid);
            await setDoc(userProfileRef, { displayName: newName, photoURL: newPhotoURL }, { merge: true });

            setSuccess("Profile updated successfully!");
            setUploading(false);
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setError(err.message);
            setUploading(false);
        }
    };

    return (
        <Modal title="Edit Profile" onClose={onClose}>
            <div className="profile-modal-body">
                 <div className="pfp-upload-container">
                    <label htmlFor="pfp-upload">
                        <img src={photoPreview || `https://placehold.co/100x100/18181b/a1a1aa?text=${displayName.charAt(0)}`} alt="Profile" className="pfp-preview" />
                         <div className="pfp-overlay"><CameraIcon /></div>
                    </label>
                    <input id="pfp-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </div>
                <label>Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="modal-actions">
                    <button onClick={handleSave} className="btn-primary" disabled={uploading}>
                        {uploading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Collaborators Modal ---
const CollaboratorsModal = ({ db, pools, userId, onClose }) => {
    const [collaborators, setCollaborators] = useState([]);
    const appId = "1:608681523529:web:8f3bed536feada05224298";
    
    useEffect(() => {
        const fetchCollaborators = async () => {
            if (!pools.length) return;

            const allMemberIds = [...new Set(pools.flatMap(p => p.members))].filter(id => id !== userId);
            if (!allMemberIds.length) return;
            
            try {
                const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
                const q = query(usersRef, where(documentId(), 'in', allMemberIds));
                const userDocs = await getDocs(q);
                
                const users = userDocs.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCollaborators(users);

            } catch (err) {
                console.error("Error fetching collaborators:", err);
            }
        };

        fetchCollaborators();
    }, [pools, db, userId]);

    return (
        <Modal title="Collaborators" onClose={onClose}>
            <div className="collaborators-list">
                {collaborators.length > 0 ? (
                    <ul>
                        {collaborators.map(user => (
                            <li key={user.id}>
                                <img src={user.photoURL || `https://placehold.co/40x40/18181b/a1a1aa?text=${user.displayName.charAt(0)}`} alt={user.displayName} />
                                <span>{user.displayName}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data">You are not collaborating with anyone yet. Join a pool to start!</p>
                )}
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
                    userMap[doc.id] = {
                        displayName: doc.data().displayName,
                        photoURL: doc.data().photoURL
                    };
                });
                
                const details = {};
                pools.forEach(pool => {
                    details[pool.id] = pool.members.map(uid => userMap[uid] || { displayName: `User...${uid.slice(-4)}`, photoURL: '' });
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
                                        {(memberDetails[pool.id] || []).map((member, index) => (
                                            <li key={index} className="member-item">
                                                <img src={member.photoURL || `https://placehold.co/24x24/18181b/a1a1aa?text=${member.displayName.charAt(0)}`} alt={member.displayName} />
                                                <span>{member.displayName}</span>
                                            </li>
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

// --- Chart Component ---
const SpendingChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !window.Chart) return;

        const chartCtx = chartRef.current.getContext('2d');
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const labels = data.map(item => item[0]);
        const values = data.map(item => item[1]);
        
        const chartColors = [
            '#22c55e', '#ef4444', '#3b82f6', '#eab308', 
            '#8b5cf6', '#f97316', '#14b8a6'
        ];

        chartInstance.current = new window.Chart(chartCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spending',
                    data: values,
                    backgroundColor: chartColors,
                    borderColor: '#18181b',
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#a1a1aa',
                            font: {
                                size: 14
                            },
                            boxWidth: 20,
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };

    }, [data]);


    return (
        <div className="chart-container">
            {data.length > 0 ? <canvas ref={chartRef}></canvas> : <p className="no-data">No spending data for a chart yet.</p>}
        </div>
    );
};


// --- Main Application Component ---
const MainApp = ({ db, user, auth, storage }) => {
  const userId = user.uid;
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
  const [showCollaborators, setShowCollaborators] = useState(false);
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
        const apiKey = "AIzaSyCwtByuVgaQUXilyEEFMxaXOpkId5w7Xok"; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
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
    const expenseData = { title: title.trim(), amount: parseFloat(amount), category, date, authorId: userId, authorName: user.displayName || user.email };
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
      {showProfile && <ProfileModal auth={auth} db={db} storage={storage} onClose={() => setShowProfile(false)} />}
      {showPools && <PoolsModal db={db} userId={userId} pools={pools} onClose={() => setShowPools(false)} />}
      {showCollaborators && <CollaboratorsModal db={db} userId={userId} pools={pools} onClose={() => setShowCollaborators(false)} />}

      <div id="main-app">
        <div className="container">
          <header className="app-header">
              <div className="header-content">
                   <div className="logo-container">
                      <img src={Logo} alt="FinADR Logo" className="logo" />
                      <h1>FinADR</h1>
                  </div>
                  <div className="header-actions">
                      <button onClick={() => setShowProfile(true)} className="btn-icon" title="Profile">
                        {user.photoURL ? <img src={user.photoURL} alt="My Profile" className="header-pfp" /> : <UserIcon />}
                      </button>
                      <button onClick={() => setShowCollaborators(true)} className="btn-icon" title="Collaborators"><UsersIcon/></button>
                      <button onClick={() => signOut(auth)} className="btn-icon" title="Logout"><LogoutIcon /></button>
                  </div>
              </div>
            <p>Welcome, {user.displayName || user.email}!</p>
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
                   <SpendingChart data={expensesByCategory} />
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
        <style>{`
          /* --- FinADR Global Styles --- */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background-color: #000; color: #d4d4d8; }
          
          /* --- Animations --- */
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
          @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); } 70% { transform: scale(1.05); box-shadow: 0 0 10px 15px rgba(22, 163, 74, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); } }
          @keyframes quirky-wobble { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }
          .floating { animation: float 3s ease-in-out infinite; }
          
          /* --- Utility Classes --- */
          .container { width: 100%; max-width: 640px; margin: auto; padding: 1rem; }
          .card { background-color: #18181b; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); margin-bottom: 1.5rem; }
          .icon { width: 1.5rem; height: 1.5rem; } .icon-sm { width: 1.25rem; height: 1.25rem; }
          .error-message { color: #ef4444; font-size: 0.875rem; } .error-message.centered { text-align: center; }
          .success-message { color: #22c55e; font-size: 0.875rem; } .success-message.centered { text-align: center; }
          .no-data { text-align: center; color: #71717a; padding: 1rem 0; }
          
          /* --- Buttons --- */
          button { font-family: inherit; cursor: pointer; transition: all 0.2s ease-in-out; border: none; background: none; }
          .btn-primary { background-color: #15803d; color: white; font-weight: 600; padding: 0.75rem 1rem; border-radius: 0.5rem; }
          .btn-primary:hover { background-color: #166534; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); }
          .btn-primary:disabled { background-color: #14532d; cursor: not-allowed; opacity: 0.6; }
          .btn-primary.full-width { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
          .btn-secondary { background-color: #3f3f46; color: #e4e4e7; font-weight: 600; padding: 0.75rem 1rem; border-radius: 0.5rem; }
          .btn-secondary:hover { background-color: #52525b; }
          .btn-cta { background-color: #15803d; color: white; font-weight: bold; padding: 0.75rem 2rem; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); transition: transform 0.2s; }
          .btn-cta:hover { background-color: #166534; transform: scale(1.05); animation: pulse 1.5s infinite; }
          .btn-icon { color: #a1a1aa; padding: 0.25rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; }
          .btn-icon:hover { color: white; background-color: #27272a; animation: quirky-wobble 0.5s; }
          .btn-edit:hover { color: #22c55e; } .btn-delete:hover { color: #ef4444; }
          .btn-add-expense { background-color: #15803d; color: white; border-radius: 9999px; padding: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); transition: transform 0.2s; }
          .btn-add-expense:hover { background-color: #166534; transform: scale(1.1) rotate(90deg); }
          .btn-suggest { background-color: rgba(16, 185, 129, 0.1); color: #6ee7b7; padding: 0.5rem 0.75rem; border-radius: 0.5rem; flex-shrink: 0; display: flex; align-items: center; gap: 0.25rem; }
          .btn-suggest:hover { background-color: rgba(16, 185, 129, 0.2); } .btn-suggest:disabled { opacity: 0.5; }
          .sparkles-icon { display: inline-block; margin-right: 0.25rem; }
          
          /* --- Forms & Inputs --- */
          input, select { width: 100%; padding: 0.75rem 1rem; background-color: #27272a; border: 1px solid #3f3f46; color: white; border-radius: 0.5rem; font-size: 1rem; transition: border-color 0.2s, box-shadow 0.2s; }
          input:focus, select:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.5); }
          .input-group { display: flex; gap: 0.5rem; align-items: center; }
          
          /* --- Screens --- */
          #loading-screen, #welcome-screen, #auth-screen { display: flex; flex-direction: column; min-height: 100vh; align-items: center; justify-content: center; padding: 2rem; }
          #welcome-screen { justify-content: flex-start; }
          #welcome-screen nav { display: flex; justify-content: space-between; align-items: center; width: 100%; }
          .logo-container { display: flex; align-items: center; gap: 0.5rem; } .logo-sm { width: 2.5rem; height: 2.5rem; }
          .app-name { font-size: 1.5rem; font-weight: bold; color: #22c55e; }
          .nav-buttons { display: flex; gap: 0.5rem; }
          #welcome-screen .hero-section { flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
          #welcome-screen .hero-section h1 { font-size: 3rem; font-weight: bold; color: white; margin-bottom: 1rem; }
          #welcome-screen .hero-section p { font-size: 1.125rem; color: #a1a1aa; max-width: 40rem; margin-bottom: 2rem; }
          .auth-container { width: 100%; max-width: 24rem; }
          .logo-container-large { display: flex; justify-content: center; margin-bottom: 1.5rem; } .logo-lg { width: 5rem; height: 5rem; }
          #auth-screen h1 { font-size: 1.875rem; font-weight: bold; color: #22c55e; text-align: center; margin-bottom: 0.5rem; }
          #auth-screen p { color: #a1a1aa; text-align: center; margin-bottom: 2rem; }
          .auth-form { background-color: #18181b; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-radius: 0.75rem; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
          .auth-toggle { text-align: center; color: #71717a; font-size: 0.875rem; margin-top: 1.5rem; }
          .auth-toggle button { font-weight: 600; color: #22c55e; margin-left: 0.25rem; }
          .auth-toggle button:hover { color: #4ade80; }

          /* --- Main App Layout --- */
          #main-app { font-family: sans-serif; color: #d4d4d8; }
          .app-header { background-color: #18181b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; border-bottom: 4px solid #166534; }
          .header-content { display: flex; justify-content: space-between; align-items: center; }
          .app-header .logo-container { gap: 0.75rem; }
          .app-header .logo { width: 3rem; height: 3rem; }
          .app-header h1 { font-size: 1.875rem; font-weight: bold; color: #22c55e; }
          .header-actions { display: flex; align-items: center; gap: 0.75rem; }
          .app-header p { text-align: left; color: #a1a1aa; margin-top: 0.25rem; }
          .header-pfp { width: 2rem; height: 2rem; border-radius: 9999px; object-fit: cover; }

          /* Main Content */
          .context-switcher { margin-bottom: 1.5rem; }
          #add-expense-btn-container { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 10; }
          .form-card { animation: fadeIn 0.5s ease-out forwards; }
          .form-card h2, .card h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: white; }
          .form-card form { display: flex; flex-direction: column; gap: 1rem; }
          .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }

          /* Summary & Chart */
          .summary-content { display: flex; flex-direction: column; gap: 0.75rem; }
          .summary-total { display: flex; justify-content: space-between; align-items: center; font-size: 1.125rem; }
          .summary-total span:first-child { font-weight: 500; color: #d4d4d8; }
          .summary-total span:last-child { font-weight: bold; color: #22c55e; font-size: 1.25rem; }
          .summary-content hr { border-color: #3f3f46; }
          .summary-content h3 { font-weight: 600; padding-top: 0.5rem; color: #d4d4d8; }
          .summary-content ul { display: flex; flex-direction: column; gap: 0.5rem; list-style: none; }
          .summary-content li { display: flex; justify-content: space-between; align-items: center; }
          .summary-content li span:last-child { font-weight: 600; }
          .chart-container { position: relative; height: 250px; width: 100%; margin-bottom: 1.5rem; }
          .ai-section { margin-top: 1rem; border-top: 1px solid #3f3f46; padding-top: 1rem; }
          .prose { margin-top: 1rem; padding: 1rem; background-color: #27272a; border-radius: 0.5rem; font-size: 0.875rem; line-height: 1.5; }
          .prose h3 { font-size: 1.1em; color: white; margin-bottom: 0.5rem; }
          .prose li { margin-left: 1rem; }
          
          /* History List */
          .expense-list { display: flex; flex-direction: column; gap: 0.75rem; list-style: none; }
          .expense-list li { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background-color: rgba(39, 39, 42, 0.5); border-radius: 0.5rem; transition: background-color 0.2s; }
          .expense-list li:hover { background-color: #27272a; }
          .expense-details { flex-grow: 1; }
          .expense-title { font-weight: bold; font-size: 1.125rem; color: #f4f4f5; }
          .expense-meta { font-size: 0.875rem; color: #a1a1aa; }
          .expense-author { font-size: 0.75rem; color: #4ade80; padding-top: 0.25rem; }
          .expense-actions { display: flex; align-items: center; gap: 0.75rem; }
          .expense-amount { font-size: 1.125rem; font-weight: 600; color: #f4f4f5; }

          /* --- Modals --- */
          .modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); z-index: 50; display: flex; justify-content: center; align-items: center; padding: 1rem; }
          .modal-content { background-color: #18181b; border-radius: 0.75rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; max-width: 28rem; border: 1px solid #3f3f46; animation: fadeIn 0.3s ease-out; }
          .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #27272a; }
          .modal-header h2 { font-size: 1.25rem; font-weight: 600; color: white; }
          .modal-body { padding: 1.5rem; }
          .profile-modal-body, .pools-modal-body { display: flex; flex-direction: column; gap: 1rem; }
          .profile-modal-body label { font-weight: 500; font-size: 0.875rem; color: #a1a1aa; }
          .modal-actions { display: flex; justify-content: flex-end; }
          .pfp-upload-container { display: flex; justify-content: center; margin-bottom: 1rem; position: relative; cursor: pointer; }
          .pfp-preview { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #3f3f46; }
          .pfp-overlay { position: absolute; inset: 0; background-color: rgba(0,0,0,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 0.2s; }
          .pfp-upload-container:hover .pfp-overlay { opacity: 1; }
          
          /* Pools Modal */
          .pools-modal-body { gap: 1.5rem; }
          .pool-action-group h3 { font-size: 1.125rem; font-weight: 600; color: white; margin-bottom: 0.5rem; }
          .pool-list-container { display: flex; flex-direction: column; gap: 0.5rem; }
          .pool-list-container > h3 { font-size: 1.125rem; font-weight: 600; color: white; margin-bottom: 0.5rem; }
          .pool-list-container ul { display: flex; flex-direction: column; gap: 0.5rem; max-height: 10rem; overflow-y: auto; list-style: none; }
          .pool-list-container > ul > li { background-color: #27272a; padding: 0.75rem; border-radius: 0.5rem; }
          .pool-name { font-weight: 600; }
          .pool-id { font-size: 0.75rem; color: #a1a1aa; cursor: pointer; }
          .pool-id:hover { color: white; }
          .pool-members { margin-top: 0.5rem; }
          .pool-members h4 { font-size: 0.875rem; color: #a1a1aa; margin-bottom: 0.25rem; }
          .pool-members ul { list-style: none; padding-left: 0; color: #d4d4d8; font-size: 0.875rem; }
          .member-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; }
          .member-item img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
          
          /* Collaborators Modal */
          .collaborators-list ul { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; max-height: 40vh; overflow-y: auto; }
          .collaborators-list li { display: flex; align-items: center; gap: 0.75rem; background-color: #27272a; padding: 0.5rem; border-radius: 0.5rem; }
          .collaborators-list li img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
          .collaborators-list li span { font-weight: 600; }
      `}</style>
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
  const [storage, setStorage] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const chartScriptId = 'chartjs-script';
    if (!document.getElementById(chartScriptId)) {
        const script = document.createElement('script');
        script.id = chartScriptId;
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.async = true;
        document.body.appendChild(script);
    }
      
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const firestore = getFirestore(app);
      const storageInstance = getStorage(app);
      setDb(firestore); 
      setAuth(authInstance); 
      setStorage(storageInstance);
      setLogLevel('debug');

      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
        setUser(user);
        if (user) { 
            setView('app'); 
        } else { 
            setView('welcome'); 
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (e) { console.error("Firebase initialization failed:", e); setIsLoading(false); }
  }, []);

  const handleNavigate = (targetView, mode = 'login') => { setAuthInitialMode(mode); setView(targetView); };
  
  if (isLoading) { return <div id="loading-screen"><div>Initializing...</div></div>; }
  
  switch(view) {
    case 'app':
        return user ? <MainApp db={db} user={user} auth={auth} storage={storage} /> : <WelcomeScreen onNavigate={handleNavigate} />;
    case 'auth':
        return <AuthScreen auth={auth} db={db} initialMode={authInitialMode} />;
    default:
        return <WelcomeScreen onNavigate={handleNavigate} />;
  }
}

