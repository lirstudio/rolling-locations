import { useState, useEffect } from "react";
import { useHostStore } from "@/stores/host-store";

/**
 * Returns `true` once the Zustand persist middleware has finished
 * rehydrating the host store from localStorage.
 * Uses the built-in persist API rather than store state to avoid
 * setState-during-initialization issues.
 */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    useHostStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hydrated) return;
    const unsub = useHostStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    return unsub;
  }, [hydrated]);

  return hydrated;
}
