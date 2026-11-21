import { useAuth } from "@/providers/AuthProvider";

/**
 * UI-level mirror of the backend rules (the backend is the real enforcement):
 *  - canWrite:  everyone except VIEWER
 *  - canManage: ADMIN and QA_LEAD (destructive actions such as deleting a pack)
 */
export function usePermissions() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const has = (...names: string[]) => roles.some((r) => names.includes(r));
  return {
    canWrite: has("ADMIN", "QA_LEAD", "QA_ENGINEER"),
    canManage: has("ADMIN", "QA_LEAD"),
  };
}
