import Link from 'next/link';
import Image from 'next/image';
import { getPostsByCategorySlug } from '@/lib/data'; // Import our new function

import PaginationControls from '@/components/PaginationControls'; // Import pagination controls

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params, searchParams }) {
  // --- CORRECTED: No 'await' on params ---
  const { slug } = params;
  
  // --- NEW: Read page number from URL ---
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 10; // Posts per page

  try {
    // --- NEW: Pass slug and pagination options to the function ---
    const { posts, category, currentPage, totalPages } = await getPostsByCategorySlug({ slug, page, limit });

    // Helper function for snippets
    const createSnippet = (html) => {
        if (!html) return '';
        const text = html.replace(/<[^>]+>/g, '');
        return text.length > 150 ? `${text.substring(0, 150)}...` : text;
    };


    return (
      <main className="w-full">
        <h1 className="text-4xl font-bold mb-8">
          Category: <span className="text-indigo-600">{category.name}</span>
        </h1>

        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                {post.coverImage && (
                  <div className="flex-shrink-0 w-full sm:w-48">
                    <Link href={`/posts/${post._id}`}>
                      <Image 
                        src={post.coverImage} 
                        alt={post.title} 
                        width={200} 
                        height={150} 
                        className="object-cover rounded-md w-full h-48 sm:w-48 sm:h-full"
                      />
                    </Link>
                  </div>
                )}
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center text-sm text-gray-500 mb-2 space-x-2">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {category.name}
                    </span>
                    <span>•</span>
                    <span>By {post.author ? post.author.name : 'Unknown'}</span>
                  </div>
                  <Link href={`/posts/${post._id}`}>
                    <h2 className="text-2xl font-semibold mb-2 hover:text-indigo-600">{post.title}</h2>
                  </Link>
                  <p className="text-gray-600 flex-grow">
                    {post.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                  </p>
                  <div className="text-sm text-gray-500 mt-4">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No posts found in this category.</p>
          )}


        </div>
        {totalPages > 1 && (
            <PaginationControls totalPages={totalPages} currentPage={currentPage} />
        )}
      </main>
    );
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
        <p>Could not load posts for this category.</p>
        <p className="text-gray-500 mt-2">{error.message}</p>
      </main>
    );
  }
} 