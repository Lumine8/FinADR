import React, { useState } from "react";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

export default function LocationModal({ db, userId, userSettings, onClose }) {
    const [city, setCity] = useState(userSettings?.location || "");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const saveLocation = async () => {
        if (!city.trim()) {
            setError("Location cannot be empty.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const userRef = doc(db, `artifacts/${appId}/public/data/users/${userId}`);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                // Create full profile document (required by your Firestore rules)
                await setDoc(userRef, {
                    userId,
                    displayName: userSettings?.displayName || "",
                    avatarUrl: userSettings?.avatarUrl || "",
                    currency: userSettings?.currency || "INR",
                    location: city.trim(),
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Update only allowed fields
                await updateDoc(userRef, {
                    location: city.trim(),
                    updatedAt: serverTimestamp(),
                });
            }

            onClose(); // close successfully
        } catch (err) {
            console.error("Location save error:", err);
            setError("Could not save location.");
        }

        setSaving(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h2>Set Your Location</h2>

                <p style={{ marginTop: "10px" }}>
                    To give you personalized tips, we need to know your city.
                </p>

                <label className="modal-label">City Name</label>
                <input
                    type="text"
                    placeholder="vellore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="modal-input"
                />

                {error && <p className="error-message">{error}</p>}

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        className="btn-primary"
                        onClick={saveLocation}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save & Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}
