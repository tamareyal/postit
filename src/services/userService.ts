import api from './api';
import type { Post } from './postService';

export type UserProfile = {
	_id: string;
	name: string;
	email: string;
	image?: string;
};

export const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE';

// Deduplicates concurrent requests for the same user within a session.
const userCache = new Map<string, Promise<UserProfile>>();

export const fetchUserById = (id: string): Promise<UserProfile> => {
    if (!userCache.has(id)) {
        const request = api.get<UserProfile>(`/api/users/${id}`)
            .then(res => res.data)
            .catch(err => {
                userCache.delete(id);
                throw err; 
            });
                
        userCache.set(id, request);
    }
    
    return userCache.get(id)!;
};

export const getUserAvatarById = async (userId?: string): Promise<string> => {
	if (!userId) return DEFAULT_AVATAR;

	try {
		const profile = await fetchUserById(userId);
		return profile.image || DEFAULT_AVATAR;
	} catch {
		return DEFAULT_AVATAR;
	}
};

export const updateUserProfile = async (
	id: string,
	updates: { name?: string; image?: string },
): Promise<UserProfile> => {
	const res = await api.put<UserProfile>(`/api/users/${id}`, updates);
	userCache.delete(id);
	return res.data;
};

export const populateSenders = async (posts: Post[]): Promise<Post[]> => {
	const uniqueIds = [
		...new Set(posts.map(p => p.sender_id).filter((id): id is string => !!id)),
	];

	const userMap = new Map<string, UserProfile>();

	await Promise.allSettled(
		uniqueIds.map(id =>
			fetchUserById(id)
				.then(user => userMap.set(id, user))
				.catch((error) => {
                    console.error(`Failed to fetch user ${id}`, error)
                }),
		),
	);

	return posts.map(post => ({
		...post,
		sender: post.sender_id ? userMap.get(post.sender_id) : undefined,
	}));
};
