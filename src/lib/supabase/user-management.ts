import { supabase } from './config'

export interface UserProfile {
	id: string
	email: string
	role: 'owner' | 'employee'
	created_at: string
	updated_at: string
	assigned_branch?: string | null
}

/**
 * Update user role in the profiles table
 */
export const updateUserRole = async (userId: string, newRole: 'owner' | 'employee') => {
	try {
		console.log(`Updating user ${userId} role to ${newRole}`)

		const { data, error } = await supabase
			.from('profiles')
			.update({ 
				role: newRole,
				updated_at: new Date().toISOString()
			})
			.eq('id', userId)
			.select()
			.single()

		if (error) {
			console.error('Error updating user role:', error)
			throw error
		}

		console.log('User role updated successfully:', data)
		return { data, error: null }
	} catch (error) {
		console.error('Unexpected error updating user role:', error)
		return { data: null, error }
	}
}

/**
 * Update user assigned branch
 */
export const updateUserBranch = async (userId: string, branch: string | null) => {
	try {
		console.log(`Updating user ${userId} branch to ${branch || 'none'}`)

		const { data, error } = await supabase
			.from('profiles')
			.update({ 
				assigned_branch: branch,
				updated_at: new Date().toISOString()
			})
			.eq('id', userId)
			.select()
			.single()

		if (error) {
			console.error('Error updating user branch:', error)
			throw error
		}

		console.log('User branch updated successfully:', data)
		return { data, error: null }
	} catch (error) {
		console.error('Unexpected error updating user branch:', error)
		return { data: null, error }
	}
}

/**
 * Get all user profiles
 */
export const getAllUserProfiles = async (): Promise<{ data: UserProfile[] | null; error: any }> => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.order('created_at', { ascending: false })

		if (error) {
			console.error('Error fetching user profiles:', error)
			throw error
		}

		return { data, error: null }
	} catch (error) {
		console.error('Unexpected error fetching user profiles:', error)
		return { data: null, error }
	}
}

/**
 * Get user profile by ID
 */
export const getUserProfileById = async (userId: string): Promise<{ data: UserProfile | null; error: any }> => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single()

		if (error) {
			console.error('Error fetching user profile:', error)
			throw error
		}

		return { data, error: null }
	} catch (error) {
		console.error('Unexpected error fetching user profile:', error)
		return { data: null, error }
	}
}

/**
 * Check if current user has permission to manage other users
 * Only owners can manage user roles
 */
export const canManageUsers = async (currentUserId: string): Promise<boolean> => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', currentUserId)
			.single()

		if (error || !data) {
			console.error('Error checking user permissions:', error)
			return false
		}

		return data.role === 'owner'
	} catch (error) {
		console.error('Unexpected error checking user permissions:', error)
		return false
	}
}

/**
 * Get user statistics
 */
export const getUserStats = async () => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('role, assigned_branch')

		if (error) {
			console.error('Error fetching user stats:', error)
			throw error
		}

		const stats = {
			total: data?.length || 0,
			owners: data?.filter(u => u.role === 'owner').length || 0,
			employees: data?.filter(u => u.role === 'employee').length || 0,
			withBranch: data?.filter(u => u.assigned_branch).length || 0,
		}

		return { data: stats, error: null }
	} catch (error) {
		console.error('Unexpected error fetching user stats:', error)
		return { data: null, error }
	}
}

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<{ data: UserProfile | null; error: any }> => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('email', email)
			.single()

		if (error) {
			console.error('Error fetching user by email:', error)
			throw error
		}

		return { data, error: null }
	} catch (error) {
		console.error('Unexpected error fetching user by email:', error)
		return { data: null, error }
	}
}