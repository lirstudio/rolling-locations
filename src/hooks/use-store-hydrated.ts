/**
 * Previously used to wait for Zustand persist hydration.
 * The host-store no longer uses persist middleware, so hydration
 * is instantaneous. This hook is kept for backward compatibility.
 */
export function useStoreHydrated(): boolean {
  return true;
}
