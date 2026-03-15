import { useState, useEffect, useRef, useCallback } from 'react';
import type { AxiosError } from 'axios';
import PostCard from './PostCard';
import type { PostCardProps } from './PostCard';
import EmptyFeed, { type EmptyFeedProps } from './emptyFeed';
import BottomLoadingIndicator from '../general/BottomLoadingIndicator';
import { toStaticImageUrl } from '../../services/imageService';
import { useAuth } from '../../context/AuthContext';
import {
	extractApiErrorMessage,
	type Post,
	type PostsPageResponse,
	togglePostLike,
} from '../../services/postService';
import { populateSenders } from '../../services/userService';

const DEFAULT_PAGE_LIMIT = 10;
const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE';

export type FeedFetchParams = {
	limit: number;
	cursor: string | null;
	queryHash: string | null;
};

export type FeedProps = {
	fetchPage: (params: FeedFetchParams) => Promise<PostsPageResponse>;
	pageLimit?: number;
	refreshTrigger?: number;
	emptyStateProps?: EmptyFeedProps;
};

const getTimeAgo = (dateString?: string) => {
	if (!dateString) return 'Just now';

	const createdAt = new Date(dateString);
	if (Number.isNaN(createdAt.getTime())) return 'Just now';

	const seconds = Math.floor((Date.now() - createdAt.getTime()) / 1000);
	if (seconds < 60) return 'Just now';

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.floor(hours / 24);
	return `${days}d ago`;
};

const mapPostToCard = (post: Post, currentUserId?: string): PostCardProps => {
	const likesList = Array.isArray(post.likes) ? post.likes : [];

	return {
		postId: post._id,
		authorName: post.sender?.name || 'Unknown',
		authorAvatar: toStaticImageUrl(post.sender?.image) || DEFAULT_AVATAR,
		timeAgo: getTimeAgo(post.createdAt),
		title: post.title,
		content: post.content,
		image: toStaticImageUrl(post.image),
		likes: likesList.length,
		likedByCurrentUser: !!currentUserId && likesList.includes(currentUserId),
		comments: 0,
	};
};

export default function Feed({
	fetchPage,
	pageLimit = DEFAULT_PAGE_LIMIT,
	refreshTrigger = 0,
	emptyStateProps,
}: FeedProps) {
	const { user } = useAuth();
	const [posts, setPosts] = useState<PostCardProps[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [isFeedLoading, setIsFeedLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [feedError, setFeedError] = useState<string | null>(null);

	const bottomRef = useRef<HTMLDivElement>(null);
	const isFetchingRef = useRef(false);
	const seenIdsRef = useRef(new Set<string>());
	const queryHashRef = useRef<string | null>(null);

	const resetPagingSession = useCallback(() => {
		queryHashRef.current = null;
		seenIdsRef.current.clear();
		setNextCursor(null);
		setHasMore(true);
	}, []);

	const isInvalidQueryHashError = useCallback((err: unknown) => {
		const status = (err as AxiosError).response?.status;
		if (status !== 400) return false;

		const message = extractApiErrorMessage(err, '').toLowerCase();
		return message.includes('invalid queryhash');
	}, []);

	const handleToggleLike = useCallback(async (postId: string) => {
		return togglePostLike(postId);
	}, []);

	const loadPosts = useCallback(async (cursor: string | null, hasRetriedInvalidHash = false) => {
		if (isFetchingRef.current) return;
		isFetchingRef.current = true;

		const isFirstPage = cursor === null;

		if (isFirstPage) {
			setIsFeedLoading(true);
			setFeedError(null);
			resetPagingSession();
		} else {
			setIsLoadingMore(true);
		}

		try {
			const res = await fetchPage({
				limit: pageLimit,
				cursor,
				queryHash: isFirstPage ? null : queryHashRef.current,
			});

			const populated = await populateSenders(res.data);
			queryHashRef.current = res.queryHash;

			const newCards = populated
				.filter(post => !seenIdsRef.current.has(post._id))
				.map(post => {
					seenIdsRef.current.add(post._id);
					return mapPostToCard(post, user?.id);
				});

			if (isFirstPage) {
				setPosts(newCards);
			} else {
				setPosts(prev => [...prev, ...newCards]);
			}

			setNextCursor(res.nextCursor);
			setHasMore(res.nextCursor !== null);
			isFetchingRef.current = false;

			if (isFirstPage) setIsFeedLoading(false);
			else setIsLoadingMore(false);
		} catch (err) {
			const status = (err as AxiosError).response?.status;
			const isInvalidHash = isInvalidQueryHashError(err);

			isFetchingRef.current = false;

			if (isFirstPage) setIsFeedLoading(false);
			else setIsLoadingMore(false);

			if (isInvalidHash && !hasRetriedInvalidHash) {
				resetPagingSession();
				void loadPosts(null, true);
				return;
			}

			if (!isFirstPage && status === 400) {
				resetPagingSession();
				void loadPosts(null, hasRetriedInvalidHash);
				return;
			}

			if (isFirstPage) {
				setFeedError(extractApiErrorMessage(err, 'Failed to load posts.'));
				setPosts([]);
			}

			setHasMore(false);
		}
	}, [fetchPage, isInvalidQueryHashError, pageLimit, resetPagingSession, user?.id]);

	useEffect(() => {
		void loadPosts(null);
	}, [loadPosts, refreshTrigger]);

	useEffect(() => {
		if (!hasMore || posts.length === 0) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isFetchingRef.current) {
					void loadPosts(nextCursor);
				}
			},
			{ threshold: 1.0 }
		);

		if (bottomRef.current) observer.observe(bottomRef.current);
		return () => observer.disconnect();
	}, [hasMore, loadPosts, nextCursor, posts.length]);

	return (
		<>
			{feedError && (
				<div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3" role="alert">
					<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
					<span className="small fw-semibold">{feedError}</span>
				</div>
			)}

			{isFeedLoading ? (
				<div className="d-flex justify-content-center py-5">
					<div className="spinner-border text-secondary" role="status">
						<span className="visually-hidden">Loading posts…</span>
					</div>
				</div>
			) : posts.length === 0 ? (
				<EmptyFeed {...emptyStateProps} />
			) : (
				posts.map((post, i) => (
					<PostCard key={post.postId || i} {...post} onToggleLike={handleToggleLike} />
				))
			)}

			<div ref={bottomRef} />
			{isLoadingMore && <BottomLoadingIndicator />}
		</>
	);
}
