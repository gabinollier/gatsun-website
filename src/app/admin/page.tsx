import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth';

export default async function AdminPage() {
  const isAuthenticated = await verifySession();
  
  if (isAuthenticated) {
    redirect('/admin/dashboard');
  } else {
    redirect('/admin/login');
  }
}
