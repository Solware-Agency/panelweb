import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@app/providers/AuthContext'
import { getAndSyncUserProfile } from '@lib/supabase/services/getAndSyncUserProfile'

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => {
      if (!user) throw new Error('No user')
      return getAndSyncUserProfile(user.id, user.user_metadata)
    },
    enabled: !!user && !authLoading,
    staleTime: 1000 * 60 * 2, // 2 min
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  return {
    profile: query.data,
    isLoading: authLoading || query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  }
}
