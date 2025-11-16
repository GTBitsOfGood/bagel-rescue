import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Handles authentication errors from server actions and redirects to unauthorized page
 * @param error - The error from the server action
 * @param router - Next.js router instance
 * @returns true if it was an auth error and was handled, false otherwise
 */
export function handleAuthError(error: any, router: AppRouterInstance, isAdminRoute: boolean = false): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    console.log("MESSAGE: " + message)
    console.log("IS ADMIN ROUTE: " + isAdminRoute)
    if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('admin access required')) {
      if (isAdminRoute) {
        router.push('/VolunteerNavView/Homepage');
      } else {
        console.log("GOING TO LOGIN FROM HERE")
        router.push('/Login');
      }
      return true;
    }
  }
  return false;
}