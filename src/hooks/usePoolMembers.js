import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  documentId,
  getDocs,
} from "firebase/firestore";

export default function usePoolMembers(db, appId, pools, poolId) {
  const [poolMembers, setPoolMembers] = useState([]);

  useEffect(() => {
    if (poolId === "personal") {
      setPoolMembers([]);
      return;
    }

    const pool = pools.find((p) => p.id === poolId);
    if (!pool?.members) return;

    const load = async () => {
      try {
        const usersRef = collection(db, `artifacts/${appId}/public/data/users`);
        const q = query(usersRef, where(documentId(), "in", pool.members));
        const docs = await getDocs(q);

        setPoolMembers(
          docs.docs
            .map((d) => ({
              id: d.id,
              displayName: d.data().displayName || "User",
              ...d.data(),
            }))
            .sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
      } catch (err) {
        console.error("Pool member load error:", err);
      }
    };

    load();
  }, [db, appId, pools, poolId]);

  return poolMembers;
}
