import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

async function searchPosts(query) {
  if (!query) return [];
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?query=${encodeURIComponent(query)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }
  return res.json();
}

export default async function SearchPage({ searchParams }) {
  const query = searchParams.query || '';
  const { posts } = await searchPosts(query);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Search Results for: <span className="text-indigo-600">&quot;{query}&quot;</span>
      </h1>

      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
              <Link href={`/posts/${post._id}`}>
                <h2 className="text-2xl font-semibold mb-2 hover:text-indigo-600">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-500 text-sm mb-4">
                By {post.author ? post.author.name : 'Unknown Author'} on{' '}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              {/* Display a snippet of the content (strip HTML) */}
              <p className="text-gray-700">
                {(post.content ? DOMPurify.sanitize(post.content, { ALLOWED_TAGS: [] }) : '').substring(0, 200)}{post.content && post.content.length > 200 ? '...' : ''}
              </p>
            </div>
          ))
        ) : (
          <p>No posts found matching your search.</p>
        )}
      </div>
    </main>
  );
}