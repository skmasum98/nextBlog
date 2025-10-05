import Link from 'next/link';
import Image from 'next/image'; 
import DOMPurify from 'isomorphic-dompurify';

// This function fetches our data on the server
async function getPosts() {
  // We use localhost here because this fetch runs on the server
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
    cache: 'no-store', // This ensures we get fresh data on every request
  });

  if (!res.ok) {
    // This will be caught by the Error Boundary
    throw new Error('Failed to fetch posts');
  }

  return res.json();
}

// The page component is now an async function
export default async function Home() {
  const { posts } = await getPosts();

  return (
    <main className="w-full">
      

      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="bg-white p-6 rounded-lg shadow-md flex space-x-6">
              {post.coverImage && (
                <div className="flex-shrink-0">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={150}
                    height={150}
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              <div>
                <Link href={`/posts/${post._id}`}>
                  <h2 className="text-2xl font-semibold mb-2 hover:text-indigo-600">{post.title}</h2>
                </Link>
                <div className="flex items-center text-sm text-gray-500 mb-4 space-x-2">
  <span>By {post.author ? post.author.name : 'Unknown'}</span>
  <span>•</span>
  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
  {post.category && (
    <>
      <span>•</span>
      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
        {post.category.name}
      </span>
    </>
  )}
</div>
                <p className="text-gray-700 whitespace-pre-wrap">{(post.content ? DOMPurify.sanitize(post.content, { ALLOWED_TAGS: [] }) : '').substring(0, 150)}{post.content && post.content.length > 150 ? '...' : ''}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </main>
  );
}