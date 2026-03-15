import type { AxiosError } from 'axios';
import api from './api';
import type { UserProfile } from './userService';

export type CreatePostPayload = {
	title: string;
	content: string;
	image?: string;
};

export type Post = {
	_id: string;
	title: string;
	content: string;
	image?: string | null;
	likes?: string[];
	sender_id?: string;
	sender?: UserProfile;
	createdAt: string;
	updatedAt?: string;
};

export const extractApiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
	const axiosError = error as AxiosError<{ message?: string }>;
	return axiosError.response?.data?.message || fallback;
};

export const createPost = async (payload: CreatePostPayload): Promise<Post> => {
	const res = await api.post<Post>('/api/posts', payload);
	return res.data;
};

export const fetchPosts = async (): Promise<Post[]> => {
	const res = await api.get<Post[]>('/api/posts');
	return res.data;
};

export type PostsPageResponse = {
	data: Post[];
	nextCursor: string | null;
	queryHash: string;
};

export const fetchPostsPage = async (
	limit: number,
	cursor?: string | null,
	queryHash?: string | null,
): Promise<PostsPageResponse> => {
	const params = new URLSearchParams();
	params.set('limit', String(limit));
	if (queryHash) {
		params.set('queryHash', queryHash);
	}
	if (cursor) {
		params.set('lastCreatedAt', cursor);
	}
	const res = await api.get<PostsPageResponse>(`/api/posts/page?${params.toString()}`);
	return res.data;
};

type ToggleLikeResponse =
	| number
	| { likes: number }
	| { likeCount: number };

export const togglePostLike = async (postId: string): Promise<number> => {
	const res = await api.put<ToggleLikeResponse>(`/api/posts/${postId}/like`);
	const payload = res.data;

	if (typeof payload === 'number') return payload;
	if ('likes' in payload) return payload.likes;
	if ('likeCount' in payload) return payload.likeCount;

	throw new Error('Unexpected like response format');
};
