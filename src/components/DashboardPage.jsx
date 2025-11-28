// ===============================
// DASHBOARD PAGE — PART 1 / 2
// ===============================

import React, { useState, useMemo } from "react";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";

import { marked } from "marked";

import { IconComponents } from "./IconComponents";
import BudgetModal from "./BudgetModal";
import LocationModal from "./LocationModal";
import SpendingChart from "./SpendingChart";

import {
    FaHamburger,
    FaCar,
    FaShoppingBag,
    FaFileInvoiceDollar,
    FaFilm,
    FaEllipsisH,
} from "react-icons/fa";

import useAI from "../hooks/useAI";
import useExpenses from "../hooks/useExpenses";
import usePoolMembers from "../hooks/usePoolMembers";
import useUserSettings from "../hooks/useUserSettings";

// ----------------------------------------
// CATEGORY ICON
// ----------------------------------------
const CATEGORY_STYLE = {
    Food: { icon: <FaHamburger />, color: "#f97316" },
    Transport: { icon: <FaCar />, color: "#3b82f6" },
    Shopping: { icon: <FaShoppingBag />, color: "#8b5cf6" },
    Bills: { icon: <FaFileInvoiceDollar />, color: "#ef4444" },
    Entertainment: { icon: <FaFilm />, color: "#14b8a6" },
    Other: { icon: <FaEllipsisH />, color: "#71717a" },
};

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function CategoryIcon({ category }) {
    const c = CATEGORY_STYLE[category] || CATEGORY_STYLE.Other;
    return (
        <div
            style={{
                backgroundColor: hexToRgba(c.color, 0.12),
                color: c.color,
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
            }}
        >
            {c.icon}
        </div>
    );
}

