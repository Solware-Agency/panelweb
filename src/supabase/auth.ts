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

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      return { user: null, error }
    }

    // Create user profile after successful signup
    if (data.user) {
      const role = email === 'juegosgeorge0502@gmail.com' ? 'owner' : 'employee'
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          role
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }

    return { user: data.user, error: null }
  } catch (err) {
    return { 
      user: null, 
      error: { 
        message: 'An unexpected error occurred during signup',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { user: data.user, error }
  } catch (err) {
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
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { error }
  } catch (err) {
    return { 
      error: { 
        message: 'An unexpected error occurred while sending reset email',
        name: 'UnexpectedError'
      } as AuthError 
    }
  }
}

// Resend email confirmation
export const resendConfirmation = async (email: string): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { error }
  } catch (err) {
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