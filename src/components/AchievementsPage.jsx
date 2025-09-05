import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { FaUserAstronaut, FaPiggyBank, FaCoffee, FaPizzaSlice } from "react-icons/fa";
import { GiWaterDrop, GiTreasureMap, GiPartyPopper, GiAlarmClock } from "react-icons/gi";
import { MdOutlineSavings, MdCheckCircle } from "react-icons/md";
import { BsTrophy, BsPeopleFill } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import { IoFlash } from "react-icons/io5";

const AchievementsPage = ({ db, userId }) => {
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [filter, setFilter] = useState('all');
    const appId = "1:608681523529:web:8f3bed536feada05224298";

    const ALL_BADGES = {
      "joined-the-club": {
        name: "Joined the Club",
        description: "Welcome! You've officially started your financial journey.",
        icon: <FaUserAstronaut className="text-purple-500 text-3xl" />,
      },
      "first-drop": {
        name: "First Drop",
        description: "You've logged your first expense. The journey begins!",
        icon: <GiWaterDrop className="text-blue-400 text-3xl" />,
      },
      "pool-pioneer": {
        name: "Pool Pioneer",
        description: "You started your first expense pool! Collaboration is key.",
        icon: <GiTreasureMap className="text-yellow-600 text-3xl" />,
      },
      "team-player": {
        name: "Team Player",
        description: "You joined an expense pool. Better together!",
        icon: <BsPeopleFill className="text-green-500 text-3xl" />,
      },
      "goal-smasher": {
        name: "Goal Smasher",
        description: "Met a monthly savings goal!",
        icon: <TbTargetArrow className="text-red-500 text-3xl" />,
      },
      "overachiever": {
        name: "Overachiever",
        description: "Hit 2x your savings goal. Flex much?",
        icon: <BsTrophy className="text-yellow-500 text-3xl" />,
      },
      "barely-made-it": {
        name: "Barely Made It",
        description: "Hit your savings goal by a hair. Lucky...",
        icon: <IoFlash className="text-orange-400 text-3xl" />,
      },
      "budget-pro": {
        name: "Budget Pro",
        description: "Stayed under budget for every category!",
        icon: <MdOutlineSavings className="text-teal-500 text-3xl" />,
      },
      "caffeine-survivor": {
        name: "Caffeine Survivor",
        description: "Spent a *lot* on coffee. You okay?",
        icon: <FaCoffee className="text-brown-600 text-3xl" />,
      },
      "early-bird": {
        name: "Early Bird",
        description: "Logged an expense before 8 AM.",
        icon: <GiAlarmClock className="text-indigo-500 text-3xl" />,
      },
      "foodie": {
        name: "Foodie",
        description: "More than 50% of your budget was for food. Respect.",
        icon: <FaPizzaSlice className="text-pink-500 text-3xl" />,
      },
      "celebrator": {
        name: "Celebrator",
        description: "Unlocked 5 achievements. Keep going!",
        icon: <GiPartyPopper className="text-fuchsia-500 text-3xl" />,
      },
      "consistent-saver": {
        name: "Consistent Saver",
        description: "Saved every month for 6 months straight.",
        icon: <FaPiggyBank className="text-emerald-500 text-3xl" />,
      },
      "certified-pro": {
        name: "Certified Pro",
        description: "Unlocked all achievements. You legend!",
        icon: <MdCheckCircle className="text-lime-600 text-3xl" />,
      },
    };
    
    useEffect(() => {
        if (!db || !userId) return;
        const achievementsRef = collection(db, `artifacts/${appId}/public/data/users/${userId}/achievements`);
        const q = query(achievementsRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const unlockedIds = snapshot.docs.map(doc => {
                const baseId = doc.id.includes('-') ? doc.id.split('-').slice(0, -1).join('-') : doc.id;
                return baseId;
            });
            setUnlockedAchievements(unlockedIds);
        });
        return () => unsubscribe();
    }, [db, userId, appId]);

    const filteredBadges = useMemo(() => {
        return Object.entries(ALL_BADGES).filter(([id]) => {
            const isUnlocked = unlockedAchievements.includes(id);
            if (filter === 'unlocked') return isUnlocked;
            if (filter === 'locked') return !isUnlocked;
            return true;
        });
    }, [ALL_BADGES, unlockedAchievements, filter]);

    return (
        <div className="page-container">
          <p style={{fontSize:'10px', textAlign:"center"}}>{"{Achievements-page under construction}"}</p>
            <div className="card">

                <h2>All Achievements</h2>
                <p className="subtitle">Track your progress and unlock all the badges!</p>
                
                <div className="filter-toggle">
                    <button className={`toggle-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                    <button className={`toggle-btn ${filter === 'unlocked' ? 'active' : ''}`} onClick={() => setFilter('unlocked')}>Unlocked</button>
                    <button className={`toggle-btn ${filter === 'locked' ? 'active' : ''}`} onClick={() => setFilter('locked')}>Locked</button>
                </div>

                <div className="achievements-grid full-page">
                    {filteredBadges.map(([id, badge]) => {
                        const isUnlocked = unlockedAchievements.includes(id);
                        return (
                            <div key={id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`} title={`${badge.name}: ${badge.description}`}>
                                <div className="achievement-icon">{badge.icon}</div>
                                <p className="achievement-name">{badge.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AchievementsPage;
