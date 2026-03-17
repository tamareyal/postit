import type { AxiosError } from 'axios';
import api from './api';
import type { UserProfile } from './userService';
import type { CursorPageResponse } from '../components/general/usePaginatedFeed';

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
	sender_id?: string;
	sender?: UserProfile;
	createdAt: string;
	updatedAt?: string;
	commentsCount: number;
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

export type PostsPageResponse = CursorPageResponse<Post>;

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
