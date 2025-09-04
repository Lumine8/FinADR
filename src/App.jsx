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
    deleteDoc, setLogLevel, where, arrayUnion, setDoc, documentId, getDocs, writeBatch, arrayRemove, getDoc
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import { FaUserAstronaut, FaPiggyBank, FaCoffee, FaPizzaSlice, FaUserCircle, FaTrophy, FaSignOutAlt, FaMoon, FaSun, FaFileExport } from "react-icons/fa";
import { GiWaterDrop, GiTreasureMap, GiPartyPopper, GiAlarmClock } from "react-icons/gi";
import { MdOutlineSavings, MdCheckCircle } from "react-icons/md";
import { BsTrophy, BsPeopleFill } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import { IoFlash } from "react-icons/io5";
import { FaHamburger, FaCar, FaShoppingBag, FaFileInvoiceDollar, FaFilm, FaEllipsisH } from "react-icons/fa";


import Logo from './assets/logo.png';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

import { FiPlus, FiLogOut, FiUser, FiUsers, FiX, FiTarget, FiHome, FiMenu } from "react-icons/fi";
import { FaEdit, FaTrash, FaAward, FaBrain } from "react-icons/fa";
import { MdAutoAwesome } from "react-icons/md";
import { HiCollection } from "react-icons/hi";
import { RiShieldCheckLine } from "react-icons/ri";
import { BiGitBranch } from "react-icons/bi";

const PlusIcon = () => <FiPlus className="icon" />;
const EditIcon = () => <FaEdit className="icon-sm" />;
const DeleteIcon = () => <FaTrash className="icon-sm" />;
const SparklesIcon = () => <MdAutoAwesome className="icon-sm sparkles-icon" />;
const LogoutIcon = () => <FiLogOut className="icon" />;
const UserIcon = () => <FiUser className="icon" />;
const UsersIcon = () => <FiUsers className="icon" />;
const CloseIcon = () => <FiX className="icon" />;
const SplitIcon = () => <BiGitBranch className="icon-sm" />;
const CollectionIcon = () => <HiCollection className="icon" />;
const BrainIcon = () => <FaBrain className="feature-icon" />;
const ShieldCheckIcon = () => <RiShieldCheckLine className="feature-icon" />;
const TargetIcon = () => <FiTarget className="icon" />;
const TrophyIcon = () => <FaTrophy className="icon" />;
const HomeIcon = () => <FiHome className="icon" />;
const MenuIcon = () => <FiMenu className="icon" />;
const AwardIcon = () => <FaAward className="icon" />;

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

// --- WelcomeScreen, AuthScreen, Modal, ProfileForm ---
const WelcomeScreen = ({ onNavigate }) => (
  <div id="welcome-screen" className="welcome-container">
    {/* Top Navigation */}
    <nav className="navbar">
      <div className="logo-container">
        <img src={Logo} alt="FinADR Logo" className="logo-sm" />
        <span className="app-name">FinADR</span>
      </div>
      <div className="nav-buttons">
        <button
          onClick={() => onNavigate("auth", "login")}
          className="btn btn-secondary"
        >
          Login
        </button>
        <button
          onClick={() => onNavigate("auth", "signup")}
          className="btn btn-primary"
        >
          Sign Up
        </button>
      </div>
    </nav>

    {/* Hero Section */}
    <header className="hero-section">
      <h1 className="hero-title">Take Control of Your Finances</h1>
      <h2 className="tagline">Your Finance and Life Advisor</h2>
      <p className="hero-description">
        Track personal expenses, manage shared budgets with friends, and get
        AI-powered insights to achieve your financial goals.
      </p>
      <button
        onClick={() => onNavigate("auth", "signup")}
        className="btn btn-cta"
      >
        Get Started
      </button>
    </header>

    {/* Features Section */}
    <section className="features-section">
      <h3 className="section-title">Why Choose FinADR?</h3>
      <div className="features-grid">
        <div className="feature-card">
          <BrainIcon />
          <h4>Smart Tracking</h4>
          <p>
            AI suggestions and automatic timestamps make logging expenses
            effortless.
          </p>
        </div>
        <div className="feature-card">
          <UsersIcon />
          <h4>Collaborative Pools</h4>
          <p>
            Share finances with friends or family. Split bills and track group
            spending easily.
          </p>
        </div>
        <div className="feature-card">
          <SparklesIcon />
          <h4>AI-Powered Insights</h4>
          <p>
            Visualize your spending with charts and get personalized savings
            tips from our AI.
          </p>
        </div>
        <div className="feature-card">
          <ShieldCheckIcon />
          <h4>Secure & Private</h4>
          <p>
            Your financial data is encrypted and protected with
            industry-standard security.
          </p>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="footer">
      <p>&copy; 2025 FinADR. All rights reserved.</p>
    </footer>
  </div>
);

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
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
                let uniqueUsername = '';
                let isUnique = false;
                while (!isUnique) {
                    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
                    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
                    const randomNumber = Math.floor(Math.random() * 900) + 100;
                    const potentialUsername = `${randomAdjective}${randomNoun}${randomNumber}`;
                    const q = query(usersRef, where("displayName", "==", potentialUsername));
                    const querySnapshot = await getDocs(q);
                    if (querySnapshot.empty) {
                        uniqueUsername = potentialUsername;
                        isUnique = true;
                    }
                }
                
                const batch = writeBatch(db);
                
                const userProfileRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
                batch.set(userProfileRef, { displayName: uniqueUsername, location: '', budgets: {} });

                const achievementRef = doc(collection(db, `artifacts/${appId}/public/data/users/${user.uid}/achievements`), 'joined-the-club');
                batch.set(achievementRef, { name: 'Joined the Club', unlockedAt: new Date().toISOString() });

                await updateProfile(user, { displayName: uniqueUsername });
                await batch.commit();
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

const ProfileForm = ({ auth, db }) => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";
    const [newUsername, setNewUsername] = useState(auth.currentUser.displayName || '');

    const handleSave = async () => {
        setError('');
        setSuccess('');
        const nameToSave = newUsername.trim();
        if (!nameToSave) {
            setError("Display name cannot be empty.");
            return;
        }
        if (nameToSave !== auth.currentUser.displayName) {
            const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
            const q = query(usersRef, where("displayName", "==", nameToSave));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setError("This username is already taken. Please choose another one.");
                return;
            }
        }
        try {
            await updateProfile(auth.currentUser, { displayName: nameToSave });
            const userProfileRef = doc(db, `artifacts/${appId}/public/data/users`, auth.currentUser.uid);
            await setDoc(userProfileRef, { displayName: nameToSave }, { merge: true });
            setSuccess("Username updated successfully!");
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="profile-modal-body">
            <label>Display Name</label>
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="modal-actions">
                <button onClick={handleSave} className="btn-primary">
                    Save Username
                </button>
            </div>
        </div>
    );
};

