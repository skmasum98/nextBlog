"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // --- NEW: State for categories ---
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  // --- END NEW ---

  // --- NEW: Fetch categories on component mount ---
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data.categories);
        } catch (error) {
            setMessage(`❌ Error: Could not load categories. ${error.message}`);
        }
    };
    fetchCategories();
  }, []); // Empty array ensures this runs only once
  // --- END NEW ---

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // --- NEW: Category validation ---
    if (!categoryId) {
        setMessage('❌ Error: Please select a category.');
        return;
    }
    // --- END NEW ---

    setIsSubmitting(true);
    setMessage("Creating post...");

    let coverImageUrl = "";

    // Upload to Cloudinary if image is selected
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      try {
        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryRes.ok) throw new Error(cloudinaryData.error.message || 'Cloudinary upload failed');
        coverImageUrl = cloudinaryData.secure_url;
      } catch (error) {
        setMessage(`❌ Error uploading image: ${error.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    // Submit to our own API
    try {
      const ourApiRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // --- NEW: Add category to the request body ---
        body: JSON.stringify({ 
          title, 
          content, 
          coverImage: coverImageUrl,
          category: categoryId,
        }),
        // --- END NEW ---
      });

      const data = await ourApiRes.json();
      if (!ourApiRes.ok) throw new Error(data.error);

      setMessage("✅ Post created successfully!");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-6 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">
          ✍️ Create a New Post
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title..."
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4 py-2"
            />
          </div>

          {/* --- NEW: Category Dropdown --- */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4 py-2"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {/* --- END NEW --- */}

          {/* Cover Image */}
          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">Cover Image (Optional)</label>
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:font-semibold 
              file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {preview && (
              <div className="mt-4">
                <img src={preview} alt="Preview" className="w-full h-56 object-cover rounded-lg shadow-sm" />
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <RichTextEditor 
              content={content} 
              onChange={setContent}
              placeholder="Start writing your amazing content here..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim() || content === '<p></p>' || !categoryId}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold text-lg 
            hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {isSubmitting ? "⏳ Publishing..." : "🚀 Publish Post"}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-center font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}