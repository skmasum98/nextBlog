import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center px-4">
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>
      <h2 className="mt-4 text-3xl font-semibold text-gray-800">Page Not Found</h2>
      <p className="mt-2 text-gray-600">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Go back home
      </Link>
    </div>
  );
}
