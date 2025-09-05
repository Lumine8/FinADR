import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { FaTrophy } from "react-icons/fa";

const ProfilePage = ({ auth, db }) => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const appId = "1:608681523529:web:8f3bed536feada05224298";
    const [newUsername, setNewUsername] = useState(auth.currentUser.displayName || "");
    const [achievements, setAchievements] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [stats, setStats] = useState({
        totalMonth: 0,
        biggestCategory: "None",
        goalProgress: 0,
    });

    // Fetch Achievements
    useEffect(() => {
        const achievementsRef = collection(db, `artifacts/${appId}/public/data/users/${auth.currentUser.uid}/achievements`);
        const unsubscribe = onSnapshot(achievementsRef, (snapshot) => {
            setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [auth.currentUser.uid, db, appId]);

    // Fetch ALL Expenses from all pools
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

    // Compute Quick Stats from ALL expenses
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

    // Handle Username Save
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

    // Profile Tagline Component
    const ProfileTagline = () => {
        const [quote, setQuote] = useState("🚀 Building better money habits");
        const localQuotes = [
            "An investment in knowledge pays the best interest. — Benjamin Franklin",
            "Do not save what is left after spending, but spend what is left after saving. — Warren Buffett",
            "The best time to plant a tree was 20 years ago. The second-best time is now. — Chinese Proverb",
            "Beware of little expenses. A small leak will sink a great ship. — Benjamin Franklin",
            "Financial freedom is freedom from fear. — Robert Kiyosaki",
            "A budget is telling your money where to go instead of wondering where it went. — Dave Ramsey",
            "It's not your salary that makes you rich, it's your spending habits. — Charles A. Jaffe",
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

export default ProfilePage;
