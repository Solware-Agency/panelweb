import { useState, useEffect } from 'react'
import { getUserProfile, type UserProfile } from '@lib/supabase/auth'
import { useAuth } from '@app/providers/AuthContext'

interface UseUserProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Custom hook to fetch and manage user profile data
 * Automatically fetches profile when user changes and handles loading/error states
 */
export const useUserProfile = (): UseUserProfileReturn => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)

  const fetchProfile = async () => {
    // Don't fetch if auth is still loading or no user
    if (authLoading || !user?.id) {
      return
    }

    // Don't fetch if already attempted for this user
    if (hasAttemptedFetch && profile?.id === user.id) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching profile for user:', user.id)
      const userProfile = await getUserProfile(user.id)
      
      if (userProfile) {
        console.log('Profile fetched successfully:', userProfile)
        setProfile(userProfile)
        setError(null)
      } else {
        console.warn('No profile found for user:', user.id)
        setError('No se encontró el perfil del usuario')
        setProfile(null)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Error al cargar el perfil del usuario')
      setProfile(null)
    } finally {
      setIsLoading(false)
      setHasAttemptedFetch(true)
    }
  }

  // Reset state when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null)
      setError(null)
      setIsLoading(false)
      setHasAttemptedFetch(false)
      return
    }

    // If user changed, reset and fetch new profile
    if (profile && profile.id !== user.id) {
      setProfile(null)
      setError(null)
      setHasAttemptedFetch(false)
    }

    // Only fetch if we haven't attempted yet for this user
    if (!hasAttemptedFetch && !authLoading) {
      fetchProfile()
    }
  }, [user?.id, authLoading])

  const refetch = async () => {
    setHasAttemptedFetch(false)
    await fetchProfile()
  }

  return {
    profile,
    isLoading: authLoading || isLoading,
    error,
    refetch,
  }
}