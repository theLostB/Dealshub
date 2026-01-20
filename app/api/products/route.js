import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'products.json');

function getProducts() {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveProducts(products) {
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
}

// GET - Fetch all products
export async function GET() {
    const products = getProducts();
    return NextResponse.json(products);
}

// POST - Add a new product
export async function POST(request) {
    try {
        const product = await request.json();
        const products = getProducts();

        const newProduct = {
            id: Date.now().toString(),
            ...product,
            createdAt: new Date().toISOString(),
        };

        products.unshift(newProduct);
        saveProducts(products);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
    }
}

// PUT - Update a product
export async function PUT(request) {
    try {
        const { id, ...updates } = await request.json();
        const products = getProducts();

        const index = products.findIndex((p) => p.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        products[index] = { ...products[index], ...updates };
        saveProducts(products);

        return NextResponse.json(products[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE - Remove a product
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const products = getProducts();
        const filtered = products.filter((p) => p.id !== id);

        if (filtered.length === products.length) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        saveProducts(filtered);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
