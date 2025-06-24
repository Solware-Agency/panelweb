import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@app/providers/AuthContext'
import { useUserProfile } from './useUserProfile'

interface UseSecureRedirectOptions {
  /** Whether to redirect immediately on mount */
  redirectOnMount?: boolean
  /** Custom redirect paths */
  ownerPath?: string
  employeePath?: string
  /** Callback when redirect is about to happen */
  onRedirect?: (role: string, path: string) => void
}

interface UseSecureRedirectReturn {
  isRedirecting: boolean
  redirectUser: () => void
  canAccess: (requiredRole?: 'owner' | 'employee') => boolean
}

/**
 * Custom hook for secure role-based redirects
 * Handles user authentication, email verification, and role-based routing
 */
export const useSecureRedirect = (options: UseSecureRedirectOptions = {}): UseSecureRedirectReturn => {
  const {
    redirectOnMount = false,
    ownerPath = '/dashboard',
    employeePath = '/form',
    onRedirect,
  } = options

  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading } = useUserProfile()
  const [isRedirecting, setIsRedirecting] = useState(false)

  /**
   * Performs the actual redirect based on user role
   */
  const redirectUser = () => {
    // Don't redirect if still loading or no user
    if (authLoading || profileLoading || !user || !profile) {
      return
    }

    // Check if email is verified
    if (!user.email_confirmed_at) {
      console.log('Email not confirmed, redirecting to verification notice')
      navigate('/email-verification-notice')
      return
    }

    setIsRedirecting(true)

    // Determine redirect path based on role
    const isOwner = profile.role === 'owner'
    const redirectPath = isOwner ? ownerPath : employeePath

    console.log(`Redirecting user with role "${profile.role}" to: ${redirectPath}`)
    
    // Call callback if provided
    onRedirect?.(profile.role, redirectPath)

    // Perform redirect
    navigate(redirectPath)
    
    // Reset redirecting state after a short delay
    setTimeout(() => setIsRedirecting(false), 500)
  }

  /**
   * Checks if user can access a specific role-protected route
   */
  const canAccess = (requiredRole?: 'owner' | 'employee'): boolean => {
    if (!user || !profile || !user.email_confirmed_at) {
      return false
    }

    if (!requiredRole) {
      return true // No specific role required
    }

    return profile.role === requiredRole
  }

  // Auto-redirect on mount if enabled
  useEffect(() => {
    if (redirectOnMount && !authLoading && !profileLoading && user && profile) {
      redirectUser()
    }
  }, [redirectOnMount, authLoading, profileLoading, user, profile])

  return {
    isRedirecting,
    redirectUser,
    canAccess,
  }
}