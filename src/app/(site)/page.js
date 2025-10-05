import Link from 'next/link';
import Image from 'next/image'; 
import { getPaginatedPosts } from '@/lib/data'; // --- NEW: Import our pagination function ---
import PaginationControls from '@/components/PaginationControls'; // --- NEW: Import pagination controls ---

export const dynamic = 'force-dynamic';

// The old getPosts() function that used fetch is no longer needed.

// The page component now accepts searchParams to know the current page
export default async function Home({ searchParams }) {
  // Await searchParams because it's now a Promise
  const params = await searchParams;
  
  const page = parseInt(params?.page || '1', 10);
  const limit = 10;

  const { posts, currentPage, totalPages } = await getPaginatedPosts({ page, limit });

  const createSnippet = (html) => {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, ''); 
    return text.length > 150 ? `${text.substring(0, 150)}...` : text;
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8">Latest Posts</h1>

      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
            >
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
                <div className="flex items-center text-sm text-gray-500 mb-2 space-x-2 flex-wrap">
                  {post.category && (
                    <Link href={`/category/${post.category.slug}`}>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold hover:bg-indigo-200">
                        {post.category.name}
                      </span>
                    </Link>
                  )}
                  <span className="hidden sm:inline">•</span>
                  <span>By {post.author ? post.author.name : 'Unknown'}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <Link href={`/posts/${post._id}`}>
                  <h2 className="text-2xl font-semibold mb-2 hover:text-indigo-600">{post.title}</h2>
                </Link>

                <p className="text-gray-700 flex-grow">
                  {createSnippet(post.content)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>

      <PaginationControls totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
