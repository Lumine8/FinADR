import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import Modal from './Modal';

const BudgetModal = ({ db, userId, userSettings, onClose }) => {
    const [budgets, setBudgets] = useState(userSettings.budgets || {});
    const [success, setSuccess] = useState('');
    const appId = "1:608681523529:web:8f3bed536feada05224298";
    const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

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

export default BudgetModal;