// ===========================================================
// MAIN DASHBOARD PAGE
// ===========================================================
export default function DashboardPage({ db, user, pools }) {
    const appId = "1:608681523529:web:8f3bed536feada05224298";
    const userId = user.uid;

    // -------------------------
    // HOOKS
    // -------------------------
    const allExpenses = useExpenses(db, userId, pools, appId);
    const userSettings = useUserSettings(db, appId, userId);

    const [currentPoolId, setCurrentPoolId] = useState("personal");
    const poolMembers = usePoolMembers(db, appId, pools, currentPoolId);

    const {
        analysis,
        analysisError,
        isAnalyzing,

        suggestCategory,
        analyzeSpending,
        explainPurchase,

        explanation,
        isExplaining,
        setExplanation,
        setIsExplaining,
    } = useAI();



    // -------------------------
    // FORM STATE
    // -------------------------
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    // const [explanation, setExplanation] = useState("");
    // const [isExplaining, setIsExplaining] = useState(false);

    const [filterMonth, setFilterMonth] = useState(
        new Date().toISOString().slice(0, 7)
    );

    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);

    // SPLIT state
    const [splitEnabled, setSplitEnabled] = useState(false);
    const [splitMembers, setSplitMembers] = useState([]);

    // ----------------------------------------
    // NORMALIZE DATE
    // ----------------------------------------
    function norm(exp) {
        return exp.createdAt?.toDate
            ? exp.createdAt.toDate().toISOString()
            : "";
    }

    // ----------------------------------------
    // FILTER EXPENSES
    // ----------------------------------------
    const expenses = useMemo(() => {
        return allExpenses
            .filter((e) => (e.poolId || "personal") === currentPoolId)
            .map((e) => ({ ...e, _norm: norm(e) }))
            .filter((e) => e._norm.startsWith(filterMonth));
    }, [allExpenses, currentPoolId, filterMonth]);

    // ----------------------------------------
    // SUMMARY CALCULATIONS
    // ----------------------------------------
    const totalExpenses = useMemo(
        () => expenses.reduce((s, e) => s + e.amount, 0),
        [expenses]
    );

    const expensesByCategory = useMemo(() => {
        const map = {};
        for (const e of expenses) map[e.category] = (map[e.category] || 0) + e.amount;
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [expenses]);

    const poolName =
        currentPoolId === "personal"
            ? "Personal Expenses"
            : pools.find((p) => p.id === currentPoolId)?.name || "Pool";

    // ===================================================================
    // RETURN — UI (CONTINUES IN PART 2)
    // ===================================================================
    return (
        <>
            {/* --- Part 2 will continue UI rendering here --- */}

            <div className="card context-switcher">
                <div className="filter-group">
                    <label>Viewing Month:</label>
                    <input
                        type="month"
                        value={filterMonth}
                        max={new Date().toISOString().slice(0, 7)}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Viewing For:</label>
                    <select
                        value={currentPoolId}
                        onChange={(e) => setCurrentPoolId(e.target.value)}
                    >
                        <option value="personal">My Personal Expenses</option>
                        {pools.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {/* ============================================
          ADD EXPENSE BUTTON
      ============================================ */}
            <div id="add-expense-btn-container">
                <button
                    onClick={() => {
                        setEditingId(null);
                        setExplanation("");
                        setShowForm(true);
                        setSplitEnabled(false);
                        setSplitMembers([userId]);
                    }}
                    className="btn-add-expense"
                >
                    <IconComponents.PlusIcon />
                </button>
            </div>

            {/* ============================================
          EXPENSE FORM
      ============================================ */}
            {
                showForm && (
                    <div className="card form-card">
                        <h2>{editingId ? "Edit Expense" : "Add New Expense"} — {poolName}</h2>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const amt = parseFloat(amount);

                                if (!title.trim() || isNaN(amt) || amt <= 0) {
                                    setError("Enter valid details.");
                                    return;
                                }

                                const base = {
                                    title: title.trim(),
                                    amount: amt,
                                    category,
                                    createdAt: serverTimestamp(),
                                };

                                const path =
                                    currentPoolId === "personal"
                                        ? `artifacts/${appId}/users/${userId}/expenses`
                                        : `artifacts/${appId}/public/data/pools/${currentPoolId}/expenses`;

                                // PERSONAL
                                if (currentPoolId === "personal") {
                                    base.ownerId = userId;
                                }

                                // POOL
                                if (currentPoolId !== "personal") {
                                    base.authorId = userId;
                                    if (splitEnabled) {
                                        base.splitMembers = splitMembers;
                                    }
                                }

                                try {
                                    if (editingId) {
                                        await updateDoc(doc(db, path, editingId), base);
                                    } else {
                                        await addDoc(collection(db, path), base);
                                    }
                                } catch (err) {
                                    console.log("Expense save error:", err);
                                    setError("Could not save expense.");
                                }

                                // RESET
                                setTitle("");
                                setAmount("");
                                setCategory("Food");
                                setEditingId(null);
                                setShowForm(false);
                                setExplanation("");
                                setError("");
                            }}
                        >
                            {/* TITLE */}
                            <input
                                type="text"
                                placeholder="Expense Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            {/* CATEGORY + AI */}
                            <div className="input-group">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {Object.keys(CATEGORY_STYLE).map((c) => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    className="btn-suggest"
                                    onClick={async () => {
                                        const raw = await suggestCategory(title);
                                        if (!raw) return;

                                        // Normalized mapping to your categories
                                        const cleaned = raw.trim().toLowerCase();

                                        const match = Object.keys(CATEGORY_STYLE).find(
                                            (x) => x.toLowerCase() === cleaned
                                        );

                                        if (match) {
                                            setCategory(match);
                                            setExplanation(`Suggested category: ${match}`);
                                        } else {
                                            setExplanation("AI could not determine a valid category.");
                                        }
                                    }}
                                    disabled={!title}
                                >
                                    <IconComponents.SparklesIcon /> Suggest
                                </button>


                                <button
                                    type="button"
                                    className="btn-suggest"
                                    onClick={async () => {
                                        setIsExplaining(true);
                                        const res = await explainPurchase(title);
                                        setExplanation(res);
                                        setIsExplaining(false);
                                    }}
                                    disabled={!title || isExplaining}
                                >
                                    {isExplaining ? "..." : "Why?"}
                                </button>

                            </div>

                            {explanation && (
                                <div
                                    className="ai-explanation prose"
                                    style={{ whiteSpace: "normal" }}
                                    dangerouslySetInnerHTML={{
                                        __html: marked.parse(explanation),
                                    }}
                                />
                            )}


                            {/* AMOUNT */}
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />

                            {error && <p className="error-message centered">{error}</p>}

                            {/* SPLIT (ONLY FOR POOLS) */}
                            {currentPoolId !== "personal" && (
                                <div className="card" style={{ marginTop: 12 }}>
                                    <label style={{ display: "flex", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={splitEnabled}
                                            onChange={(e) => {
                                                setSplitEnabled(e.target.checked);
                                                if (e.target.checked && splitMembers.length === 0) {
                                                    setSplitMembers([userId]);
                                                }
                                            }}
                                        />
                                        <span style={{ marginLeft: 8 }}>Split this bill</span>
                                    </label>

                                    {splitEnabled && (
                                        <div style={{ marginTop: 10 }}>
                                            <p><strong>Members included:</strong></p>
                                            {poolMembers.map((m) => (
                                                <label
                                                    key={m.id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        marginLeft: 10,
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={splitMembers.includes(m.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSplitMembers((p) => [...p, m.id]);
                                                            } else {
                                                                setSplitMembers((p) =>
                                                                    p.filter((x) => x !== m.id)
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <span style={{ marginLeft: 6 }}>
                                                        {m.displayName || m.email}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ACTION BUTTONS */}
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setError("");
                                        setExplanation("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="btn-primary">
                                    {editingId ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                )
            }

            {/* ============================================
          SUMMARY CARD
      ============================================ */}
            <div className="card">
                <h2>
                    Summary — {poolName} (
                    {new Date(filterMonth).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                    })}
                    )
                </h2>

                <div className="summary-content">
                    <div className="summary-total">
                        <span>Total Expenses:</span>
                        <span>₹{totalExpenses.toFixed(2)}</span>
                    </div>

                    <hr />

                    <h3>By Category</h3>

                    <SpendingChart data={expensesByCategory} />

                    {expensesByCategory.length > 0 ? (
                        <ul>
                            {expensesByCategory.map(([cat, total]) => (
                                <li key={cat}>
                                    <span>{cat}</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-data">No expenses yet.</p>
                    )}

                    <button
                        className="btn-secondary full-width btn-with-icon"
                        onClick={() => setShowBudgetModal(true)}
                    >
                        <IconComponents.TargetIcon /> Set Budgets
                    </button>
                </div>

                {/* AI COACH */}
                <div className="ai-section">
                    <button
                        className="btn-primary full-width btn-with-icon"
                        disabled={isAnalyzing}
                        onClick={() => {
                            if (!userSettings.location) {
                                setShowLocationModal(true);
                                return;
                            }

                            const prevMonth = new Date(
                                filterMonth + "-01T00:00:00"
                            );
                            prevMonth.setMonth(prevMonth.getMonth() - 1);

                            const prevFilter = prevMonth.toISOString().slice(0, 7);

                            const lastMonth = allExpenses
                                .map((e) => ({ ...e, _norm: norm(e) }))
                                .filter(
                                    (e) =>
                                        (e.poolId || "personal") === currentPoolId &&
                                        e._norm.startsWith(prevFilter)
                                );

                            analyzeSpending(
                                expenses,
                                lastMonth,
                                userSettings,
                                { name: user.displayName || "User" }
                            );
                        }}
                    >
                        <IconComponents.SparklesIcon />
                        {isAnalyzing ? "Analyzing..." : "Get Coaching"}
                    </button>

                    {analysisError && (
                        <p className="error-message">{analysisError}</p>
                    )}

                    {analysis && (
                        <div className="prose">
                            <h3>Your Coaching Note</h3>
                            <div
                                dangerouslySetInnerHTML={{ __html: marked(analysis) }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ============================================
          HISTORY LIST
      ============================================ */}
            <div className="card">
                <h2>History — {poolName}</h2>

                {expenses.length === 0 ? (
                    <p className="no-data">No expenses yet.</p>
                ) : (
                    <div className="expense-list-container">
                        {Object.entries(
                            expenses.reduce((acc, e) => {
                                const dateLabel = new Date(e._norm).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                );
                                (acc[dateLabel] = acc[dateLabel] || []).push(e);
                                return acc;
                            }, {})
                        ).map(([day, list]) => (
                            <div key={day}>
                                <div className="expense-group-header">{day}</div>
                                <ul className="expense-list">
                                    {list.map((exp, i) => (
                                        <li
                                            key={exp.id}
                                            className="expense-list-item"
                                            style={{ animationDelay: `${i * 40}ms` }}
                                        >
                                            <CategoryIcon category={exp.category} />

                                            <div className="expense-details">
                                                <p className="expense-title">{exp.title}</p>
                                                <p className="expense-meta">
                                                    {new Date(exp._norm).toLocaleTimeString(
                                                        "en-US",
                                                        {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </p>
                                            </div>

                                            <div className="expense-actions">
                                                <p className="expense-amount">
                                                    ₹{exp.amount.toFixed(2)}
                                                </p>

                                                <button
                                                    className="btn-icon btn-edit"
                                                    onClick={() => {
                                                        setEditingId(exp.id);
                                                        setTitle(exp.title);
                                                        setAmount(exp.amount);
                                                        setCategory(exp.category);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    <IconComponents.EditIcon />
                                                </button>

                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={async () => {
                                                        const delPath =
                                                            exp.poolId === "personal"
                                                                ? `artifacts/${appId}/users/${userId}/expenses/${exp.id}`
                                                                : `artifacts/${appId}/public/data/pools/${exp.poolId}/expenses/${exp.id}`;

                                                        await deleteDoc(doc(db, delPath));
                                                    }}
                                                >
                                                    <IconComponents.DeleteIcon />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ====================== MODALS ====================== */}
            {
                showBudgetModal && (
                    <BudgetModal
                        db={db}
                        userId={userId}
                        userSettings={userSettings}
                        onClose={() => setShowBudgetModal(false)}
                    />
                )
            }

            {
                showLocationModal && (
                    <LocationModal
                        db={db}
                        userId={userId}
                        onClose={() => setShowLocationModal(false)}
                    />
                )
            }
        </>
    );
}
