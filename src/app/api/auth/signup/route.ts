import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if email is in admin list
    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(email.trim().toLowerCase())) {
      return NextResponse.json(
        { error: 'Access denied. This email is not authorized as an admin.' },
        { status: 403 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true, // Auto-confirm admin users
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Account created successfully. You can now log in.',
      user: data.user,
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
