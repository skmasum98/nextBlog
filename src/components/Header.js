import Link from 'next/link';
import SearchBar from './SearchBar';
import { getUserSession } from '@/lib/session';
import UserMenu from './UserMenu'; // We will create this next
import MobileMenu from './MobileMenu';

export default async function Header() {
  // This is a server component, so we can fetch the session directly.
  const session = await getUserSession();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Site Title/Logo */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          THEWEBPAL
        </Link>

        {/* Search Bar (visible on medium screens and up) */}
        <div className="hidden md:block w-1/3">
          <SearchBar />
        </div>

        {/* Navigation Links and User Menu */}
        <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
                <Link href="/posts/create" className="hover:text-indigo-600">
                    Create Post
                </Link>
                {session ? (
                    // If user is logged in, show their personalized menu
                    <UserMenu user={session} />
                ) : (
                    // If user is logged out, show Login/Register
                    <>
                        <Link href="/login" className="hover:text-indigo-600">
                            Login
                        </Link>
                        <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Register
                        </Link>
                    </>
                )}
            </div>
            {/* --- We will add a mobile menu button here later --- */}
             <MobileMenu session={session} />
        </div>
      </nav>
    </header>
  );
}