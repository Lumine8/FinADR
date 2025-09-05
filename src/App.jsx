import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut} from 'firebase/auth';
import { 
    getFirestore, collection, onSnapshot, query, doc, 
    setLogLevel, where, setDoc} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Import components (create separate files for these)
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import DashboardPage from './components/DashboardPage';
import AchievementsPage from './components/AchievementsPage';
import PoolsPage from './components/PoolsPage';
import GoalsPage from './components/GoalsPage';
import ProfilePage from './components/ProfilePage';
import { IconComponents } from './components/IconComponents';

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

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

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
                pageComponent = <DashboardPage db={db} user={user} auth={auth} allExpenses={allExpenses} pools={pools} categories={CATEGORIES} />;
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
                pageComponent = <DashboardPage db={db} user={user} auth={auth} allExpenses={allExpenses} pools={pools} categories={CATEGORIES} />;
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
                            <IconComponents.MenuIcon />
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
                            <IconComponents.LogoutIcon />
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
                            <IconComponents.HomeIcon />
                            <span>Dashboard</span>
                        </button>
                        <button
                            className={currentPage === 'achievements' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('achievements'); setIsNavOpen(false); }}
                        >
                            <IconComponents.AwardIcon />
                            <span>Achievements</span>
                        </button>
                        <button
                            className={currentPage === 'pools' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('pools'); setIsNavOpen(false); }}
                        >
                            <IconComponents.UsersIcon />
                            <span>Pools</span>
                        </button>
                        <button
                            className={currentPage === 'goals' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('goals'); setIsNavOpen(false); }}
                        >
                            <IconComponents.TargetIcon />
                            <span>Goals</span>
                        </button>
                        <button
                            className={currentPage === 'profile' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => { setCurrentPage('profile'); setIsNavOpen(false); }}
                        >
                            <IconComponents.UserIcon />
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
