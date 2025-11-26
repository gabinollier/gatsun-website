'use server';

import bcrypt from 'bcrypt';
import { createSession, destroySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Le mot de passe est requis' };
  }

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash) {
    console.error('ADMIN_PASSWORD_HASH is not defined');
    return { error: 'Erreur de configuration serveur' };
  }

  const isValid = await bcrypt.compare(password, passwordHash);
  if (!isValid) {
    return { error: 'Mot de passe incorrect' };
  }

  await createSession();
  redirect('/admin/dashboard');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}