// --- PoolsModal, SpendingChart, BudgetModal, LocationModal, Achievements ---
const PoolsModal = ({ db, user, pools, onPoolLeave }) => {
    const userId = user.uid;
    const [poolName, setPoolName] = useState('');
    const [joinId, setJoinId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [memberDetails, setMemberDetails] = useState({});
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const awardBadge = async (badgeId, badgeData) => {
        const achievementRef = doc(db, `artifacts/${appId}/public/data/users/${userId}/achievements`, badgeId);
        const docSnap = await getDoc(achievementRef);
        if (!docSnap.exists()) {
            await setDoc(achievementRef, badgeData);
            alert(`New Badge Unlocked: ${badgeData.name}!`);
        }
    };

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
                userDocs.forEach(doc => { userMap[doc.id] = { displayName: doc.data().displayName }; });
                if (!userMap[userId]) { userMap[userId] = { displayName: user.displayName }; }
                const details = {};
                pools.forEach(pool => { details[pool.id] = pool.members.map(uid => userMap[uid] || { displayName: `User...${uid.slice(-4)}` }); });
                setMemberDetails(details);
            } catch (err) { console.error("Error fetching member names:", err); }
        };
        fetchMemberNames();
    }, [pools, db, user, appId, userId]);

    const handleCreatePool = async () => {
        if (!poolName.trim()) { setError("Pool name cannot be empty."); return; }
        setError(''); setSuccess('');
        try {
            await awardBadge('pool-pioneer', { name: 'Pool Pioneer', unlockedAt: new Date().toISOString() });
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
            await awardBadge('team-player', { name: 'Team Player', unlockedAt: new Date().toISOString() });
            const poolRef = doc(db, `artifacts/${appId}/public/data/pools`, joinId.trim());
            await updateDoc(poolRef, { members: arrayUnion(userId) });
            setSuccess("Successfully joined pool!");
            setJoinId('');
        } catch (err) { 
            console.error("Join pool error:", err);
            setError("Invalid Pool ID or you don't have permission."); 
        }
    };
    
    const handleLeavePool = async (poolId) => {
        setError(''); setSuccess('');
        try {
            const poolRef = doc(db, `artifacts/${appId}/public/data/pools`, poolId);
            await updateDoc(poolRef, { members: arrayRemove(userId) });
            setSuccess("You have left the pool.");
            if (onPoolLeave) onPoolLeave();
        } catch (err) {
             console.error("Leave pool error:", err);
             setError("Could not leave the pool.");
        }
    };

    const handleRemind = (memberName) => {
        alert(`A reminder has been sent to ${memberName}! (This requires backend Cloud Functions to work)`);
    };

    return (
        <div className="card">
            <h2>Manage Expense Pools</h2>
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
                        <ul>
                            {pools.map(pool => (
                                <li key={pool.id}>
                                    <div className="pool-header">
                                        <p className="pool-name">{pool.name}</p>
                                        <button className="btn-leave-pool" onClick={() => handleLeavePool(pool.id)}>Leave</button>
                                    </div>
                                    <p className="pool-id" onClick={() => navigator.clipboard.writeText(pool.id)}>
                                        ID: {pool.id} (click to copy)
                                    </p>
                                    <div className="pool-members">
                                        <h4>Members:</h4>
                                        <ul>
                                            {(memberDetails[pool.id] || []).map((member, index) => (
                                                <li key={index} className="member-item">
                                                    <span>{member.displayName}</span>
                                                    {member.displayName !== user.displayName && (
                                                        <button className="btn-remind" onClick={() => handleRemind(member.displayName)}>Remind</button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (<p className="no-data">You haven't joined any pools yet.</p>)}
                </div>
            </div>
        </div>
    );
};

const SpendingChart = ({ data: chartData }) => {
    const data = {
        labels: chartData.map(item => item[0]),
        datasets: [{
            label: 'Spending',
            data: chartData.map(item => item[1]),
            backgroundColor: ['#22c55e', '#ef4444', '#3b82f6', '#eab308', '#8b5cf6', '#f97316', '#14b8a6'],
            borderColor: '#18181b',
            borderWidth: 4,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#a1a1aa',
                    font: { size: 14 },
                    boxWidth: 20,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        }
    };

    return (
        <div className="chart-container">
            {chartData.length > 0 ? <Doughnut data={data} options={options} /> : <p className="no-data">No spending data for a chart yet.</p>}
        </div>
    );
};


const BudgetModal = ({ db, userId, userSettings, onClose }) => {
    const [budgets, setBudgets] = useState(userSettings.budgets || {});
    const [success, setSuccess] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const handleBudgetChange = (category, value) => {
        setBudgets(prev => ({ ...prev, [category]: parseFloat(value) || 0 }));
    };

    const handleSaveBudgets = async () => {
        try {
            const settingsRef = doc(db, `artifacts/${appId}/public/data/users`, userId);
            await updateDoc(settingsRef, { budgets });
            setSuccess("Budgets saved successfully!");
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            console.error("Error saving budgets: ", err);
        }
    };

    return (
        <Modal title="Set Monthly Budgets" onClose={onClose}>
            <div className="budget-modal-body">
                <p>Set a monthly spending limit for each category.</p>
                {CATEGORIES.map(cat => (
                    <div className="input-group" key={cat}>
                        <label>{cat}</label>
                        <input
                            type="number"
                            value={budgets[cat] || ''}
                            onChange={(e) => handleBudgetChange(cat, e.target.value)}
                            placeholder="₹0.00"
                        />
                    </div>
                ))}
                {success && <p className="success-message centered">{success}</p>}
                <div className="modal-actions">
                    <button onClick={handleSaveBudgets} className="btn-primary">Save Budgets</button>
                </div>
            </div>
        </Modal>
    );
};

const LocationModal = ({ db, userId, onClose }) => {
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const handleSaveLocation = async () => {
        if (!location.trim()) {
            setError("Please enter your city name.");
            return;
        }
        try {
            const settingsRef = doc(db, `artifacts/${appId}/public/data/users`, userId);
            await updateDoc(settingsRef, { location: location.trim() });
            onClose(true);
        } catch (err) {
            console.error("Error saving location:", err);
            setError("Could not save location.");
        }
    };

    return (
        <Modal title="Set Your Location" onClose={() => onClose(false)}>
            <div className="profile-modal-body">
                <p>To give you personalized tips, we need to know your city.</p>
                <label>City Name</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Vellore" />
                {error && <p className="error-message">{error}</p>}
                <div className="modal-actions">
                    <button onClick={handleSaveLocation} className="btn-primary">Save & Continue</button>
                </div>
            </div>
        </Modal>
    );
};

const ALL_BADGES = {
    'joined-the-club': { name: 'Joined the Club', description: 'Welcome! You\'ve officially started your financial journey.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.363a1.76 1.76 0 013.417-.592V5.882a1.76 1.76 0 013.417.592l2.147 6.363a1.76 1.76 0 01-3.417.592z" /></svg> },
    'first-drop': { name: 'First Drop', description: 'You\'ve logged your first expense. The first step is always the hardest!', icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> },
    'pool-pioneer': { name: 'Pool Pioneer', description: 'You started your first expense pool! Collaboration is key.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> },
    'team-player': { name: 'Team Player', description: 'You joined an expense pool. Better together!', icon: <UsersIcon /> },
    'goal-smasher': { name: 'Goal Smasher', description: 'Met a monthly savings goal!', icon: <TrophyIcon /> },
    'overachiever': { name: 'Overachiever', description: 'Hit 2x your savings goal. Flex much?', icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    'barely-made-it': { name: 'Barely Made It', description: "Hit your savings goal by a hair. Lucky...", icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    'budget-pro': { name: 'Budget Pro', description: 'Stayed under budget for every category!', icon: <ShieldCheckIcon /> },
    'caffeine-survivor': { name: 'Caffeine Survivor', description: 'Spent a *lot* on coffee. You okay?', icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    'early-bird': { name: 'Early Bird', description: 'Logged an expense before 8 AM.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    'foodie': { name: 'Foodie', description: 'More than 50% of your budget was for food. Respect.', icon: <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg> },
};

// --- Page Components ---
// --- Updated and Corrected ProfilePage Component ---
const ProfilePage = ({ auth, db }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const appId = "1:608681523529:web:8f3bed536feada05224298";
  const [newUsername, setNewUsername] = useState(auth.currentUser.displayName || "");
  const [achievements, setAchievements] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]); // store merged expenses
  const [stats, setStats] = useState({
    totalMonth: 0,
    biggestCategory: "None",
    goalProgress: 0,
  });

  // --- Fetch Achievements ---
  useEffect(() => {
    const achievementsRef = collection(db, `artifacts/${appId}/public/data/users/${auth.currentUser.uid}/achievements`);
    const unsubscribe = onSnapshot(achievementsRef, (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [auth.currentUser.uid, db, appId]);

  // --- Fetch ALL Expenses from all pools ---
  useEffect(() => {
    const fetchAllExpenses = async () => {
      try {
        const poolsRef = collection(db, `artifacts/${appId}/public/data/users/${auth.currentUser.uid}/pools`);
        const poolsSnapshot = await getDocs(poolsRef);

        let mergedExpenses = [];
        for (const poolDoc of poolsSnapshot.docs) {
          const expensesRef = collection(poolDoc.ref, "expenses");
          const expensesSnapshot = await getDocs(expensesRef);
          const poolExpenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          mergedExpenses = [...mergedExpenses, ...poolExpenses];
        }

        setAllExpenses(mergedExpenses);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };

    fetchAllExpenses();
  }, [auth.currentUser.uid, db, appId]);

  // --- Compute Quick Stats from ALL expenses ---
  useEffect(() => {
    if (!allExpenses || allExpenses.length === 0) return;

    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const thisMonthExpenses = allExpenses.filter(exp => exp.date?.startsWith(monthKey));

    const totalMonth = thisMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const categoryMap = thisMonthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + (exp.amount || 0);
      return acc;
    }, {});

    const biggestCategory = Object.keys(categoryMap).length > 0
      ? Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0][0]
      : "None";

    const goal = 10000; // Example monthly budget
    const goalProgress = Math.min((totalMonth / goal) * 100, 100);

    setStats({ totalMonth, biggestCategory, goalProgress });
  }, [allExpenses]);

  // --- Handle Username Save ---
  const handleSave = async () => {
    setError("");
    setSuccess("");
    const nameToSave = newUsername.trim();
    if (!nameToSave) {
      setError("Display name cannot be empty.");
      return;
    }
    if (nameToSave !== auth.currentUser.displayName) {
      const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
      const q = query(usersRef, where("displayName", "==", nameToSave));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError("This username is already taken.");
        return;
      }
    }
    try {
      await updateProfile(auth.currentUser, { displayName: nameToSave });
      const userProfileRef = doc(db, `artifacts/${appId}/public/data/users`, auth.currentUser.uid);
      await setDoc(userProfileRef, { displayName: nameToSave }, { merge: true });
      setSuccess("Username updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Profile Tagline Component ---
  const ProfileTagline = () => {
    const [quote, setQuote] = useState("🚀 Building better money habits");
    const localQuotes = [
      "An investment in knowledge pays the best interest. — Benjamin Franklin",
      "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
      "The best time to plant a tree was 20 years ago. The second-best time is now. — Chinese Proverb",
      "Beware of little expenses. A small leak will sink a great ship. — Benjamin Franklin",
      "Financial freedom is freedom from fear. — Robert Kiyosaki",
      "A budget is telling your money where to go instead of wondering where it went. — Dave Ramsey",
      "It’s not your salary that makes you rich, it’s your spending habits. — Charles A. Jaffe",
    ];

    useEffect(() => {
      const randomQuote = localQuotes[Math.floor(Math.random() * localQuotes.length)];
      setQuote(`💡 ${randomQuote}`);
    }, []);

    return <p className="profile-tagline">{quote}</p>;
  };

  return (
    <div className="profile-page">
      <div className="card profile-header">
        <p style={{fontSize:'10px'}}>{"{Profile-page under construction}"}</p>
        <br />
        <h2>{auth.currentUser.displayName || "Anonymous User"}</h2>
        <ProfileTagline />
      </div>

      <div className="card profile-edit">
        <label>Display Name</label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button onClick={handleSave} className="btn-primary">
          Save Username
        </button>
      </div>

      <div className="card profile-stats">
        <h3>📊 Quick Stats</h3>
        <p><strong>This Month:</strong> ₹{stats.totalMonth.toFixed(2)}</p>
        <p><strong>Biggest Category:</strong> {stats.biggestCategory}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${stats.goalProgress}%` }}></div>
        </div>
        <p>{stats.goalProgress.toFixed(0)}% of monthly goal spent</p>
      </div>

      <div className="card profile-achievements">
        <h3><FaTrophy /> Achievements</h3>
        {achievements.length === 0 ? (
          <p>No achievements yet. Start tracking expenses!</p>
        ) : (
          <ul>
            {achievements.map(a => (
              <li key={a.id}>🏅 {a.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Replace the existing AchievementsPage component with this new one

const AchievementsPage = ({ db, userId }) => {
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const ALL_BADGES = {
  "joined-the-club": {
    name: "Joined the Club",
    description: "Welcome! You’ve officially started your financial journey.",
    icon: <FaUserAstronaut className="text-purple-500 text-3xl" />,
  },
  "first-drop": {
    name: "First Drop",
    description: "You’ve logged your first expense. The journey begins!",
    icon: <GiWaterDrop className="text-blue-400 text-3xl" />,
  },
  "pool-pioneer": {
    name: "Pool Pioneer",
    description: "You started your first expense pool! Collaboration is key.",
    icon: <GiTreasureMap className="text-yellow-600 text-3xl" />,
  },
  "team-player": {
    name: "Team Player",
    description: "You joined an expense pool. Better together!",
    icon: <BsPeopleFill className="text-green-500 text-3xl" />,
  },
  "goal-smasher": {
    name: "Goal Smasher",
    description: "Met a monthly savings goal!",
    icon: <TbTargetArrow className="text-red-500 text-3xl" />,
  },
  "overachiever": {
    name: "Overachiever",
    description: "Hit 2x your savings goal. Flex much?",
    icon: <BsTrophy className="text-yellow-500 text-3xl" />,
  },
  "barely-made-it": {
    name: "Barely Made It",
    description: "Hit your savings goal by a hair. Lucky...",
    icon: <IoFlash className="text-orange-400 text-3xl" />,
  },
  "budget-pro": {
    name: "Budget Pro",
    description: "Stayed under budget for every category!",
    icon: <MdOutlineSavings className="text-teal-500 text-3xl" />,
  },
  "caffeine-survivor": {
    name: "Caffeine Survivor",
    description: "Spent a *lot* on coffee. You okay?",
    icon: <FaCoffee className="text-brown-600 text-3xl" />,
  },
  "early-bird": {
    name: "Early Bird",
    description: "Logged an expense before 8 AM.",
    icon: <GiAlarmClock className="text-indigo-500 text-3xl" />,
  },
  "foodie": {
    name: "Foodie",
    description: "More than 50% of your budget was for food. Respect.",
    icon: <FaPizzaSlice className="text-pink-500 text-3xl" />,
  },
  "celebrator": {
    name: "Celebrator",
    description: "Unlocked 5 achievements. Keep going!",
    icon: <GiPartyPopper className="text-fuchsia-500 text-3xl" />,
  },
  "consistent-saver": {
    name: "Consistent Saver",
    description: "Saved every month for 6 months straight.",
    icon: <FaPiggyBank className="text-emerald-500 text-3xl" />,
  },
  "certified-pro": {
    name: "Certified Pro",
    description: "Unlocked all achievements. You legend!",
    icon: <MdCheckCircle className="text-lime-600 text-3xl" />,
  },
};
    
    useEffect(() => {
        if (!db || !userId) return;
        const achievementsRef = collection(db, `artifacts/${appId}/public/data/users/${userId}/achievements`);
        const q = query(achievementsRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const unlockedIds = snapshot.docs.map(doc => {
                const baseId = doc.id.includes('-') ? doc.id.split('-').slice(0, -1).join('-') : doc.id;
                return baseId;
            });
            setUnlockedAchievements(unlockedIds);
        });
        return () => unsubscribe();
    }, [db, userId, appId]);

    const filteredBadges = useMemo(() => {
        return Object.entries(ALL_BADGES).filter(([id]) => {
            const isUnlocked = unlockedAchievements.includes(id);
            if (filter === 'unlocked') return isUnlocked;
            if (filter === 'locked') return !isUnlocked;
            return true;
        });
    }, [unlockedAchievements, filter]);

    return (
        <div className="page-container">
            <div className="card">
                <h2>All Achievements</h2>
                <p className="subtitle">Track your progress and unlock all the badges!</p>
                
                <div className="filter-toggle">
                    <button className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                    <button className={`toggle-btn ${filter === 'unlocked' ? 'active' : ''}`} onClick={() => setFilter('unlocked')}>Unlocked</button>
                    <button className={`toggle-btn ${filter === 'locked' ? 'active' : ''}`} onClick={() => setFilter('locked')}>Locked</button>
                </div>

                <div className="achievements-grid full-page">
                    {filteredBadges.map(([id, badge]) => {
                        const isUnlocked = unlockedAchievements.includes(id);
                        return (
                            <div key={id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`} title={`${badge.name}: ${badge.description}`}>
                                <div className="achievement-icon">{badge.icon}</div>
                                <p className="achievement-name">{badge.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


const PoolsPage = ({ db, user, pools, onPoolLeave }) => (
    <div className="page-container">
        <PoolsModal db={db} user={user} pools={pools} onPoolLeave={onPoolLeave} />
    </div>
);

const GoalsPage = ({ db, user, allExpenses }) => {
    const [userSettings, setUserSettings] = useState({ monthlyGoals: {}, achievements: [] });
    const [thisMonthGoal, setThisMonthGoal] = useState({ income: 0, goal: 0 });
    const [success, setSuccess] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";
    const currentMonthKey = new Date().toISOString().slice(0, 7);

    useEffect(() => {
        if (!db || !user) return;
        const settingsRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
        const unsubscribe = onSnapshot(settingsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUserSettings(data);
                if (data.monthlyGoals && data.monthlyGoals[currentMonthKey]) {
                    setThisMonthGoal(data.monthlyGoals[currentMonthKey]);
                } else {
                    setThisMonthGoal({ income: 0, goal: 0 });
                }
            }
        });
        return () => unsubscribe();
    }, [db, user, appId, currentMonthKey]);

    const handleGoalChange = (field, value) => {
        setThisMonthGoal(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleSaveGoal = async () => {
        try {
            const settingsRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
            await setDoc(settingsRef, {
                monthlyGoals: {
                    ...userSettings.monthlyGoals,
                    [currentMonthKey]: thisMonthGoal
                }
            }, { merge: true });
            setSuccess("Goal saved successfully!");
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            console.error("Error saving goal:", err);
        }
    };

    const expensesForMonth = useMemo(() => {
        return allExpenses.filter(exp => exp.date.startsWith(currentMonthKey));
    }, [allExpenses, currentMonthKey]);

    const totalExpenses = useMemo(() => {
        return expensesForMonth.reduce((sum, exp) => sum + exp.amount, 0);
    }, [expensesForMonth]);

    const savings = useMemo(() => thisMonthGoal.income - totalExpenses, [thisMonthGoal.income, totalExpenses]);
    const goalMet = useMemo(() => thisMonthGoal.goal > 0 && savings >= thisMonthGoal.goal, [savings, thisMonthGoal.goal]);

    useEffect(() => {
        if (!db || !user || !goalMet) return;

        const checkAndUnlockBadges = async () => {
            const batch = writeBatch(db);
            const achievementsRef = collection(db, `artifacts/${appId}/public/data/users/${user.uid}/achievements`);
            const existingAchievementsSnapshot = await getDocs(achievementsRef);
            const existingBadges = existingAchievementsSnapshot.docs.map(d => d.id);
            let newBadgesUnlocked = [];

            const awardBadge = (id, data) => {
                const badgeKey = `${id}-${currentMonthKey}`;
                if (!existingBadges.includes(badgeKey)) {
                    const newBadgeRef = doc(achievementsRef, badgeKey);
                    batch.set(newBadgeRef, data);
                    newBadgesUnlocked.push(data.name);
                }
            };
            
            awardBadge('goal-smasher', { name: 'Goal Smasher', unlockedAt: new Date().toISOString() });

            if (savings >= thisMonthGoal.goal * 2) {
                awardBadge('overachiever', { name: 'Overachiever', unlockedAt: new Date().toISOString() });
            }

            if (savings - thisMonthGoal.goal < 100) {
                awardBadge('barely-made-it', { name: 'Barely Made It', unlockedAt: new Date().toISOString() });
            }
            
            const foodExpenses = expensesForMonth.filter(e => e.category === 'Food').reduce((sum, e) => sum + e.amount, 0);
            if (foodExpenses > totalExpenses * 0.5 && totalExpenses > 0) {
                awardBadge('foodie', { name: 'Foodie', unlockedAt: new Date().toISOString() });
            }

            if (newBadgesUnlocked.length > 0) {
                await batch.commit();
                alert(`New Badge(s) Unlocked: ${newBadgesUnlocked.join(', ')}!`);
            }
        };

        checkAndUnlockBadges();
    }, [goalMet, db, user, appId, currentMonthKey, savings, thisMonthGoal.goal, expensesForMonth, totalExpenses]);

    return (
        <div className="page-container">
            <div className="card">
                <h2>Your Financial Goals</h2>
                <div className="goal-setup">
                    <h3>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Goal</h3>
                    <div className="input-group">
                        <label>Monthly Income (₹)</label>
                        <input type="number" value={thisMonthGoal.income || ''} onChange={(e) => handleGoalChange('income', e.target.value)} placeholder="e.g., 50000" />
                    </div>
                    <div className="input-group">
                        <label>Monthly Savings Goal (₹)</label>
                        <input type="number" value={thisMonthGoal.goal || ''} onChange={(e) => handleGoalChange('goal', e.target.value)} placeholder="e.g., 5000" />
                    </div>
                    {success && <p className="success-message centered">{success}</p>}
                    <button onClick={handleSaveGoal} className="btn-primary full-width">Set Goal</button>
                </div>
                <div className="goal-progress">
                    <h3>Progress</h3>
                    <p>Income: ₹{thisMonthGoal.income.toFixed(2)}</p>
                    <p>Expenses: ₹{totalExpenses.toFixed(2)}</p>
                    <p>Savings: ₹{savings.toFixed(2)}</p>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${(savings / thisMonthGoal.goal) * 100}%` }}></div>
                    </div>
                    {goalMet && (
                        <div className="achievement-unlocked">
                            <TrophyIcon />
                            <p>Congratulations! You've met your savings goal for the month!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Helper Component for Expense Icons ---
// Place this right before your DashboardPage component
// --- ExpenseCategoryIcon Helper Component ---
const ExpenseCategoryIcon = ({ category }) => {
    const style = {
        Food: { icon: <FaHamburger />, color: '#f97316' },
        Transport: { icon: <FaCar />, color: '#3b82f6' },
        Shopping: { icon: <FaShoppingBag />, color: '#8b5cf6' },
        Bills: { icon: <FaFileInvoiceDollar />, color: '#ef4444' },
        Entertainment: { icon: <FaFilm />, color: '#14b8a6' },
        Other: { icon: <FaEllipsisH />, color: '#71717a' },
    };
    const categoryStyle = style[category] || style['Other'];

    // convert hex to rgba for lighter background
    const hexToRgba = (hex, alpha = 0.1) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <div
            className="category-icon-container"
            style={{
                backgroundColor: hexToRgba(categoryStyle.color, 0.1),
                color: categoryStyle.color,
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            {categoryStyle.icon}
        </div>
    );
};


// --- Updated DashboardPage Component ---
const DashboardPage = ({ db, user, allExpenses, pools }) => {
    const userId = user.uid;
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [currentPoolId, setCurrentPoolId] = useState('personal');
    const [analysis, setAnalysis] = useState('');
    const [analysisError, setAnalysisError] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const appId = "1:608681523529:web:8f3bed536feada05224298";
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitMembers, setSplitMembers] = useState([]);
    const [poolMembers, setPoolMembers] = useState([]);
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
    const [userSettings, setUserSettings] = useState({ location: '', budgets: {} });
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);

    const awardBadge = async (badgeId, badgeData) => {
        const achievementRef = doc(db, `artifacts/${appId}/public/data/users/${userId}/achievements`, badgeId);
        const docSnap = await getDoc(achievementRef);
        if (!docSnap.exists()) {
            await setDoc(achievementRef, badgeData);
            alert(`New Badge Unlocked: ${badgeData.name}!`);
        }
    };
    
    const formattedAnalysis = useMemo(() => {
        if (!analysis) return "";
        return analysis
            .replace(/^### (.*$)/gim, "<h3>$1</h3>")
            .replace(/^## (.*$)/gim, "<h2>$1</h2>")
            .replace(/^# (.*$)/gim, "<h1>$1</h1>")
            .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/gim, "<em>$1</em>")
            .replace(/^\s*[-*] (.*$)/gim, "<li>$1</li>")
            .replace(/\n/g, "<br/>");
    }, [analysis]);

    useEffect(() => {
        if (!db || !userId) return;
        const settingsRef = doc(db, `artifacts/${appId}/public/data/users`, userId);
        const unsubscribe = onSnapshot(settingsRef, (doc) => {
            if (doc.exists()) {
                setUserSettings(doc.data());
            }
        });
        return () => unsubscribe();
    }, [db, userId, appId]);

    useEffect(() => {
        const fetchPoolMembers = async () => {
            if (currentPoolId === 'personal') {
                setPoolMembers([]);
                return;
            }
            const currentPool = pools.find(p => p.id === currentPoolId);
            if (currentPool && currentPool.members) {
                try {
                    const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
                    const q = query(usersRef, where(documentId(), 'in', currentPool.members));
                    const userDocs = await getDocs(q);
                    const members = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPoolMembers(members);
                    setSplitMembers([userId]);
                } catch (err) {
                    console.error("Error fetching pool members:", err);
                }
            }
        };
        if (db && userId && pools.length > 0) {
            fetchPoolMembers();
        }
    }, [db, userId, currentPoolId, pools, appId]);

    const callGeminiAPI = async (systemPrompt, userPrompt) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { 
            contents: [{ parts: [{ text: userPrompt }] }], 
            systemInstruction: { parts: [{ text: systemPrompt }] } 
        };
        try {
            const response = await fetch(apiUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (error) { 
            console.error("Gemini API call failed:", error); 
            return { error: "Failed to communicate with the AI. The API key may be missing or invalid." };
        }
    };

    const expenses = useMemo(() => {
        const relevantExpenses = allExpenses.filter(exp => (exp.poolId || 'personal') === currentPoolId);
        return relevantExpenses.filter(exp => exp.date.startsWith(filterMonth));
    }, [allExpenses, filterMonth, currentPoolId]);

    const handleGetAnalysis = async () => {
        if (!userSettings.location) {
            setShowLocationModal(true);
            return;
        }
        if (expenses.length === 0) { 
            setAnalysis("Not enough data for a coach to analyze."); 
            return; 
        }
        setIsAnalyzing(true); 
        setAnalysis(''); 
        setAnalysisError('');

        // Compute previous month
        const [year, month] = filterMonth.split("-");
        const prevDate = new Date(year, parseInt(month) - 2, 1); 
        const prevMonth = prevDate.toISOString().slice(0, 7);

        const prevExpenses = allExpenses.filter(
            exp => (exp.poolId || 'personal') === currentPoolId && exp.date.startsWith(prevMonth)
        );

        const systemPrompt = `
        You are FinADR, the user's personal Finance and Life Coach.
        Tone: supportive, conversational, motivational.

        Your response must include:
        - **Strength**: One positive thing in their current spending habits.
        - **Comparison to Last Month**: Highlight 1–2 key differences (savings or overspending).
        - **Tips**: 2–3 highly specific suggestions (budgeting habit, lifestyle tweak, motivational note).

        Format clearly into sections like a coaching journal.
        End with a motivational one-liner.
        `;

        const userPrompt = `
        My name is ${user.displayName}.
        Location: ${userSettings.location}.
        Budgets: ${JSON.stringify(userSettings.budgets)}.

        This month’s expenses (${filterMonth}): 
        ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category })))}

        Previous month’s expenses (${prevMonth}): 
        ${JSON.stringify(prevExpenses.map(e => ({ title: e.title, amount: e.amount, category: e.category })))}

        Compare both months and coach me.
        `;

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
        if (result && !result.error && CATEGORIES.includes(result)) {
            setCategory(result);
        } else {
            setError("Could not suggest a category.");
        }
        setIsSuggesting(false);
    };

    const validateForm = () => {
        const amountToValidate = parseFloat(amount);
        if (!title.trim() || isNaN(amountToValidate) || amountToValidate <= 0 || !date) {
            setError('Please fill all fields with valid data.');
            return false;
        }
        if (isSplitting && splitMembers.length < 2) {
            setError('Please select at least two members to split the bill.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSplitMemberToggle = (memberId) => {
        setSplitMembers(prev => prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm() || !db || !user) return;

        if(allExpenses.length === 0) {
            await awardBadge('first-drop', { name: 'First Drop', unlockedAt: new Date().toISOString() });
        }

        const expenseHour = new Date(date).getHours();
        if(expenseHour < 8) {
            await awardBadge('early-bird', { name: 'Early Bird', unlockedAt: new Date().toISOString() });
        }
        
        const collectionPath = currentPoolId === 'personal' ? 
            `artifacts/${appId}/users/${userId}/expenses` : 
            `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses`;
        try {
            if (isSplitting && currentPoolId !== 'personal') {
                const batch = writeBatch(db);
                const totalAmount = parseFloat(amount);
                const amountPerPerson = totalAmount / splitMembers.length;
                const splitGroupId = Date.now().toString();
                const payerData = poolMembers.find(m => m.id === userId);
                splitMembers.forEach(memberId => {
                    const memberData = poolMembers.find(m => m.id === memberId);
                    const newExpenseRef = doc(collection(db, collectionPath));
                    batch.set(newExpenseRef, {
                        title: `${title.trim()} (Split)`,
                        amount: amountPerPerson,
                        category,
                        date,
                        authorId: memberId,
                        authorName: memberData?.displayName || `User...${memberId.slice(-4)}`,
                        paidById: userId,
                        paidByName: payerData?.displayName || user.email,
                        splitGroupId
                    });
                });
                await batch.commit();
            } else {
                const expenseData = { title: title.trim(), amount: parseFloat(amount), category, date, authorId: userId, authorName: user.displayName || user.email };
                if (editingId) {
                    await updateDoc(doc(db, collectionPath, editingId), expenseData);
                } else {
                    await addDoc(collection(db, collectionPath), expenseData);
                }
            }
            resetForm();
        } catch (err) {
            console.error("Error saving expense:", err);
            setError(err.code === 'permission-denied' ? "Permission denied." : "Could not save the expense.");
        }
    };

    const handleDelete = async (id) => {
        if (!db || !userId) return;
        let docPath = currentPoolId === 'personal' ? 
            `artifacts/${appId}/users/${userId}/expenses/${id}` : 
            `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses/${id}`;
        try {
            await deleteDoc(doc(db, docPath));
        } catch (err) {
            console.error("Error deleting expense:", err);
            setError(err.code === 'permission-denied' ? "Permission denied." : "Could not delete the expense.");
        }
    };

    const handleEdit = (expense) => {
        if (expense.splitGroupId) {
            setError("Splitting bills cannot be edited.");
            setTimeout(() => setError(''), 3000);
            return;
        }
        setEditingId(expense.id);
        setTitle(expense.title);
        setAmount(expense.amount);
        setCategory(expense.category);
        setDate(expense.date.slice(0, 16));
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const resetForm = () => { 
        setTitle(''); 
        setAmount(''); 
        setCategory('Food'); 
        setDate(new Date().toISOString().slice(0, 16)); 
        setEditingId(null); 
        setShowForm(false); 
        setError(''); 
        setIsSplitting(false); 
        setSplitMembers([]); 
    };

    const toggleForm = () => showForm ? resetForm() : setShowForm(true);

    const totalExpenses = useMemo(() => expenses.reduce((acc, exp) => acc + exp.amount, 0), [expenses]);
    const expensesByCategory = useMemo(() => {
        const categoryMap = expenses.reduce((acc, exp) => { 
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount; 
            return acc; 
        }, {});
        return Object.entries(categoryMap).sort(([, a], [, b]) => b - a);
    }, [expenses]);

    const currentContextName = useMemo(() => 
        currentPoolId === 'personal' ? "Personal Expenses" : pools.find(p => p.id === currentPoolId)?.name || "Loading Pool...", 
        [currentPoolId, pools]
    );

    return (
        <>
            {showBudgetModal && <BudgetModal db={db} userId={userId} userSettings={userSettings} onClose={() => setShowBudgetModal(false)} />}
            {showLocationModal && <LocationModal db={db} userId={userId} onClose={(success) => { setShowLocationModal(false); if (success) handleGetAnalysis(); }} />}
            
            {/* Context Switcher */}
            <div className="card context-switcher">
                <div className="filter-group">
                    <label htmlFor="month-select">Viewing Month:</label>
                    <input
                        type="month"
                        id="month-select"
                        value={filterMonth}
                        max={new Date().toISOString().slice(0, 7)}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="context-select">Viewing Expenses For:</label>
                    <select 
                      id="context-select" 
                      value={currentPoolId} 
                      onChange={(e) => setCurrentPoolId(e.target.value)}
                    >
                      <option value="personal">My Personal Expenses</option>
                      {pools.map(pool => (
                        <option key={pool.id} value={pool.id}>{pool.name}</option>
                      ))}
                    </select>
                </div>
            </div>

            {/* Add Expense Button */}
            <div id="add-expense-btn-container">
                <button onClick={toggleForm} className="btn-add-expense"><PlusIcon /></button>
            </div>

            {/* Expense Form */}
            {showForm && (
                <div className="card form-card">
                    <h2>{editingId ? 'Edit Expense' : 'Add New Expense'} to {currentContextName}</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <div className="input-group">
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <button type="button" onClick={handleSuggestCategory} disabled={isSuggesting || !title} className="btn-suggest">
                                {isSuggesting ? '...' : <><SparklesIcon /> Suggest</>}
                            </button>
                        </div>
                        <input type="number" placeholder={isSplitting ? "Total Amount to Split" : "Amount"} value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
                        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                        {currentPoolId !== 'personal' && !editingId && (
                            <button type="button" onClick={() => setIsSplitting(!isSplitting)} className={`btn-secondary full-width btn-with-icon ${isSplitting ? 'active' : ''}`}>
                                <SplitIcon /> {isSplitting ? 'Cancel Split' : 'Split Bill'}
                            </button>
                        )}
                        {isSplitting && (
                            <div className="split-section">
                                <h4>Split with:</h4>
                                <div className="split-members-list">
                                    {poolMembers.map(member => (
                                        <label key={member.id} className="split-member-label">
                                            <input type="checkbox" checked={splitMembers.includes(member.id)} onChange={() => handleSplitMemberToggle(member.id)} />
                                            {member.displayName}
                                        </label>
                                    ))}
                                </div>
                                {splitMembers.length > 0 && amount > 0 && (
                                    <p className="split-result">
                                        Each pays: ₹{(parseFloat(amount) / splitMembers.length).toFixed(2)}
                                    </p>
                                )}
                            </div>
                        )}
                        {error && <p className="error-message centered">{error}</p>}
                        <div className="form-actions">
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Summary */}
            <div className="card">
                <h2>Summary for {currentContextName} ({new Date(filterMonth).toLocaleString('default', { month: 'long', year: 'numeric' })})</h2>
                <div className="summary-content">
                    <div className="summary-total"><span>Total Expenses:</span><span>₹{totalExpenses.toFixed(2)}</span></div>
                    <hr />
                    <h3>By Category:</h3>
                    <SpendingChart data={expensesByCategory} />
                    {expensesByCategory.length > 0 ? (
                        <ul>
                            {expensesByCategory.map(([cat, total]) => (
                                <li key={cat}><span>{cat}</span><span>₹{total.toFixed(2)}</span></li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data">No expenses yet.</p>
                    )}
                    <button onClick={() => setShowBudgetModal(true)} className="btn-secondary full-width btn-with-icon"><TargetIcon /> Set Budgets</button>
                </div>

                {/* AI Coaching Section */}
                <div className="ai-section">
                    <button onClick={handleGetAnalysis} disabled={isAnalyzing} className="btn-primary full-width btn-with-icon">
                        <SparklesIcon /> {isAnalyzing ? 'Analyzing...' : 'Get Personal Coaching'}
                    </button>
                    {analysisError && <p className="error-message">{analysisError}</p>}
                    {analysis && (
                        <div className="prose">
                            <h3 style={{marginTop:'20px'}}>Your Personal Coaching Note</h3>
                            <div dangerouslySetInnerHTML={{ __html: formattedAnalysis }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Expenses List */}
            <div className="card">
                <h2>History for {currentContextName}</h2>
                {expenses.length === 0 ? (
                    <p className="no-data">No expenses recorded. Tap '+' to add one!</p>
                ) : (
                    <div className="expense-list-container">
                        {Object.entries(
                            expenses.reduce((acc, expense) => {
                                const date = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                                if (!acc[date]) {
                                    acc[date] = [];
                                }
                                acc[date].push(expense);
                                return acc;
                            }, {})
                        ).map(([date, dailyExpenses]) => (
                            <div key={date}>
                                <div className="expense-group-header">{date}</div>
                                <ul className="expense-list">
                                    {dailyExpenses.map((expense, index) => (
                                        <li key={expense.id} className="expense-list-item" style={{ animationDelay: `${index * 50}ms` }}>
                                            <ExpenseCategoryIcon category={expense.category} />
                                            <div className="expense-details">
                                                <p className="expense-title">{expense.title}</p>
                                                <p className="expense-meta">
                                                    {new Date(expense.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    {expense.authorName && ` by ${expense.authorName}`}
                                                </p>
                                            </div>
                                            <div className="expense-actions">
                                                <p className="expense-amount">₹{expense.amount.toFixed(2)}</p>
                                                <button onClick={() => handleEdit(expense)} className="btn-icon btn-edit"><EditIcon /></button>
                                                <button onClick={() => handleDelete(expense.id)} className="btn-icon btn-delete"><DeleteIcon /></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
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
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const firestore = getFirestore(app);
            setDb(firestore);
            setAuth(authInstance);
            setLogLevel('debug');
            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                setUser(user);
                setView(user ? 'app' : 'welcome');
                setIsLoading(false);
            });
            return () => unsubscribe();
        } catch (e) {
            console.error("Firebase initialization failed:", e);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user || !db) return;
        const app = getAuth().app;
        const messaging = getMessaging(app);
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                const vapidKey = 'YOUR_VAPID_KEY_FROM_FIREBASE_SETTINGS'; // IMPORTANT: Replace this key
                getToken(messaging, { vapidKey: vapidKey }).then(async (currentToken) => {
                    if (currentToken) {
                        const userProfileRef = doc(db, `artifacts/${firebaseConfig.appId}/public/data/users`, user.uid);
                        await setDoc(userProfileRef, { fcmToken: currentToken }, { merge: true });
                    }
                }).catch((err) => {
                    console.log('An error occurred while retrieving token. ', err);
                });
            }
        });
        onMessage(messaging, (payload) => {
            alert(payload.notification.title + "\n" + payload.notification.body);
        });
    }, [user, db]);

    const handleNavigate = (targetView, mode = 'login') => {
        setAuthInitialMode(mode);
        setView(targetView);
    };

    if (isLoading) {
        return <div id="loading-screen"><div className="spinner"></div></div>;
    }

    const AppContent = () => {
        const [currentPage, setCurrentPage] = useState('dashboard');
        const [isNavOpen, setIsNavOpen] = useState(false);
        const [pools, setPools] = useState([]);
        const [allExpenses, setAllExpenses] = useState([]);
        const appId = "1:608681523529:web:8f3bed536feada05224298";
        const userId = user.uid;

        useEffect(() => {
            if (!db || !userId) return;
            const poolsRef = collection(db, `artifacts/${appId}/public/data/pools`);
            const qPools = query(poolsRef, where("members", "array-contains", userId));
            const unsubscribe = onSnapshot(qPools, (snapshot) => {
                setPools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            return () => unsubscribe();
        }, [db, userId, appId]);

        useEffect(() => {
            if (!db || !userId) return;
            const personalExpensesRef = collection(db, `artifacts/${appId}/users/${userId}/expenses`);
            const unsubPersonal = onSnapshot(personalExpensesRef, (snapshot) => {
                const personalData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), poolId: 'personal' }));
                setAllExpenses(prev => [...prev.filter(exp => exp.poolId !== 'personal'), ...personalData]);
            });
            const poolUnsubs = pools.map(pool => {
                const poolExpensesRef = collection(db, `artifacts/${appId}/public/data/pools/${pool.id}/expenses`);
                return onSnapshot(poolExpensesRef, (snapshot) => {
                    const poolData = snapshot.docs.map(doc => ({ id: doc.id, poolId: pool.id, ...doc.data() }));
                    setAllExpenses(prev => [...prev.filter(exp => exp.poolId !== pool.id), ...poolData]);
                });
            });
            return () => {
                unsubPersonal();
                poolUnsubs.forEach(unsub => unsub());
            };
        }, [db, userId, pools, appId]);

        let pageComponent;
        switch (currentPage) {
            case 'dashboard':
                pageComponent = <DashboardPage db={db} user={user} auth={auth} allExpenses={allExpenses} pools={pools} />;
                break;
            case 'achievements':
                pageComponent = <AchievementsPage db={db} userId={userId} />;
                break;
            case 'pools':
                pageComponent = <PoolsPage db={db} user={user} pools={pools} onPoolLeave={() => setCurrentPage('dashboard')} />;
                break;
            case 'goals':
                pageComponent = <GoalsPage db={db} user={user} allExpenses={allExpenses} />;
                break;
            case 'profile':
                pageComponent = <ProfilePage auth={auth} db={db} />;
                break;
            default:
                pageComponent = <DashboardPage db={db} user={user} auth={auth} allExpenses={allExpenses} pools={pools} />;
        }

        return (
            <div id="main-app">
                <header className="app-header">
                    <div className="header-content">
                        <button
                            className="btn-icon hamburger-btn"
                            onClick={() => setIsNavOpen(!isNavOpen)}
                            aria-label="Toggle navigation menu"
                        >
                            <MenuIcon />
                        </button>
                        <div className="logo-container">
                            <img src={Logo} alt="FinADR Logo" className="logo" />
                            <h1>FinADR</h1>
                        </div>
                        <button
                            onClick={() => signOut(auth)}
                            className="btn-icon"
                            title="Logout"
                            aria-label="Logout"
                        >
                            <LogoutIcon />
                        </button>
                    </div>
                </header>
                <nav className={`nav-drawer ${isNavOpen ? 'open' : ''}`}>
                    <div className="nav-header">
                        <div className="logo-container">
                            <img src={Logo} alt="FinADR Logo" className="logo-sm" />
                            <span className="app-name">FinADR</span>
                        </div>
                    </div>
                    <div className="nav-menu">
                        <button
                            className={currentPage === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('dashboard'); setIsNavOpen(false); }}
                        >
                            <HomeIcon />
                            <span>Dashboard</span>
                        </button>
                        <button
                            className={currentPage === 'achievements' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('achievements'); setIsNavOpen(false); }}
                        >
                            <AwardIcon />
                            <span>Achievements</span>
                        </button>
                        <button
                            className={currentPage === 'pools' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('pools'); setIsNavOpen(false); }}
                        >
                            <UsersIcon />
                            <span>Pools</span>
                        </button>
                        <button
                            className={currentPage === 'goals' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('goals'); setIsNavOpen(false); }}
                        >
                            <TargetIcon />
                            <span>Goals</span>
                        </button>
                        <button
                            className={currentPage === 'profile' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('profile'); setIsNavOpen(false); }}
                        >
                            <UserIcon />
                            <span>Profile</span>
                        </button>
                    </div>
                </nav>
                <div
                    className={`nav-overlay ${isNavOpen ? 'open' : ''}`}
                    onClick={() => setIsNavOpen(false)}
                ></div>
                <main className="container">
                    {pageComponent}
                </main>
            </div>
        );
    };

    switch (view) {
        case 'app':
            return user ? <AppContent /> : <WelcomeScreen onNavigate={handleNavigate} />;
        case 'auth':
            return <AuthScreen auth={auth} db={db} initialMode={authInitialMode} />;
        default:
            return <WelcomeScreen onNavigate={handleNavigate} />;
    }
}
