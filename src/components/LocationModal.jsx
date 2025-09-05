import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import Modal from './Modal';

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

export default LocationModal;
