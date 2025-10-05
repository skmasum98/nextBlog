import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';

// GET handler to fetch all categories (public)
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 }); // Sort alphabetically
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler to create a new category (admin only)
export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
  }

  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }

    const newCategory = await Category.create({ name });

    return NextResponse.json({ message: 'Category created successfully', category: newCategory }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}