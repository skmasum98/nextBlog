// We can use our direct data-fetching functions here!
import { getAllCategories, getRecentPosts } from '@/lib/data';

// --- IMPORTANT: We need a new function to get ALL posts, not just recent ones ---
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

async function getAllPostsForSitemap() {
  await dbConnect();
  const posts = await Post.find({}).sort({ createdAt: -1 }).select('_id updatedAt');
  return JSON.parse(JSON.stringify(posts));
}
// --- END NEW FUNCTION ---


export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL; // Your live site's base URL

  // 1. Get static routes
  const staticRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password'
    // Add any other static pages like '/about', '/contact', etc.
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // 2. Get dynamic post routes
  const posts = await getAllPostsForSitemap();
  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/posts/${post._id}`,
    lastModified: new Date(post.updatedAt).toISOString(), // Use the post's update date
  }));

  // 3. Get dynamic category routes
  const categories = await getAllCategories();
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date().toISOString(), // Categories don't have an update date, so use current
  }));

  // 4. Combine all routes
  return [...staticRoutes, ...postRoutes, ...categoryRoutes];
}