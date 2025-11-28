import { useEffect, useState } from "react";
import { onSnapshot, collection } from "firebase/firestore";

export default function useExpenses(db, userId, pools, appId) {
  const [allExpenses, setAllExpenses] = useState([]);

  useEffect(() => {
    if (!db || !userId) return;

    // TEMP storage to combine multiple snapshots
    let combined = [];

    // --- Listen to personal expenses ---
    const personalPath = `artifacts/${appId}/users/${userId}/expenses`;
    const unsubPersonal = onSnapshot(collection(db, personalPath), (snap) => {
      const personal = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        poolId: "personal",
      }));

      combined = [
        ...combined.filter((e) => e.poolId !== "personal"),
        ...personal,
      ];
      setAllExpenses(combined);
    });

    // --- Listen to each pool expenses ---
    const poolUnsubs = pools.map((pool) => {
      const poolPath = `artifacts/${appId}/public/data/pools/${pool.id}/expenses`;

      return onSnapshot(collection(db, poolPath), (snap) => {
        const poolExpenses = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          poolId: pool.id,
        }));

        combined = [
          ...combined.filter((e) => e.poolId !== pool.id),
          ...poolExpenses,
        ];

        setAllExpenses(combined);
      });
    });

    return () => {
      unsubPersonal();
      poolUnsubs.forEach((u) => u && u());
    };
  }, [db, userId, pools, appId]);

  return allExpenses;
}
