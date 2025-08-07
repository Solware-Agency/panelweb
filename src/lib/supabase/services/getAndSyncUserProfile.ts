import { supabase } from '@lib/supabase/config'
import type { UserProfile } from '@lib/supabase/auth'

export const getAndSyncUserProfile = async (userId: string, userMeta: any): Promise<UserProfile | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    console.error('[❌] Error fetching profile:', error)
    return null
  }

  let synced = false

  if (userMeta?.display_name && !profile.display_name) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: userMeta.display_name })
      .eq('id', userId)
    if (!updateError) {
      profile.display_name = userMeta.display_name
      synced = true
    }
  }

  if (profile.display_name && (!userMeta?.display_name || userMeta.display_name !== profile.display_name)) {
    const { error: updateError } = await supabase.auth.updateUser({
      data: { display_name: profile.display_name },
    })
    if (!updateError) {
      synced = true
    }
  }

  if (synced) {
    console.log('[🔄] Display name synced')
  }

  return profile
}
