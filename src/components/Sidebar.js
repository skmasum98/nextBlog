import Link from 'next/link';
import { getAllCategories, getRecentPosts } from '@/lib/data';

// This is an async Server Component
export default async function Sidebar() {
  // Fetch data for the sidebar in parallel
  const [categories, recentPosts] = await Promise.all([
    getAllCategories(),
    getRecentPosts()
  ]);

  return (
    <aside className="w-full lg:w-1/4 p-4">
      {/* Categories Widget */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category._id}>
              <Link 
                href={`/category/${category.slug}`} 
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Posts Widget */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Recent Posts</h3>
        <ul className="space-y-4">
          {recentPosts.map((post) => (
            <li key={post._id}>
              <Link 
                href={`/posts/${post._id}`} 
                className="hover:text-indigo-800"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}