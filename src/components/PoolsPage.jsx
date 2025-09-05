import React from 'react';
import PoolsModal from './PoolsModal';

const PoolsPage = ({ db, user, pools, onPoolLeave }) => (
    <div className="page-container">
        <PoolsModal db={db} user={user} pools={pools} onPoolLeave={onPoolLeave} />
    </div>
);

export default PoolsPage;
