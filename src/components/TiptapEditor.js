"use client";
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align'; // Import TextAlign
import Highlight from '@tiptap/extension-highlight'; // Import Highlight

const TiptapEditor = ({ value = '', onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        }
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        }
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        // Keep Tiptap's default `ProseMirror` class so our global CSS targets apply,
        // while also adding Tailwind `prose` utility classes.
        class: 'ProseMirror prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px]',
      },
    },
    onUpdate({ editor }) {
      onChange && onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Keep the editor content in sync if the value prop changes
  useEffect(() => {
    if (!editor) return;
    
    const current = editor.getHTML();
    const incoming = value || '';
    
    // Only update if content is actually different
    if (incoming !== current && incoming !== '<p></p>') {
      editor.commands.setContent(incoming, false);
    }
  }, [editor, value]);

  // Base button styles
  const baseButtonClass = "p-2 rounded-md border transition-all duration-200 flex items-center justify-center";
  const inactiveButtonClass = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400";
  const activeButtonClass = "bg-blue-500 text-white border-blue-600 shadow-sm";

  const Toolbar = () => (
    <div className="p-3 bg-gray-50 border-b rounded-t-md flex items-center space-x-2 flex-wrap gap-2">
      {/* Bold */}
      <button
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`${baseButtonClass} ${editor?.isActive('bold') ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Bold"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h16M3 12h16m-7 6h7" />
        </svg>
        <span className="ml-1 text-sm font-semibold">B</span>
      </button>

      {/* Italic */}
      <button
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`${baseButtonClass} ${editor?.isActive('italic') ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Italic"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 4h12M6 20h12" />
        </svg>
        <span className="ml-1 text-sm italic">I</span>
      </button>

      {/* Bullet List */}
      <button
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={`${baseButtonClass} ${editor?.isActive('bulletList') ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="ml-1 text-sm">•</span>
      </button>

      {/* Ordered List */}
      <button
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={`${baseButtonClass} ${editor?.isActive('orderedList') ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
        </svg>
        <span className="ml-1 text-sm">1.</span>
      </button>

      {/* Blockquote */}
      <button
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        className={`${baseButtonClass} ${editor?.isActive('blockquote') ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Quote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>

      {/* Code Block */}
      <button
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        className={`${baseButtonClass} ${editor?.isActive('codeBlock') ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Code Block"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      {/* H1 */}
      <button
        onClick={() => editor?.chain().focus().setHeading({ level: 1 }).run()}
        className={`${baseButtonClass} ${editor?.isActive('heading', { level: 1 }) ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Heading 1"
      >
        <span className="text-sm font-bold">H1</span>
      </button>

      {/* H2 */}
      <button
        onClick={() => editor?.chain().focus().setHeading({ level: 2 }).run()}
        className={`${baseButtonClass} ${editor?.isActive('heading', { level: 2 }) ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Heading 2"
      >
        <span className="text-sm font-bold">H2</span>
      </button>

      {/* H3 */}
      <button
        onClick={() => editor?.chain().focus().setHeading({ level: 3 }).run()}
        className={`${baseButtonClass} ${editor?.isActive('heading', { level: 3 }) ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Heading 3"
      >
        <span className="text-sm font-bold">H3</span>
      </button>

      {/* Link */}
      <button
        onClick={() => {
          if (!editor) return;
          const previous = editor.getAttributes('link').href;
          const url = window.prompt('Enter a URL', previous || 'https://');
          if (url === null) return;
          if (url === '') {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        className={`${baseButtonClass} ${editor?.isActive('link') ? activeButtonClass : inactiveButtonClass}`}
        type="button"
        title="Add Link"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      {/* Image Upload */}
      <input 
        id="tiptap-image-input" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          
          const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          
          if (!preset || !cloudName) {
            alert('Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.');
            return;
          }
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', preset);
          
          try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            const url = data.secure_url;
            if (url && editor) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          } catch (err) {
            console.error('Image upload failed', err);
            alert('Image upload failed');
          } finally {
            e.currentTarget.value = '';
          }
        }} 
      />
      <button
        onClick={() => document.getElementById('tiptap-image-input')?.click()}
        type="button"
        className={`${baseButtonClass} ${inactiveButtonClass}`}
        title="Insert Image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-300 mx-1"></div>

      {/* Undo */}
      <button
        onClick={() => editor?.chain().focus().undo().run()}
        className={`${baseButtonClass} ${inactiveButtonClass}`}
        type="button"
        title="Undo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Redo */}
      <button
        onClick={() => editor?.chain().focus().redo().run()}
        className={`${baseButtonClass} ${inactiveButtonClass}`}
        type="button"
        title="Redo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );

  if (!editor) {
    return (
      <div className="tiptap-editor border rounded-md">
        <div className="p-3 bg-gray-50 border-b rounded-t-md flex items-center space-x-2 flex-wrap gap-2">
          <div className="text-gray-500 text-sm">Loading editor...</div>
        </div>
        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 min-h-[200px] p-4 border rounded-b-md bg-white">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="tiptap-editor border rounded-md bg-white shadow-sm">
      <Toolbar />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;