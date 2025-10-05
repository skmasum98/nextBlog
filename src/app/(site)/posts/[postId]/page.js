import CommentSection from "@/components/CommentSection";
import LikeDislike from "@/components/LikeDislike"; // Import the new component
import { getUserSession } from "@/lib/session"; // Import our session helper
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';

// import css for prose styling
import '@/app/globals.css';
import Link from "next/link";

async function getPost(postId) {
  // This needs the full URL because it runs on the server
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export default async function PostPage({ params }) {
  const { postId } = await params;
  
  // Fetch post data and user session data in parallel
  const [postData, session] = await Promise.all([
    getPost(postId),
    getUserSession()
  ]);
  
  const { post } = postData;


  // --- NEW: Sanitize the HTML content ---
  // Allow common tags and attributes we expect from Tiptap (headings, lists, images, links, code, blockquote)
  const allowedTags = [
    'h1','h2','h3','h4','h5','h6','p','br','ul','ol','li','strong','b','em','i',
  'blockquote','pre','code','img','a','table','thead','tbody','tr','th','td',
  'span','div','mark','u','s','hr'
  ];
  const allowedAttrs = ['href','src','alt','title','target','rel','style','class'];
  let sanitizedContent = DOMPurify.sanitize(post.content || '', { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttrs });

  // Ensure the rendered HTML is wrapped in a `.prose` container so Tailwind
  // typography styles apply. If the sanitized content already has a top-level
  // element with the `prose` class, keep it as-is; otherwise wrap it.
  const hasOuterProse = /^\s*<div[^>]*class=["']?[^"']*\bprose\b[^"']*["']?[^>]*>/i.test(sanitizedContent);
  const contentHtml = hasOuterProse ? sanitizedContent : `<div class="prose prose-lg max-w-none">${sanitizedContent}</div>`;


  const userId = session?.id || null; // Get user ID or null if not logged in
  const isAdmin = session?.role === 'admin';

  return (
    <div className="w-full">
      {post.coverImage && (
        <div className="mb-8">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-auto object-cover rounded-lg shadow-md"
            priority // Load this image first
          />
        </div>
      )}
  <div className="bg-white p-8 rounded-lg shadow-md mb-8 post-content">
        <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {/* Add the LikeDislike component here */}
            <LikeDislike post={post} userId={userId} />
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
          <span>By {post.author ? post.author.name : 'Unknown'}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          {post.category && (
            <>
              <span>•</span>
              <Link href={`/category/${post.category.slug}`}>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold hover:bg-indigo-200 cursor-pointer">
                  {post.category.name}
                </span>
              </Link>
            </>
          )}
        </div>
    <div
  className="post-content" // Use our custom post-content class
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(post.content || '', {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttrs
    })
  }}
/>
      </div>
      
      <CommentSection postId={postId} isAdmin={isAdmin} />
    </div>
  );
}