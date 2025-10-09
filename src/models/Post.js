import mongoose from 'mongoose';
import slugify from 'slugify';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      // We will generate this automatically, so it's not required in the input
    },
    content: {
      type: String,
      required: [true, 'Please provide content for your post'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This creates a reference to the User model
      required: true,
    },

    //  likes/dislikes
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    coverImage: { 
      type: String, 
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'], // Make it required
    },
  },
  {
    timestamps: true,
  }
);

// --- NEW: Middleware to generate a unique slug before saving ---
PostSchema.pre('save', async function (next) {
  // Only generate a new slug if the title has been modified or it's a new post
  if (!this.isModified('title')) {
    return next();
  }

  const generateSlug = (title) => slugify(title, { lower: true, strict: true });
  
  let baseSlug = generateSlug(this.title);
  let slug = baseSlug;
  let counter = 1;

  // Check if a post with this slug already exists
  while (await mongoose.models.Post.findOne({ slug: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);