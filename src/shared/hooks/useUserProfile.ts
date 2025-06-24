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
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null)
      setIsLoading(false)
      setError(null)
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
    }
  }

  // Fetch profile when user changes
  useEffect(() => {
    fetchProfile()
  }, [user?.id])

  const refetch = async () => {
    await fetchProfile()
  }

  return {
    profile,
    isLoading,
    error,
    refetch,
  }
}