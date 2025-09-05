import React, { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, documentId, writeBatch, setDoc, getDoc } from 'firebase/firestore';
import { IconComponents } from './IconComponents';
import BudgetModal from './BudgetModal';
import LocationModal from './LocationModal';
import SpendingChart from './SpendingChart';
import { FaHamburger, FaCar, FaShoppingBag, FaFileInvoiceDollar, FaFilm, FaEllipsisH } from "react-icons/fa";
import { onSnapshot } from 'firebase/firestore';

// ExpenseCategoryIcon Helper Component
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

const DashboardPage = ({ db, user, allExpenses, pools, categories }) => {
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
    const CATEGORIES = categories || ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

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
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
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

        This month's expenses (${filterMonth}): 
        ${JSON.stringify(expenses.map(e => ({ title: e.title, amount: e.amount, category: e.category })))}

        Previous month's expenses (${prevMonth}): 
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
                <button onClick={toggleForm} className="btn-add-expense"><IconComponents.PlusIcon /></button>
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
                                {isSuggesting ? '...' : <><IconComponents.SparklesIcon /> Suggest</>}
                            </button>
                        </div>
                        <input type="number" placeholder={isSplitting ? "Total Amount to Split" : "Amount"} value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
                        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                        {currentPoolId !== 'personal' && !editingId && (
                            <button type="button" onClick={() => setIsSplitting(!isSplitting)} className={`btn-secondary full-width btn-with-icon ${isSplitting ? 'active' : ''}`}>
                                <IconComponents.SplitIcon /> {isSplitting ? 'Cancel Split' : 'Split Bill'}
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
                    <button onClick={() => setShowBudgetModal(true)} className="btn-secondary full-width btn-with-icon"><IconComponents.TargetIcon /> Set Budgets</button>
                </div>

                {/* AI Coaching Section */}
                <div className="ai-section">
                    <button onClick={handleGetAnalysis} disabled={isAnalyzing} className="btn-primary full-width btn-with-icon">
                        <IconComponents.SparklesIcon /> {isAnalyzing ? 'Analyzing...' : 'Get Personal Coaching'}
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
                                                <button onClick={() => handleEdit(expense)} className="btn-icon btn-edit"><IconComponents.EditIcon /></button>
                                                <button onClick={() => handleDelete(expense.id)} className="btn-icon btn-delete"><IconComponents.DeleteIcon /></button>
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

export default DashboardPage;
