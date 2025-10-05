"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import RichTextEditor from "@/components/RichTextEditor";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { postId } = params;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);

    // --- NEW: Category State ---
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
    if (!postId) return;

    const fetchInitialData = async () => {
      try {
        // Fetch post and categories in parallel for efficiency
        const [postRes, catRes] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch('/api/categories')
        ]);

        if (!postRes.ok) throw new Error("Could not fetch post data.");
        if (!catRes.ok) throw new Error("Could not fetch categories.");
        
        const postData = await postRes.json();
        const catData = await catRes.json();
        
        // Set post state
        setTitle(postData.post.title);
        setContent(postData.post.content);
        setCurrentImage(postData.post.coverImage || "");
        setCategoryId(postData.post.category); // Set the current category

        // Set categories state
        setCategories(catData.categories);

      } catch (error) {
        setMessage(`❌ Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [postId]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!categoryId) {
        setMessage('❌ Error: Please select a category.');
        return;
    }
    setIsSubmitting(true);
    setMessage("Updating...");

    let coverImageUrl = currentImage;

    if (newImage) {
      const formData = new FormData();
      formData.append("file", newImage);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      try {
        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const cloudinaryData = await cloudinaryRes.json();
        coverImageUrl = cloudinaryData.secure_url;
      } catch (error) {
        setMessage("❌ Error uploading new image. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

     const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        content, 
        coverImage: coverImageUrl,
        category: categoryId, // Add category here
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Post updated successfully!");
      setTimeout(() => {
        router.push(`/posts/${postId}`);
        router.refresh();
      }, 1200);
    } else {
      setMessage(`❌ Error: ${data.error}`);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-10">⏳ Loading post...</div>;

  return (
    <div className="container mx-auto max-w-4xl px-6 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">
          📝 Edit Post
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Update the post title..."
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

          {/* Image Section */}
          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cover Image
            </label>
            {currentImage && !preview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Current image:</p>
                <Image
                  src={currentImage}
                  alt="Current cover image"
                  width={500}
                  height={280}
                  className="rounded-lg object-cover shadow-sm"
                />
              </div>
            )}
            {preview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">New selected image:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-56 object-cover rounded-lg shadow-sm"
                />
              </div>
            )}
            <input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
              file:rounded-lg file:border-0 file:font-semibold 
              file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {/* Content with RichTextEditor */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Content
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Update your amazing content..."
            />
          </div>

          {/* Button */}
           <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim() || content === '<p></p>' || !categoryId}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {isSubmitting ? "⏳ Saving..." : "💾 Save Changes"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-6 text-center font-medium ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("❌")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
