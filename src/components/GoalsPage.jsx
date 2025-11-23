import React, { useState, useEffect, useMemo } from 'react';
import { doc, setDoc, onSnapshot, writeBatch, collection, getDocs } from 'firebase/firestore';
import { IconComponents } from './IconComponents';
import AdBanner from './AdBanner';

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
                            <IconComponents.TrophyIcon />
                            <p>Congratulations! You've met your savings goal for the month!</p>
                        </div>
                    )}
                </div>
            </div>
            <AdBanner />
        </div>
    );
};

export default GoalsPage;
