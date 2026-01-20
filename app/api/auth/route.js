import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ADMIN_FILE = path.join(process.cwd(), 'data', 'admin.json');

// Load admin credentials
function loadAdmin() {
    try {
        if (fs.existsSync(ADMIN_FILE)) {
            const data = fs.readFileSync(ADMIN_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading admin:', error);
    }
    return { username: 'admin', password: 'admin123' };
}

// Save admin credentials
function saveAdmin(data) {
    try {
        const dir = path.dirname(ADMIN_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving admin:', error);
        return false;
    }
}

// POST - Login or update credentials
export async function POST(request) {
    try {
        const body = await request.json();
        const { action, username, password, newUsername, newPassword, currentPassword } = body;

        const admin = loadAdmin();

        // Login action
        if (action === 'login') {
            if (username === admin.username && password === admin.password) {
                const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
                return NextResponse.json({ success: true, token });
            }
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // Update credentials action
        if (action === 'update') {
            // Verify current password
            if (currentPassword !== admin.password) {
                return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
            }

            // Update credentials
            const newAdmin = {
                username: newUsername || admin.username,
                password: newPassword || admin.password,
            };

            if (saveAdmin(newAdmin)) {
                return NextResponse.json({ success: true, message: 'Credentials updated successfully' });
            }
            return NextResponse.json({ success: false, error: 'Failed to save credentials' }, { status: 500 });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

// GET - Verify token
export async function GET(request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ valid: false }, { status: 401 });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const [username] = decoded.split(':');
        const admin = loadAdmin();

        if (username === admin.username) {
            return NextResponse.json({ valid: true, username });
        }
    } catch {
        // Invalid token
    }

    return NextResponse.json({ valid: false }, { status: 401 });
}
