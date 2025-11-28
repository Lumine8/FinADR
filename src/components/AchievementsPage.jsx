import React, { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import {
  FaUserAstronaut,
  FaPiggyBank,
  FaCoffee,
  FaPizzaSlice,
} from "react-icons/fa";

import {
  GiWaterDrop,
  GiTreasureMap,
  GiPartyPopper,
  GiAlarmClock,
} from "react-icons/gi";

import { MdOutlineSavings, MdCheckCircle } from "react-icons/md";
import { BsTrophy, BsPeopleFill } from "react-icons/bs";
import { TbTargetArrow } from "react-icons/tb";
import { IoFlash } from "react-icons/io5";

const AchievementsPage = ({ db, userId }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [filter, setFilter] = useState("all");
  const appId = "1:608681523529:web:8f3bed536feada05224298";

  // -------------------------------------------------------
  // BADGES (static)
  // -------------------------------------------------------
  const ALL_BADGES = useMemo(
    () => ({
      "joined-the-club": {
        name: "Joined the Club",
        description: "Started your financial journey.",
        icon: (c) => <FaUserAstronaut style={{ color: c }} className="text-3xl" />,
      },
      "first-drop": {
        name: "First Drop",
        description: "Logged your first expense.",
        icon: (c) => <GiWaterDrop style={{ color: c }} className="text-3xl" />,
      },
      "pool-pioneer": {
        name: "Pool Pioneer",
        description: "Created your first expense pool.",
        icon: (c) => <GiTreasureMap style={{ color: c }} className="text-3xl" />,
      },
      "team-player": {
        name: "Team Player",
        description: "Joined an expense pool.",
        icon: (c) => <BsPeopleFill style={{ color: c }} className="text-3xl" />,
      },
      "goal-smasher": {
        name: "Goal Smasher",
        description: "Met a monthly savings goal!",
        icon: (c) => <TbTargetArrow style={{ color: c }} className="text-3xl" />,
      },
      "overachiever": {
        name: "Overachiever",
        description: "Hit 2x your savings goal.",
        icon: (c) => <BsTrophy style={{ color: c }} className="text-3xl" />,
      },
      "barely-made-it": {
        name: "Barely Made It",
        description: "Reached your goal just in time.",
        icon: (c) => <IoFlash style={{ color: c }} className="text-3xl" />,
      },
      "budget-pro": {
        name: "Budget Pro",
        description: "Stayed under budget in all categories.",
        icon: (c) => <MdOutlineSavings style={{ color: c }} className="text-3xl" />,
      },
      "caffeine-survivor": {
        name: "Caffeine Survivor",
        description: "Spent a lot on coffee.",
        icon: (c) => <FaCoffee style={{ color: c }} className="text-3xl" />,
      },
      "early-bird": {
        name: "Early Bird",
        description: "Logged an expense before 8 AM.",
        icon: (c) => <GiAlarmClock style={{ color: c }} className="text-3xl" />,
      },
      "foodie": {
        name: "Foodie",
        description: "50%+ of spending on food.",
        icon: (c) => <FaPizzaSlice style={{ color: c }} className="text-3xl" />,
      },
      "celebrator": {
        name: "Celebrator",
        description: "Unlocked 5 achievements!",
        icon: (c) => <GiPartyPopper style={{ color: c }} className="text-3xl" />,
      },
      "consistent-saver": {
        name: "Consistent Saver",
        description: "Saved every month for 6 months.",
        icon: (c) => <FaPiggyBank style={{ color: c }} className="text-3xl" />,
      },
      "certified-pro": {
        name: "Certified Pro",
        description: "Unlocked all achievements!",
        icon: (c) => <MdCheckCircle style={{ color: c }} className="text-3xl" />,
      },
    }),
    []
  );

  // -------------------------------------------------------
  // Fetch achievements (live)
  // -------------------------------------------------------
  useEffect(() => {
    if (!db || !userId) return;

    const ref = collection(
      db,
      `artifacts/${appId}/public/data/users/${userId}/achievements`
    );

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.id); // <-- EXACT ID, no stripping
      setUnlockedAchievements(ids);
    });

    return () => unsubscribe();
  }, [db, userId, appId]);

  // -------------------------------------------------------
  // Filtering
  // -------------------------------------------------------
  const filteredBadges = useMemo(() => {
    return Object.entries(ALL_BADGES).filter(([id]) => {
      const unlocked = unlockedAchievements.includes(id);
      if (filter === "unlocked") return unlocked;
      if (filter === "locked") return !unlocked;
      return true;
    });
  }, [ALL_BADGES, filter, unlockedAchievements]);

  // -------------------------------------------------------
  // Progress Calculation
  // -------------------------------------------------------
  const total = Object.keys(ALL_BADGES).length;
  const unlockedCount = unlockedAchievements.length;
  const progress = Math.round((unlockedCount / total) * 100);

  return (
    <div className="page-container">
      <div className="card">
        <h2>Achievements</h2>
        <p className="subtitle">Your financial journey progress</p>

        {/* Progress Bar */}
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-label">
            {unlockedCount} / {total} unlocked ({progress}%)
          </p>
        </div>

        {/* Filters */}
        <div className="filter-toggle">
          {["all", "unlocked", "locked"].map((f) => (
            <button
              key={f}
              className={`toggle-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Badge Grid */}
        <div className="achievements-grid full-page">
          {filteredBadges.map(([id, badge]) => {
            const isUnlocked = unlockedAchievements.includes(id);
            const color = isUnlocked ? "#22c55e" : "#9ca3af";

            return (
              <div
                key={id}
                className={`achievement-card ${isUnlocked ? "unlocked" : "locked"}`}
                title={`${badge.name} – ${badge.description}`}
                style={{
                  opacity: isUnlocked ? 1 : 0.45,
                  border: isUnlocked ? "2px solid #22c55e" : "1px solid #ccc",
                  transform: isUnlocked ? "scale(1.05)" : "scale(1)",
                  transition: "0.2s ease",
                }}
              >
                <div className="achievement-icon">{badge.icon(color)}</div>
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
