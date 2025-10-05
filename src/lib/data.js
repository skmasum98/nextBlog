import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';
import Category from '@/models/Category';
import User from '@/models/User';

// This function will run on the server only
// export async function getPostsByCategorySlug(slug) {
//   try {
//     await dbConnect();

//     const category = await Category.findOne({ slug });
//     if (!category) {
//       throw new Error('Category not found');
//     }

//     const posts = await Post.find({ category: category._id })
//       .populate({ path: 'author', select: 'name', model: User })
//       .populate({ path: 'category', select: 'name slug', model: Category })
//       .sort({ createdAt: -1 });
      
//     // Return plain objects to avoid serialization issues
//     return { 
//         posts: JSON.parse(JSON.stringify(posts)), 
//         category: JSON.parse(JSON.stringify(category)) 
//     };
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch posts for this category.');
//   }
// }


// --- NEW: Function to get all categories for the sidebar ---
export async function getAllCategories() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 });
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

// --- NEW: Function to get recent posts for the sidebar ---
export async function getRecentPosts() {
  try {
    await dbConnect();
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(5) // Get only the 5 most recent posts
      .select('title slug'); // Only select the fields we need
      
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch recent posts.');
  }
}

// --- NEW: Function to get paginated posts ---
export async function getPaginatedPosts({ page = 1, limit = 10 }) {
  try {
    await dbConnect();

    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find({})
        .populate({ path: 'author', select: 'name', model: User })
        .populate({ path: 'category', select: 'name slug', model: Category })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments()
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    return {
      posts: JSON.parse(JSON.stringify(posts)),
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch posts.');
  }
}

// This function now accepts pagination options
export async function getPostsByCategorySlug({ slug, page = 1, limit = 10 }) {
  try {
    await dbConnect();

    const category = await Category.findOne({ slug });
    if (!category) {
      throw new Error('Category not found');
    }

    const skip = (page - 1) * limit;

    // Fetch total count and paginated posts in parallel
    const [posts, totalPosts] = await Promise.all([
      Post.find({ category: category._id })
        .populate({ path: 'author', select: 'name', model: User })
        .populate({ path: 'category', select: 'name slug', model: Category })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ category: category._id }) // Count only posts in this category
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    return {
      posts: JSON.parse(JSON.stringify(posts)),
      category: JSON.parse(JSON.stringify(category)),
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch posts for this category.');
  }
}