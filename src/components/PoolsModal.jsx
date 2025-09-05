import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, documentId, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';

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

export default PoolsModal;
