import React from 'react';
import PoolsModal from './PoolsModal';
import AdBanner from './AdBanner';

const PoolsPage = ({ db, user, pools, onPoolLeave }) => (
    <div className="page-container">
        <PoolsModal db={db} user={user} pools={pools} onPoolLeave={onPoolLeave} />
        <AdBanner />
    </div>
);

export default PoolsPage;
