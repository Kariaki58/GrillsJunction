import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wantsEmailChange =
      typeof email === 'string' &&
      email.trim().length > 0 &&
      email.trim().toLowerCase() !== (user.email ?? '').toLowerCase();
    const wantsPasswordChange =
      typeof newPassword === 'string' && newPassword.length > 0;

    if (!wantsEmailChange && !wantsPasswordChange) {
      return NextResponse.json({ message: 'No account changes to apply.' });
    }

    // Verify the current password before allowing any credential change.
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Please enter your current password to make changes.' },
        { status: 400 }
      );
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: 'Your current password is incorrect.' },
        { status: 400 }
      );
    }

    if (wantsPasswordChange && newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const updates: { email?: string; password?: string } = {};
    if (wantsEmailChange) updates.email = email.trim();
    if (wantsPasswordChange) updates.password = newPassword;

    const { error: updateError } = await supabase.auth.updateUser(updates);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      message: wantsEmailChange
        ? 'Account updated. Check your inbox to confirm your new email address.'
        : 'Account updated successfully.',
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
