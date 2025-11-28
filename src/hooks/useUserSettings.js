import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

export default function useUserSettings(db, appId, userId) {
  const [userSettings, setUserSettings] = useState({
    location: "",
    budgets: {},
  });

  useEffect(() => {
    if (!db || !userId) return;

    const ref = doc(db, `artifacts/${appId}/public/data/users`, userId);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUserSettings(snap.data());
      }
    });

    return () => unsubscribe();
  }, [db, userId, appId]);

  return userSettings;
}
