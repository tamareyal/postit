import type { AxiosError } from 'axios';
import api from './api';

export type CreatePostPayload = {
	title: string;
	content: string;
	image?: string;
};

export type ApiPost = {
	id: string;
	title: string;
	content: string;
	image?: string | null;
	createdAt: string;
	sender?: {
		id: string;
		name?: string;
		username?: string;
		avatar?: string;
	};
};

export const extractApiErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
	const axiosError = error as AxiosError<{ message?: string }>;
	return axiosError.response?.data?.message || fallback;
};

export const createPost = async (payload: CreatePostPayload): Promise<ApiPost> => {
	const res = await api.post<ApiPost>('/api/posts', payload);
	return res.data;
};

export const fetchPosts = async (): Promise<ApiPost[]> => {
	const res = await api.get<ApiPost[]>('/api/posts');
	return res.data;
};
