import mongoose from 'mongoose';
import slugify from 'slugify';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose middleware to create slug from the name before saving
CategorySchema.pre('save', function (next) {
  if (!this.isModified('name')) {
    next();
  }
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);