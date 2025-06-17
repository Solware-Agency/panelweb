import { supabase } from './config'
import type { User, AuthError } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export interface UserProfile {
  id: string
  email: string
  role: 'owner' | 'employee'
  created_at: string
  updated_at: string
}

// Sign up with email and password - ENHANCED WITH PROPER EMAIL VERIFICATION
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting to sign up user:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Email confirmation is required
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email_confirm: true
        }
      }
    })

    if (error) {
      console.error('Signup error:', error)
      return { user: null, error }
    }

    console.log('Signup successful, user created:', data.user?.email)
    console.log('Email confirmed at signup:', data.user?.email_confirmed_at)

    // Note: Profile creation is handled by the database trigger
    // No need to manually create profile here

    return { user: data.user, error: null }
  } catch (err) {
    console.error('Unexpected signup error:', err)
    return { 
      user: null, 
      error: { 
        message: 'An unexpected error occurred during signup',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Sign in with email and password - ENHANCED WITH EMAIL VERIFICATION CHECK
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting to sign in user:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Signin error:', error)
      return { user: null, error }
    }

    // Check if email is verified
    if (data.user && !data.user.email_confirmed_at) {
      console.log('User email not confirmed:', email)
      // Return a custom error to indicate email not confirmed
      return { 
        user: data.user, 
        error: { 
          message: 'Email not confirmed. Please check your email and click the confirmation link.',
          name: 'EmailNotConfirmed'
        } as AuthError 
      }
    }

    console.log('Signin successful for verified user:', email)
    return { user: data.user, error: null }
  } catch (err) {
    console.error('Unexpected signin error:', err)
    return { 
      user: null, 
      error: { 
        message: 'An unexpected error occurred during signin',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Sign out
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    console.error('Unexpected signout error:', err)
    return { 
      error: { 
        message: 'An unexpected error occurred during signout',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Send password reset email
export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    })
    return { error }
  } catch (err) {
    console.error('Unexpected reset password error:', err)
    return { 
      error: { 
        message: 'An unexpected error occurred while sending reset email',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Resend email confirmation - IMPROVED VERSION
export const resendConfirmation = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    console.log('Attempting to resend confirmation email to:', email)
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Resend confirmation error:', error)
    } else {
      console.log('Confirmation email resent successfully')
    }

    return { error }
  } catch (err) {
    console.error('Unexpected resend confirmation error:', err)
    return { 
      error: { 
        message: 'An unexpected error occurred while resending confirmation',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (err) {
    console.error('Error getting current user:', err)
    return null
  }
}

// Get user profile with role
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Error fetching user profile:', err)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    return { error: error as AuthError | null }
  } catch (err) {
    console.error('Unexpected error updating profile:', err)
    return { 
      error: { 
        message: 'An unexpected error occurred while updating profile',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Check if user has specific role
export const hasRole = async (userId: string, role: 'owner' | 'employee'): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId)
    return profile?.role === role || false
  } catch (err) {
    console.error('Error checking user role:', err)
    return false
  }
}

// Check if user is owner
export const isOwner = async (userId: string): Promise<boolean> => {
  return hasRole(userId, 'owner')
}

// Check if user is employee
export const isEmployee = async (userId: string): Promise<boolean> => {
  return hasRole(userId, 'employee')
}