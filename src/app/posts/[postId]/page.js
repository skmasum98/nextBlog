import CommentSection from "@/components/CommentSection";
import LikeDislike from "@/components/LikeDislike"; // Import the new component
import { getUserSession } from "@/lib/session"; // Import our session helper
import Image from 'next/image';
import DOMPurify from 'isomorphic-dompurify';

async function getPost(postId) {
  // This needs the full URL because it runs on the server
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch post');
  return res.json();
}

export default async function PostPage({ params }) {
  const { postId } = params;
  
  // Fetch post data and user session data in parallel
  const [postData, session] = await Promise.all([
    getPost(postId),
    getUserSession()
  ]);
  
  const { post } = postData;


  // --- NEW: Sanitize the HTML content ---
  // Allow common tags and attributes we expect from Tiptap (headings, lists, images, links, code, blockquote)
  const allowedTags = [
    'h1','h2','h3','h4','h5','h6','p','br','ul','ol','li','strong','b','em','i','blockquote','pre','code','img','a'
  ];
  const allowedAttrs = ['href','src','alt','title','target','rel'];
  let sanitizedContent = DOMPurify.sanitize(post.content || '', { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttrs });

  // Ensure the rendered HTML is wrapped in a `.prose` container so Tailwind
  // typography styles apply. If the sanitized content already has a top-level
  // element with the `prose` class, keep it as-is; otherwise wrap it.
  const hasOuterProse = /^\s*<div[^>]*class=["']?[^"']*\bprose\b[^"']*["']?[^>]*>/i.test(sanitizedContent);
  const contentHtml = hasOuterProse ? sanitizedContent : `<div class="prose prose-lg max-w-none">${sanitizedContent}</div>`;


  const userId = session?.id || null; // Get user ID or null if not logged in
  const isAdmin = session?.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
        <p className="text-gray-500 text-sm mb-6">
          By {post.author ? post.author.name : 'Unknown Author'} on{' '}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
    <div
     className="post-content prose prose-lg max-w-none" 
     dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
      
      <CommentSection postId={postId} isAdmin={isAdmin} />
    </div>
  );
}