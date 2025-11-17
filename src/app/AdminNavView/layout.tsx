import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/server/db/firebase/admin/firebaseAdmin';
import { getUserByEmail } from '@/server/db/actions/User';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect('/Login');
  }

  let decodedToken;
  let user;
  
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
    user = await getUserByEmail(decodedToken.email || '');
  } catch (error) {
    redirect('/Login');
  }
  
  if (!user || !user.isAdmin) {
    redirect('/VolunteerNavView/Homepage');
  }

  // If they pass the checks, render the children (your admin pages)
  return <>{children}</>;
}