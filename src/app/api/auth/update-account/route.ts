import { createClient } from '@/lib/supabase/server';
import { createClient as createIsolatedClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword, confirmPassword } =
      await request.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wantsEmailChange =
      typeof email === 'string' &&
      email.trim().length > 0 &&
      email.trim().toLowerCase() !== user.email.toLowerCase();
    const wantsPasswordChange =
      typeof newPassword === 'string' && newPassword.length > 0;

    if (!wantsEmailChange && !wantsPasswordChange) {
      return NextResponse.json({ message: 'No account changes to apply.' });
    }

    // --- Validate the new password before touching anything. ---
    if (wantsPasswordChange) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters.' },
          { status: 400 }
        );
      }
      // When the client sends a confirmation, make sure it matches.
      if (
        typeof confirmPassword === 'string' &&
        confirmPassword !== newPassword
      ) {
        return NextResponse.json(
          { error: 'New password and confirmation do not match.' },
          { status: 400 }
        );
      }
      if (currentPassword && newPassword === currentPassword) {
        return NextResponse.json(
          { error: 'Your new password must be different from the current one.' },
          { status: 400 }
        );
      }
    }

    // Any credential change requires the current password.
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Please enter your current password to make changes.' },
        { status: 400 }
      );
    }

    // --- Verify the current password on an ISOLATED client. ---
    // Doing this on the cookie-bound `supabase` client would overwrite the
    // live admin session (and `updateUser` would then rotate it again),
    // leaving the browser logged out. The isolated client never persists a
    // session, so the real session is only rotated once — by updateUser below.
    const verifier = createIsolatedClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: verifyError } = await verifier.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: 'Your current password is incorrect.' },
        { status: 400 }
      );
    }

    const updates: { email?: string; password?: string } = {};
    if (wantsEmailChange) updates.email = email.trim();
    if (wantsPasswordChange) updates.password = newPassword;

    // Runs on the cookie-bound client, so the refreshed session is written
    // back to the browser via Set-Cookie and the admin stays signed in.
    const { error: updateError } = await supabase.auth.updateUser(updates);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const messages: string[] = [];
    if (wantsPasswordChange) messages.push('Your password has been changed.');
    if (wantsEmailChange) {
      messages.push(
        'Check your inbox to confirm your new email address before it takes effect.'
      );
    }

    return NextResponse.json({
      message: messages.join(' ') || 'Account updated successfully.',
      passwordChanged: wantsPasswordChange,
      emailChangePending: wantsEmailChange,
    });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
