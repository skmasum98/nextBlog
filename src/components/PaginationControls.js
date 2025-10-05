"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaginationControls({ totalPages, currentPage }) {
  const searchParams = useSearchParams();

  // Function to create the URL for a given page
  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {/* Previous Button */}
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 rounded-md ${
          currentPage === 1 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        Previous
      </Link>

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center space-x-2">
          {pageNumbers.map((page) => (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`px-4 py-2 rounded-md ${
                currentPage === page 
                  ? 'bg-indigo-200 text-indigo-800 font-bold' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </Link>
          ))}
      </div>

      {/* Next Button */}
      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 rounded-md ${
          currentPage === totalPages 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        Next
      </Link>
    </div>
  );
}