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

  // ⭐ Updated Icons – now functions so we can apply dynamic colors
  const ALL_BADGES = {
    "joined-the-club": {
      name: "Joined the Club",
      description: "Welcome! You've officially started your financial journey.",
      icon: (color) => <FaUserAstronaut className="text-3xl" style={{ color }} />,
    },
    "first-drop": {
      name: "First Drop",
      description: "You've logged your first expense. The journey begins!",
      icon: (color) => <GiWaterDrop className="text-3xl" style={{ color }} />,
    },
    "pool-pioneer": {
      name: "Pool Pioneer",
      description: "You started your first expense pool!",
      icon: (color) => <GiTreasureMap className="text-3xl" style={{ color }} />,
    },
    "team-player": {
      name: "Team Player",
      description: "You joined an expense pool.",
      icon: (color) => <BsPeopleFill className="text-3xl" style={{ color }} />,
    },
    "goal-smasher": {
      name: "Goal Smasher",
      description: "Met a monthly savings goal!",
      icon: (color) => <TbTargetArrow className="text-3xl" style={{ color }} />,
    },
    "overachiever": {
      name: "Overachiever",
      description: "Hit 2x your savings goal.",
      icon: (color) => <BsTrophy className="text-3xl" style={{ color }} />,
    },
    "barely-made-it": {
      name: "Barely Made It",
      description: "Hit your savings goal by a hair.",
      icon: (color) => <IoFlash className="text-3xl" style={{ color }} />,
    },
    "budget-pro": {
      name: "Budget Pro",
      description: "Stayed under budget for every category!",
      icon: (color) => <MdOutlineSavings className="text-3xl" style={{ color }} />,
    },
    "caffeine-survivor": {
      name: "Caffeine Survivor",
      description: "Spent a lot on coffee.",
      icon: (color) => <FaCoffee className="text-3xl" style={{ color }} />,
    },
    "early-bird": {
      name: "Early Bird",
      description: "Logged an expense before 8 AM.",
      icon: (color) => <GiAlarmClock className="text-3xl" style={{ color }} />,
    },
    "foodie": {
      name: "Foodie",
      description: "More than 50% spent on food.",
      icon: (color) => <FaPizzaSlice className="text-3xl" style={{ color }} />,
    },
    "celebrator": {
      name: "Celebrator",
      description: "Unlocked 5 achievements!",
      icon: (color) => <GiPartyPopper className="text-3xl" style={{ color }} />,
    },
    "consistent-saver": {
      name: "Consistent Saver",
      description: "Saved every month for 6 months.",
      icon: (color) => <FaPiggyBank className="text-3xl" style={{ color }} />,
    },
    "certified-pro": {
      name: "Certified Pro",
      description: "Unlocked all achievements!",
      icon: (color) => <MdCheckCircle className="text-3xl" style={{ color }} />,
    },
  };

  // Listen for unlocked achievements
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
  }, [db, userId]);

  // Filtering logic
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
      <p style={{ fontSize: '10px', textAlign: "center" }}>
        {"{ Achievements page under construction }"}
      </p>

      <div className="card">
        <h2>All Achievements</h2>
        <p className="subtitle">Track your progress and unlock all badges!</p>

        {/* Filter Buttons */}
        <div className="filter-toggle">
          <button className={`toggle-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}>All</button>

          <button className={`toggle-btn ${filter === 'unlocked' ? 'active' : ''}`}
            onClick={() => setFilter('unlocked')}>Unlocked</button>

          <button className={`toggle-btn ${filter === 'locked' ? 'active' : ''}`}
            onClick={() => setFilter('locked')}>Locked</button>
        </div>

        {/* Badges Grid */}
        <div className="achievements-grid full-page">
          {filteredBadges.map(([id, badge]) => {
            const isUnlocked = unlockedAchievements.includes(id);
            const color = isUnlocked ? "#22c55e" : "#9ca3af"; // green or grey

            return (
              <div
                key={id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                title={`${badge.name}: ${badge.description}`}
                style={{
                  opacity: isUnlocked ? 1 : 0.5,
                  border: isUnlocked ? "2px solid #22c55e" : "1px solid #ccc",
                }}
              >
                <div className="achievement-icon">
                  {badge.icon(color)}
                </div>

                <p className="achievement-name">
                  {badge.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
