import api from './api';
import type { Post } from './postService';

export type UserProfile = {
	_id: string;
	name: string;
	email: string;
	image?: string;
};

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
