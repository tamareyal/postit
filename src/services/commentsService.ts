import api from './api';
import type { CursorPageResponse } from '../components/general/usePaginatedFeed';
import { extractApiErrorMessage } from './postService';
import { fetchUserById, type UserProfile } from './userService';

export type Comment = {
	_id: string;
	message?: string;
	sender_id?: string;
	sender?: UserProfile;
	createdAt?: string;
	updatedAt?: string;
};

export type CreateCommentPayload = {
	post_id: string;
	message: string;
};

export type CommentsPageResponse = CursorPageResponse<Comment>;

export const createComment = async (payload: CreateCommentPayload): Promise<Comment> => {
	const res = await api.post<Comment>('/api/comments', payload);
	return res.data;
};

export const fetchCommentsPageByPostId = async (
	postId: string,
	limit: number,
	cursor?: string | null,
	queryHash?: string | null,
	signal?: AbortSignal
): Promise<CommentsPageResponse> => {
	const params = new URLSearchParams();
	params.set('limit', String(limit));
	if (queryHash) {
		params.set('queryHash', queryHash);
	}
	if (cursor) {
		params.set('lastCreatedAt', cursor);
	}

	const res = await api.get<CommentsPageResponse>(`/api/comments/posts/${postId}?${params.toString()}`, { signal });
	return res.data;
};

export const populateCommentSenders = async (comments: Comment[]): Promise<Comment[]> => {
	const uniqueIds = [
		...new Set(comments.map(comment => comment.sender_id).filter((id): id is string => !!id)),
	];

	const userMap = new Map<string, UserProfile>();

	await Promise.allSettled(
		uniqueIds.map(id =>
			fetchUserById(id)
				.then(user => userMap.set(id, user))
				.catch((error) => {
					console.error(`Failed to fetch user ${id}`, error);
				}),
		),
	);

	return comments.map(comment => ({
		...comment,
		sender: comment.sender_id ? userMap.get(comment.sender_id) : undefined,
	}));
};

export const extractCommentsErrorMessage = (error: unknown) => {
	return extractApiErrorMessage(error, 'Failed to load comments.');
};
