import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Handles authentication errors from server actions and redirects to unauthorized page
 * @param error - The error from the server action
 * @param router - Next.js router instance
 * @returns true if it was an auth error and was handled, false otherwise
 */
export function handleAuthError(error: any, router: AppRouterInstance): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('admin access required')) {
        router.push('/VolunteerNavView/Homepage');
        return true;
    } else if (message.includes('unauthorized') || message.includes('forbidden')) {
        router.push('/Login');
        return true;
    }
    return false;
  }
  return false;
}