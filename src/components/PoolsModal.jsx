import React, { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    arrayUnion,
    arrayRemove,
    // getDoc,
    // setDoc,
    getDocs,
    where,
    query,
    documentId,
    deleteDoc,
} from "firebase/firestore";

import { FiUsers, FiCopy, FiLogOut, FiSend } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";

const PoolsModal = ({ db, user }) => {
    const userId = user.uid;
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const [poolName, setPoolName] = useState("");
    const [joinId, setJoinId] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [pools, setPools] = useState([]);
    const [membersMap, setMembersMap] = useState({});
    const [selectedPool, setSelectedPool] = useState(null);

    // --------------------------------------
    // Listen to user's pools
    // --------------------------------------
    useEffect(() => {
        const ref = collection(db, `artifacts/${appId}/pools`);

        const unsub = onSnapshot(ref, (snap) => {
            const allPools = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const myPools = allPools.filter((p) => p.members?.includes(userId));
            setPools(myPools);
        });

        return () => unsub();
    }, [db, userId]);

    // --------------------------------------
    // Load member names for each pool
    // --------------------------------------
    useEffect(() => {
        const loadMembers = async () => {
            if (pools.length === 0) return;

            const allIds = [...new Set(pools.flatMap((p) => p.members))];

            if (allIds.length === 0) return;

            const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
            const q = query(usersRef, where(documentId(), "in", allIds));

            const snap = await getDocs(q);

            const map = {};
            snap.forEach((d) => {
                map[d.id] = d.data();
            });

            setMembersMap(map);
        };

        loadMembers();
    }, [pools]);

    // --------------------------------------
    // Create a pool
    // --------------------------------------
    const createPool = async () => {
        if (!poolName.trim()) return setError("Enter a pool name.");

        try {
            const ref = collection(db, `artifacts/${appId}/pools`);

            await addDoc(ref, {
                name: poolName,
                ownerId: userId,
                members: [userId],
                createdAt: new Date().toISOString(),
            });

            setSuccess(`Pool "${poolName}" created!`);
            setPoolName("");
        } catch (e) {
            console.error(e);
            setError("Error creating pool.");
        }
    };

    // --------------------------------------
    // Join a pool
    // --------------------------------------
    const joinPool = async () => {
        if (!joinId.trim()) return setError("Enter a pool ID.");

        try {
            const ref = doc(db, `artifacts/${appId}/pools/${joinId.trim()}`);

            await updateDoc(ref, {
                members: arrayUnion(userId),
            });

            setSuccess("Joined pool!");
            setJoinId("");
        } catch (e) {
            console.error(e);
            setError("Invalid pool ID or permission denied.");
        }
    };

    // --------------------------------------
    // Leave pool
    // --------------------------------------
    const leavePool = async (poolId) => {
        try {
            const ref = doc(db, `artifacts/${appId}/pools/${poolId}`);

            await updateDoc(ref, {
                members: arrayRemove(userId),
            });

            setSuccess("You left the pool.");
        } catch (e) {
            console.error(e);
            setError("Could not leave pool.");
        }
    };

    // --------------------------------------
    // DELETE POOL (Owner only)
    // --------------------------------------
    const deletePool = async (poolId) => {
        try {
            const ref = doc(db, `artifacts/${appId}/pools/${poolId}`);

            await deleteDoc(ref);

            setSuccess("Pool deleted.");
            setSelectedPool(null);
        } catch (e) {
            console.error(e);
            setError("Failed to delete pool.");
        }
    };

    // --------------------------------------
    // Copy invite link
    // --------------------------------------
    const copyInvite = (poolId) => {
        const link = `${window.location.origin}/join-pool/${poolId}`;
        navigator.clipboard.writeText(link);
        setSuccess("Invite link copied!");
    };

    // --------------------------------------
    // UI
    // --------------------------------------
    return (
        <div className="card">
            <h2>Manage Expense Pools</h2>

            {/* Create Pool */}
            <div className="input-row">
                <input
                    placeholder="New Pool Name"
                    value={poolName}
                    onChange={(e) => setPoolName(e.target.value)}
                />
                <button className="btn-primary" onClick={createPool}>
                    Create
                </button>
            </div>

            {/* Join Pool */}
            <div className="input-row">
                <input
                    placeholder="Enter Pool ID"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                />
                <button className="btn-primary" onClick={joinPool}>
                    Join
                </button>
            </div>

            {error && <p className="error-message centered">{error}</p>}
            {success && <p className="success-message centered">{success}</p>}

            <h3>Your Pools</h3>

            {pools.length === 0 ? (
                <p>You haven’t joined any pools yet.</p>
            ) : (
                <ul className="pool-list">
                    {pools.map((pool) => (
                        <li key={pool.id} className="pool-card">
                            <div className="pool-header">
                                <strong>{pool.name}</strong>
                                {pool.ownerId === userId && (
                                    <MdOutlineDelete
                                        className="icon-btn delete"
                                        onClick={() => deletePool(pool.id)}
                                    />
                                )}
                            </div>

                            <p className="pool-id">
                                ID: {pool.id}{" "}
                                <FiCopy className="icon-btn" onClick={() => copyInvite(pool.id)} />
                            </p>

                            <div className="member-row">
                                <FiUsers /> {pool.members.length} members
                            </div>

                            <button className="btn-secondary" onClick={() => setSelectedPool(pool)}>
                                View Details
                            </button>

                            <button className="btn-danger" onClick={() => leavePool(pool.id)}>
                                <FiLogOut /> Leave
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Pool Details Modal */}
            {selectedPool && (
                <div className="modal-overlay" onClick={() => setSelectedPool(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>{selectedPool.name}</h2>

                        <h3>Members:</h3>
                        <ul>
                            {selectedPool.members.map((uid) => (
                                <li key={uid}>
                                    {membersMap[uid]?.displayName || "Unknown User"}
                                </li>
                            ))}
                        </ul>

                        {selectedPool.ownerId === userId && (
                            <button
                                className="btn-danger"
                                onClick={() => deletePool(selectedPool.id)}
                            >
                                Delete Pool
                            </button>
                        )}

                        <button className="btn-primary" onClick={() => copyInvite(selectedPool.id)}>
                            <FiSend /> Copy Invite Link
                        </button>

                        <button className="btn-secondary" onClick={() => setSelectedPool(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoolsModal;
