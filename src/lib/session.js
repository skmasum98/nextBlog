import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getUserSession() {
  const c = await cookies();
  const tokenCookie = c.get('token');
  if (!tokenCookie) return null;

  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return payload; // Returns { id: '...', email: '...', role: '...' }
  } catch (error) {
    console.error('Session verification failed:', error.message);
    return null;
  }
}


// Helper to check for admin role
export async function getAdminSession() {
  const session = await getUserSession();
  if (!session || session.role !== 'admin') {
    return null; // Return null if user is not an admin or not logged in
  }
  return session; // Return the session object if user is an admin
}