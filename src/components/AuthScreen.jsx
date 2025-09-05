import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import Logo from '../assets/logo.png';

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

export default AuthScreen;
